<?php

namespace App\Models\POS;

use App\Models\Concerns\BelongsToOrganization;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PosSession extends Model
{
    use BelongsToOrganization;
    protected $table = 'pos_sessions';

    protected $fillable = [
        'organization_id',
        'register_id', 'user_id', 'status', 'opened_at', 'closed_at',
        'opening_cash', 'closing_cash', 'expected_cash', 'variance', 'notes',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'opening_cash' => 'decimal:2',
        'closing_cash' => 'decimal:2',
        'expected_cash' => 'decimal:2',
        'variance' => 'decimal:2',
    ];

    public function register(): BelongsTo
    {
        return $this->belongsTo(PosRegister::class, 'register_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(PosSale::class, 'session_id');
    }
}
