<?php

namespace App\Models\HR;

use App\Models\Concerns\BelongsToOrganization;

use Illuminate\Database\Eloquent\Model;

class OrgChart extends Model
{
    use BelongsToOrganization;
    protected $table = 'hr_org_charts';
    // Define org chart relationships and attributes as needed
}
