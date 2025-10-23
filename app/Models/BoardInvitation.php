<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'board_id',
        'email',
        'token',
        'status',
        'invited_by',
    ];

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function board()
    {
        return $this->belongsTo(Board::class);
    }
}
