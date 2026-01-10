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
        'company_id',
];

    public function card()
    {
        return $this->belongsTo(BoardCard::class, 'card_id');
    }

    public function relatedCard()
    {
        return $this->belongsTo(BoardCard::class, 'related_card_id');
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
