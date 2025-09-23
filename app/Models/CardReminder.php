<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardReminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'user_id',
        'remind_at',
        'note',
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
