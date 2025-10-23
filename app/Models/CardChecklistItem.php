<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardChecklistItem extends Model
{
    use HasFactory;


    protected $fillable = [
        'card_checklist_id',
        'title',
        'is_completed',
    ];

    public function checklist()
    {
        return $this->belongsTo(CardChecklist::class, 'card_checklist_id');
    }
}
