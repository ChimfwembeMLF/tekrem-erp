<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardRelation extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'related_card_id',
        'type',
    ];

    public function card()
    {
        return $this->belongsTo(BoardCard::class, 'card_id');
    }

    public function relatedCard()
    {
        return $this->belongsTo(BoardCard::class, 'related_card_id');
    }
}
