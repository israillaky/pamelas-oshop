<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Throwable;

class AuditLogController extends Controller
{
    /**
     * Only super_admin + admin can view audit logs.
     */
    protected function ensureAllowed(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! in_array($user->role, ['super_admin', 'admin'], true)) {
            return response()->json([
                'message' => 'Forbidden. Only super admin or admin can view audit logs.',
            ], 403);
        }

        return null;
    }

    /**
     * GET /api/v1/audit-logs
     *
     * Query params:
     * - search     : free-text (action/description/module)
     * - module     : filter by module (e.g. users, products, stock_in, etc.)
     * - action     : filter by action (created, updated, deleted, stock_in, stock_out, etc.)
     * - user_id    : filter by who performed it
     * - date_from  : Y-m-d
     * - date_to    : Y-m-d
     * - per_page   : 5, 10, 25 (default 10)
     * - sort_dir   : asc|desc (default desc, on created_at)
     */
    public function index(Request $request)
    {
        if ($response = $this->ensureAllowed($request)) {
            return $response;
        }

        try {
            $search    = $request->query('search');
            $module    = $request->query('module');
            $action    = $request->query('action');
            $userId    = $request->query('user_id');
            $dateFrom  = $request->query('date_from');
            $dateTo    = $request->query('date_to');

            // per_page (5, 10, 25)
            $allowedPerPage = [10, 15, 25];
            $perPage = (int) $request->query('per_page', 10);
            if (! in_array($perPage, $allowedPerPage, true)) {
                $perPage = 10;
            }

            // sort_dir (asc/desc)
            $sortDir = strtolower($request->query('sort_dir', 'desc'));
            if (! in_array($sortDir, ['asc', 'desc'], true)) {
                $sortDir = 'desc';
            }

            $logs = AuditLog::with('user')
                ->when($search, function ($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                      ->orWhere('module', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                })
                ->when($module, fn($q) => $q->where('module', $module))
                ->when($action, fn($q) => $q->where('action', $action))
                ->when($userId, fn($q) => $q->where('user_id', $userId))
                ->when($dateFrom, fn($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->orderBy('created_at', $sortDir)
                ->paginate($perPage);

            return response()->json($logs);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to load audit logs.',
            ], 500);
        }
    }

    /**
     * GET /api/v1/audit-logs/{auditLog}
     */
    public function show(Request $request, AuditLog $auditLog)
    {
        if ($response = $this->ensureAllowed($request)) {
            return $response;
        }

        try {
            $auditLog->load('user');

            return response()->json([
                'data' => $auditLog,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to load audit log entry.',
            ], 500);
        }
    }
}
