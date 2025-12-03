<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Epic extends Model
{
    use HasFactory;

    protected $fillable = [
        'board_id',
        'name',
        'description',
        'color',
    ];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function cards()
    {
        return $this->hasMany(BoardCard::class, 'epic_id');
    }

    /**
     * Get the releases associated with this epic.
     */
    public function releases()
    {
        return $this->belongsToMany(Release::class, 'epic_release')
            ->withTimestamps();
    }
}
