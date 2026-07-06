<?php

namespace App\Models\HR;

use App\Models\Concerns\BelongsToOrganization;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = [
        'organization_id',
        'title',
        'file_path',
        'description',
        'owner_id',
    ];

    protected $table = 'hr_documents';
}
