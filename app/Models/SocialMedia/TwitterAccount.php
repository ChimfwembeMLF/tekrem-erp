<?php

namespace App\Models\SocialMedia;

use Illuminate\Database\Eloquent\Model;

class TwitterAccount extends Model
{
    protected $fillable = [
        'user_id',
        'twitter_id',
        'username',
        'access_token',
        'access_token_secret',
        'profile_image',
        'followers_count',
        'following_count',
        'company_id',
    ];


    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
