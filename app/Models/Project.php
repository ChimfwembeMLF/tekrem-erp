<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Project extends Model   
{

    use HasFactory;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($project) {
            if (empty($project->slug) && !empty($project->name)) {
                $baseSlug = Str::slug($project->name);
                $slug = $baseSlug;
                $i = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $i++;
                }
                $project->slug = $slug;
            }
        });
    }

    protected $fillable = [
        'name',
        'slug',
        'description',
        'owner_id',
        'client_id',
        'visibility',
        'color',
        'status',
        'start_date',
        'end_date',
        'settings',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'settings' => 'array',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function boards()
    {
        return $this->hasMany(Board::class);
    }

    // Example: members, activities, files, etc. can be added as needed
}
