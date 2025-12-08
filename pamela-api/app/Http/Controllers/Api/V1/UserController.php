<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\LogActivityTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Throwable;

class UserController extends Controller
{
    use LogActivityTrait;

    /**
     * Ensure current user is authenticated.
     */
    protected function ensureAuthenticated(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        return null;
    }

    /**
     * Ensure current user is admin OR super_admin.
     * (Used for viewing users: index/show)
     */
    protected function ensureAdminOrSuperAdmin(Request $request)
    {
        if ($response = $this->ensureAuthenticated($request)) {
            return $response;
        }

        $user = $request->user();

        if (! in_array($user->role, ['super_admin', 'admin'], true)) {
            return response()->json([
                'message' => 'Forbidden. Only admin or super admin can access this resource.',
            ], 403);
        }

        return null;
    }

    /**
     * Ensure current user is super_admin only.
     * (Used for create/update/delete)
     */
    protected function ensureSuperAdmin(Request $request)
    {
        if ($response = $this->ensureAuthenticated($request)) {
            return $response;
        }

        $user = $request->user();

        if (! in_array($user->role, ['super_admin', 'admin'], true)) {
            return response()->json([
                'message' => 'Forbidden. Only super admin can access this resource.',
            ], 403);
        }

        return null;
    }

    /**
     * GET /api/v1/users
     * Admin + super_admin can view list.
     */
    public function index(Request $request)
    {
        if ($response = $this->ensureAdminOrSuperAdmin($request)) {
            return $response;
        }
        $user = $request->user();

        $allowedPerPage = [10, 15, 25];
        $perPage = (int) $request->query('per_page', 10);
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }

        $sort = strtolower($request->query('sort', 'desc')) === 'asc' ? 'asc' : 'desc';

        // Base query
        $query = User::query();

        // ADMIN — hide super_admin from results
        if ($user->role === 'admin') {
            $query->where('role', '!=', 'super_admin');
        }

        // SUPER ADMIN — see all
        // (No additional filtering)

        $users = $query->orderBy('id', $sort)->paginate($perPage);

        return response()->json($users);
    }

    /**
     * POST /api/v1/users
     * Super admin only.
     */
    public function store(Request $request)
    {
        if ($response = $this->ensureSuperAdmin($request)) {
            return $response;
        }

        try {
            $validated = $request->validate([
                'name'     => ['required', 'string', 'max:255'],
                'username' => ['required', 'string', 'max:50', 'unique:users,username'],
                'email'    => ['nullable', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'min:6'],
                'role'     => ['required', Rule::in(['admin', 'staff', 'warehouse_manager','warehouse_staff','cashier'])],
            ]);

            $validated['password'] = Hash::make($validated['password']);

            $user = User::create($validated);

            $this->logActivity(
                'created',
                'users',
                "API: User created via admin panel: {$user->name} (ID: {$user->id})"
            );

            return response()->json([
                'message' => 'User created successfully.',
                'data'    => $user,
            ], 201);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to create user.',
            ], 500);
        }
    }

    /**
     * GET /api/v1/users/{user}
     * Admin + super_admin can view a single user.
     */
    public function show(Request $request, User $user)
    {
        if ($response = $this->ensureAdminOrSuperAdmin($request)) {
            return $response;
        }

        return response()->json([
            'data' => $user,
        ]);
    }

    /**
     * PUT/PATCH /api/v1/users/{user}
     * Super admin only.
     */
    public function update(Request $request, User $user)
    {
        if ($response = $this->ensureSuperAdmin($request)) {
            return $response;
        }

        try {
            $validated = $request->validate([
                'name'     => ['required', 'string', 'max:255'],
                'username' => [
                    'required', 'string', 'max:50',
                    Rule::unique('users', 'username')->ignore($user->id),
                ],
                'email'    => [
                    'nullable', 'email', 'max:255',
                    Rule::unique('users', 'email')->ignore($user->id),
                ],
                'password' => ['nullable', 'string', 'min:6'],
                'role'     => ['required', Rule::in(['super_admin', 'admin', 'staff', 'warehouse_manager','warehouse_staff','cashier'])],
            ]);

            // Prevent changing role of super admin to something else
            if (
                $user->role === 'super_admin' &&
                array_key_exists('role', $validated) &&
                $validated['role'] !== 'super_admin'
            ) {
                return response()->json([
                    'message' => 'You cannot change the role of the super admin.',
                ], 422);
            }

            if (empty($validated['password'])) {
                unset($validated['password']);
            } else {
                $validated['password'] = Hash::make($validated['password']);
            }

            $user->update($validated);

            $this->logActivity(
                'updated',
                'users',
                "API: User updated via admin panel: {$user->name} (ID: {$user->id})"
            );

            return response()->json([
                'message' => 'User updated successfully.',
                'data'    => $user,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to update user.',
            ], 500);
        }
    }

    /**
     * DELETE /api/v1/users/{user}
     * Super admin only.
     */
    public function destroy(Request $request, User $user)
    {
        if ($response = $this->ensureSuperAdmin($request)) {
            return $response;
        }

        try {
            if ($user->id === $request->user()->id) {
                return response()->json([
                    'message' => "You can't delete your own account.",
                ], 422);
            }

            if ($user->role === 'super_admin') {
                return response()->json([
                    'message' => "You can't delete the super admin account.",
                ], 422);
            }

            $this->logActivity(
                'deleted',
                'users',
                "API: User deleted via admin panel: {$user->name} (ID: {$user->id})"
            );

            $user->delete();

            return response()->json([
                'message' => 'User deleted successfully.',
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to delete user.',
            ], 500);
        }
    }
}
