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
        'company_id',
];

    protected $table = 'whatsapp_accounts';


    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
