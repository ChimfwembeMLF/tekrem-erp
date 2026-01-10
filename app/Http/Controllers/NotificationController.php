<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $notifications = $user->notifications()
            ->where('company_id', $user->company_id)
            ->with('notifiable')
            ->latest()
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Notification $notification)
    {
        $user = Auth::user();
        // Check if the notification belongs to the authenticated user and company
        if ($notification->user_id !== $user->id || $notification->company_id !== $user->company_id) {
            abort(404);
        }

        $notification->markAsRead();

        return redirect()->back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        $user->notifications()->where('company_id', $user->company_id)->update(['is_read' => true]);

        return redirect()->back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Delete a notification.
     */
    public function destroy(Notification $notification)
    {
        $user = Auth::user();
        // Check if the notification belongs to the authenticated user and company
        if ($notification->user_id !== $user->id || $notification->company_id !== $user->company_id) {
            abort(404);
        }

        $notification->delete();

        return redirect()->back()->with('success', 'Notification deleted.');
    }
}
