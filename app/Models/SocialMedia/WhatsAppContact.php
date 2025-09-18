<?php

namespace App\Models\SocialMedia;

use Illuminate\Database\Eloquent\Model;

class WhatsAppContact extends Model
{
    protected $fillable = [
        'whatsapp_account_id',
        'name',
        'phone_number',
        'profile_image',
        'status',
    ];

    protected $table = 'Whatsapp_contacts';

    public function account() {
        return $this->belongsTo(WhatsAppAccount::class);
    }
}
