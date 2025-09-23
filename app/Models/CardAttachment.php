<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'user_id',
        'filename',
        'path',
        'mime_type',
        'size',
    ];

    public function card()
    {
        return $this->belongsTo(BoardCard::class, 'card_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
