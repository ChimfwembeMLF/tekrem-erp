<?php

namespace App\Models\SocialMedia;

use Illuminate\Database\Eloquent\Model;

class WhatsAppMessage extends Model
{
    protected $fillable = [
        'whatsapp_account_id',
        'to',
        'content',
        'delivered',
    ];

    protected $table = 'whatsapp_messages';
}
