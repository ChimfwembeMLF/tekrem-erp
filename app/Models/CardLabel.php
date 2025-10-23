<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardLabel extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'label_id',
    ];

    public function card()
    {
        return $this->belongsTo(BoardCard::class, 'card_id');
    }

    public function label()
    {
        return $this->belongsTo(Label::class, 'label_id');
    }
}
