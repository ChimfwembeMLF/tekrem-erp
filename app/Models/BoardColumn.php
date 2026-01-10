<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardColumn extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'board_id',
        'name',
        'order',
        'color',
        'is_done_column',
        'company_id',
];

    /**
     * Get the company that owns the board column.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    protected $casts = [
        'is_done_column' => 'boolean',
    ];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function cards()
    {
        return $this->hasMany(BoardCard::class, 'column_id');
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
