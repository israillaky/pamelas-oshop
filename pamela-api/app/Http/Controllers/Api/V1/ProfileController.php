<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\LogActivityTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Throwable;

class ProfileController extends Controller
{
    use LogActivityTrait;

    /**
     * Ensure there is an authenticated user and return it.
     */
    protected function getAuthenticatedUserOrJson(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return [null, response()->json(['message' => 'Unauthenticated.'], 401)];
        }

        return [$user, null];
    }

    /**
     * GET /api/v1/me
     * Return current authenticated user.
     */
    public function show(Request $request)
    {
        [$user, $error] = $this->getAuthenticatedUserOrJson($request);
        if ($error) {
            return $error;
        }

        return response()->json([
            'data' => $user,
        ]);
    }

    /**
     * PUT/PATCH /api/v1/me
     * Update basic profile fields: name, username, email.
     */
    public function update(Request $request)
    {
        [$user, $error] = $this->getAuthenticatedUserOrJson($request);
        if ($error) {
            return $error;
        }

        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'username' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('users', 'username')->ignore($user->id),
                ],
                'email' => [
                    'nullable',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email')->ignore($user->id),
                ],
                // we intentionally do NOT allow role change here
            ]);

            $user->update($validated);

            $this->logActivity(
                'updated_profile',
                'users',
                "User updated profile: {$user->name} (ID: {$user->id})"
            );

            return response()->json([
                'message' => 'Profile updated.',
                'data'    => $user,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to update profile.',
            ], 500);
        }
    }

    /**
     * PUT /api/v1/me/password
     * Change current user's password.
     *
     * Body:
     * - current_password
     * - password
     * - password_confirmation
     */
    public function updatePassword(Request $request)
    {
        [$user, $error] = $this->getAuthenticatedUserOrJson($request);
        if ($error) {
            return $error;
        }

        try {
            $validated = $request->validate([
                'current_password'      => ['required', 'string'],
                'password'              => ['required', 'string', 'min:6', 'confirmed'],
            ]);

            if (! Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect.',
                ], 422);
            }

            $user->password = Hash::make($validated['password']);
            $user->save();

            $this->logActivity(
                'changed_password',
                'users',
                "User changed password: {$user->name} (ID: {$user->id})"
            );

            return response()->json([
                'message' => 'Password updated.',
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to update password.',
            ], 500);
        }
    }

    /**
     * DELETE /api/v1/me
     * Delete own account.
     *
     * Rules:
     * - Cannot delete super_admin user.
     */
    public function destroy(Request $request)
    {
        [$user, $error] = $this->getAuthenticatedUserOrJson($request);
        if ($error) {
            return $error;
        }

        // protect super_admin from deletion
        if ($user->role === 'super_admin') {
            return response()->json([
                'message' => 'You cannot delete the super admin account.',
            ], 422);
        }

        try {
            $userId = $user->id;
            $userName = $user->name;

            // If you are using Sanctum tokens, you may want to revoke tokens here:
            // $user->tokens()->delete();

            $user->delete();

            $this->logActivity(
                'deleted_self',
                'users',
                "User deleted own account: {$userName} (ID: {$userId})"
            );

            return response()->json([
                'message' => 'Account deleted.',
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to delete account.',
            ], 500);
        }
    }
}
