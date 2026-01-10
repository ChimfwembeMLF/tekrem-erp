<?php

namespace App\Models\SocialMedia;

use Illuminate\Database\Eloquent\Model;

class WhatsAppChat extends Model
{
    protected $fillable = [
        'whatsapp_account_id',
        'contact_id',
        'is_group',
        'group_name',
        'group_image',
        'company_id',
];

    protected $table = 'whatsapp_chats';

    public function account() {
        return $this->belongsTo(WhatsAppAccount::class);
    }
    public function contact() {
        return $this->belongsTo(WhatsAppContact::class);
    }
    public function messages() {
        return $this->hasMany(WhatsAppMessage::class, 'chat_id');
    }


    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
