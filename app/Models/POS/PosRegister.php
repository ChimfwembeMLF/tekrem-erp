<?php

namespace App\Models\POS;

use App\Models\Concerns\BelongsToOrganization;

use App\Models\Inventory\Warehouse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PosRegister extends Model
{
    use BelongsToOrganization;
    protected $table = 'pos_registers';

    protected $fillable = ['name', 'warehouse_id', 'is_active', 'access_pin'];

    protected $hidden = ['access_pin'];

    protected $casts = ['is_active' => 'boolean'];

    protected $appends = ['requires_pin'];

    public function getRequiresPinAttribute(): bool
    {
        return !empty($this->access_pin);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(PosSession::class, 'register_id');
    }
}
