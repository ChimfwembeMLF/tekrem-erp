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
        'company_id',
];

    protected $table = 'Whatsapp_contacts';

    public function account() {
        return $this->belongsTo(WhatsAppAccount::class);
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
