<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardChecklistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_checklist_id',
        'checklist_id',
        'title',
        'is_completed',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
    ];

    protected $appends = [
        'name',
        'completed',
    ];

    public function checklist()
    {
        return $this->belongsTo(CardChecklist::class, 'checklist_id');
    }

    protected function name(): Attribute
    {
        return Attribute::get(fn () => $this->title);
    }

    protected function completed(): Attribute
    {
        return Attribute::get(fn () => (bool) $this->is_completed);
    }
}
