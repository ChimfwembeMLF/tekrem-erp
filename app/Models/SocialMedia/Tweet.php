<?php

namespace App\Models\SocialMedia;

use Illuminate\Database\Eloquent\Model;

class Tweet extends Model
{
    protected $fillable = [
        'twitter_account_id',
        'tweet_id',
        'text',
        'media_url',
        'created_at',
        'published',
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
