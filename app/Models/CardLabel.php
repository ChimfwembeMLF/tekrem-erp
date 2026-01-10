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
        'company_id',
];

    public function card()
    {
        return $this->belongsTo(BoardCard::class, 'card_id');
    }

    public function label()
    {
        return $this->belongsTo(Label::class, 'label_id');
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
