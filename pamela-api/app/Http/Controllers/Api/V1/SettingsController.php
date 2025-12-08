<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use App\Traits\LogActivityTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Throwable;

class SettingsController extends Controller
{
    use LogActivityTrait;

    protected SettingsService $settings;

    public function __construct(SettingsService $settings)
    {
        $this->settings = $settings;
    }

    /**
     * Ensure current user is authenticated and super_admin.
     */
    protected function ensureSuperAdmin(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== ['super_admin','admin']) {
            return response()->json([
                'message' => 'Forbidden. Only super admin can manage settings.',
            ], 403);
        }

        return null;
    }

    /**
     * GET /api/v1/settings
     *
     * Return all settings as JSON.
     */
    public function index(Request $request)
    {
        if ($response = $this->ensureSuperAdmin($request)) {
            return $response;
        }

        try {
            $settings = $this->settings->all();

            return response()->json([
                'data' => $settings,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to load settings.',
            ], 500);
        }
    }

    /**
     * PUT/PATCH /api/v1/settings
     *
     * Accepts:
     * - company_name (required string)
     * - company_logo (optional image, max 2MB)
     */
    public function update(Request $request)
    {
        if ($response = $this->ensureSuperAdmin($request)) {
            return $response;
        }

        try {
            $current = $this->settings->all();

            $validated = $request->validate([
                'company_name' => ['required', 'string', 'max:255'],
                'company_logo' => ['nullable', 'image', 'max:2048'],
            ]);

            $newLogoPath = $current['company_logo'] ?? null;

            if ($request->hasFile('company_logo')) {
                // delete old logo if exists
                if ($newLogoPath && Storage::disk('public')->exists($newLogoPath)) {
                    Storage::disk('public')->delete($newLogoPath);
                }

                // store new logo
                $newLogoPath = $request->file('company_logo')->store(
                    'company-logos',
                    'public'
                );
            }

            $payload = [
                'company_name' => $validated['company_name'],
                'company_logo' => $newLogoPath,
            ];

            $this->settings->update($payload);

            $this->logActivity(
                'updated',
                'settings',
                'Updated system settings.'
            );

            return response()->json([
                'message' => 'Settings updated successfully.',
                'data'    => $payload,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to update settings.',
            ], 500);
        }
    }
}
