<?php

namespace App\Services\Support;

use App\Events\SupportChatStaffAlert;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class SupportChatStaffNotifier
{
    /**
     * Support staff first (staff/manager with support permissions), then developers (admin/super_user).
     */
    public static function recipients(): Collection
    {
        $supportStaff = User::permission('view support')
            ->whereHas('roles', function ($query) {
                $query->whereIn('name', ['staff', 'manager']);
            })
            ->get();

        if ($supportStaff->isNotEmpty()) {
            return new Collection($supportStaff->unique('id')->values());
        }

        $developers = User::role(['super_user', 'admin'])->get();

        return new Collection($developers->unique('id')->values());
    }

    public static function notify(
        User $requester,
        string $conversationId,
        string $event,
        string $messagePreview,
        bool $hasAttachments = false,
        ?string $link = null,
    ): void {
        $recipients = self::recipients();

        if ($recipients->isEmpty()) {
            return;
        }

        $link ??= route('support.dashboard');
        $attachmentNote = $hasAttachments ? ' (includes attachment(s))' : '';
        $notificationMessage = "{$requester->name} — {$messagePreview}{$attachmentNote}";

        foreach ($recipients as $recipient) {
            if ($recipient->id === $requester->id) {
                continue;
            }

            $notification = NotificationService::create(
                $recipient,
                'support_chat',
                $notificationMessage,
                $link,
            );

            if (!$notification) {
                continue;
            }

            broadcast(new SupportChatStaffAlert(
                userId: $recipient->id,
                payload: [
                    'id' => $notification->id,
                    'type' => 'support_chat',
                    'message' => $notificationMessage,
                    'link' => $link,
                    'conversation_id' => $conversationId,
                    'requester_name' => $requester->name,
                    'requester_id' => $requester->id,
                    'has_attachments' => $hasAttachments,
                    'event' => $event,
                    'created_at' => $notification->created_at?->toISOString(),
                ],
            ));
        }
    }

    public static function previewMessage(string $message, bool $hasAttachments): string
    {
        $text = trim($message);

        if ($text !== '') {
            return Str::limit($text, 120);
        }

        return $hasAttachments ? 'Sent attachment(s) via support chat' : 'New support chat activity';
    }
}
