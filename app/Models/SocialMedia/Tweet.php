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
    ];
}
