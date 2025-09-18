<?php

namespace App\Models\SocialMedia;

use Illuminate\Database\Eloquent\Model;

class WhatsAppAccount extends Model
{
    protected $fillable = [
        'user_id',
        'whatsapp_id',
        'business_name',
        'access_token',
        'phone_number',
        'profile_image',
    ];

    protected $table = 'whatsapp_accounts';
}
