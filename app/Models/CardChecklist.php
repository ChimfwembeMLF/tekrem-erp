<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardChecklist extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'title',
        'company_id',
];

    public function card()
    {
        return $this->belongsTo(BoardCard::class, 'card_id');
    }

    public function items()
    {
        return $this->hasMany(CardChecklistItem::class, 'checklist_id');
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
