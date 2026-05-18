<?php

use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('client.{clientId}', function (User $user, $clientId) {
    $client = Client::find($clientId);
    if (!$client) return false;
    return $user->hasRole(['super_user', 'admin', 'staff']) || $user->id === $client->user_id;
});

Broadcast::channel('lead.{leadId}', function (User $user, $leadId) {
    $lead = Lead::find($leadId);
    if (!$lead) return false;
    return $user->hasRole(['super_user', 'admin', 'staff']) || $user->id === $lead->user_id;
});

Broadcast::channel('user.{userId}', function (User $user, $userId) {
    return (int) $user->id === (int) $userId;
});

// ─── Conversation channel ─────────────────────────────────────────────────────
// Covers: staff/admin, CRM participants, AND customer portal users
Broadcast::channel('conversation.{conversationId}', function (User $user, $conversationId) {
    $conversation = Conversation::with('conversable')->find($conversationId);
    if (!$conversation) return false;

    // ── Staff / CRM side ──────────────────────────────────────────────────────
    if ($user->hasRole(['super_user', 'admin', 'staff'])) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    if ($conversation->created_by === $user->id || $conversation->assigned_to === $user->id) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    if ($conversation->hasParticipant($user->id)) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    // ── Customer portal side ──────────────────────────────────────────────────
    // Conversation belongs directly to this user
    if ($conversation->conversable_type === get_class($user)
        && $conversation->conversable_id === $user->id) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    // Conversation belongs to the user's client
    $client = $user->client ?? $user->clients()->first();

    if ($client
        && $conversation->conversable_type === get_class($client)
        && $conversation->conversable_id === $client->id) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    // Conversation belongs to a project under the user's client
    if ($client && $conversation->conversable_type === 'App\\Models\\Project') {
        $projectIds = $client->projects()->pluck('id')->toArray();
        if (in_array($conversation->conversable_id, $projectIds)) {
            return ['id' => $user->id, 'name' => $user->name];
        }
    }

    return false;
});

Broadcast::channel('guest-chat', function (User $user) {
    return $user->hasRole(['super_user', 'admin', 'staff']);
});

Broadcast::channel('guest-session.{sessionId}', function ($user, $sessionId) {
    if ($user instanceof User) {
        return $user->hasRole(['super_user', 'admin', 'staff']);
    }
    return true;
});