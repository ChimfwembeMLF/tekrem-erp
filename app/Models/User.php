<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Models\HR\Department;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use HasProfilePhoto;
    use HasRoles {
        HasRoles::hasPermissionTo as spatieHasPermissionTo;
    }
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'firebase_uid',
        'current_organization_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
        'user_roles',
        'user_permissions'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Return a safe profile photo URL. If the stored file is missing, fall back
     * to the default avatar URL instead of returning a broken /storage URL.
     */
    protected function profilePhotoUrl(): Attribute
    {
        return Attribute::get(function (): string {
            if (! $this->profile_photo_path) {
                return $this->defaultProfilePhotoUrl();
            }

            $disk = $this->profilePhotoDisk();

            if (! Storage::disk($disk)->exists($this->profile_photo_path)) {
                return $this->defaultProfilePhotoUrl();
            }

            return Storage::url($this->profile_photo_path);
        });
    }

        /**
     * Organizations this user belongs to (multi-tenant).
     */
    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class, 'organization_user')
            ->withPivot(['role', 'is_default', 'invited_at', 'accepted_at'])
            ->withTimestamps();
    }

    public function currentOrganization(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Organization::class, 'current_organization_id');
    }

    public function organizationRole(?Organization $organization = null): ?string
    {
        $organization ??= $this->currentOrganization;

        if (! $organization) {
            return null;
        }

        if ($this->isSuperUser()) {
            return 'owner';
        }

        return $organization->users()
            ->where('users.id', $this->id)
            ->value('organization_user.role');
    }

    /**
     * Get the client owned by the user (one-to-one).
     */
    public function client()
    {
        return $this->hasOne(Client::class);
    }

    /**
     * Get all projects for the user's client.
     */
    public function clientProjects()
    {
        return $this->hasManyThrough(
            Project::class,    // The final model
            Client::class,     // The intermediate model
            'user_id',         // Foreign key on Client table...
            'client_id',       // Foreign key on Project table...
            'id',              // Local key on User table...
            'id'               // Local key on Client table...
        );
    }

    /**
     * Cards this user is watching.
     */
    public function cardWatchers()
    {
        return $this->hasMany(\App\Models\CardWatcher::class, 'user_id');
    }

    /**
     * Override hasPermissionTo so super_user and admin have all permissions.
     */
    public function hasPermissionTo($permission, $guardName = null): bool
    {
        if ($this->hasRole(['super_user', 'admin'])) {
            return true;
        }
        return $this->spatieHasPermissionTo($permission, $guardName);
    }

    /**
     * The departments that the user belongs to.
     */
    public function departments(): BelongsToMany
    {
        return $this->belongsToMany(Department::class, 'department_user', 'user_id', 'department_id');
    }

    /**
     * Get the clients for the user.
     */
    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    /**
     * Get the leads for the user.
     */
    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    /**
     * Get the communications created by the user.
     */
    public function communications()
    {
        return $this->hasMany(Communication::class);
    }

    /**
     * Get the chat messages sent by the user.
     */
    public function sentChats()
    {
        return $this->hasMany(Chat::class, 'user_id');
    }

    /**
     * Get the chat messages received by the user.
     */
    public function receivedChats()
    {
        return $this->hasMany(Chat::class, 'recipient_id');
    }

    /**
     * Get the notifications for the user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get the unread notifications for the user.
     */
    public function unreadNotifications()
    {
        return $this->notifications()->unread();
    }

    /**
     * Get the notification preferences for the user.
     */
    public function notificationPreferences()
    {
        return $this->hasOne(UserNotificationPreference::class);
    }

    /**
     * Get or create notification preferences for the user.
     */
    public function getNotificationPreferences(): UserNotificationPreference
    {
        return UserNotificationPreference::getOrCreateForUser($this->id);
    }

   /**
     * The custom roles that belong to the user.
     * This is different from Spatie's roles() method.
     */
    public function customRoles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    /**
     * The permissions that belong to the user directly.
     */
    public function directPermissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class);
    }



    /**
     * Check if the user has a specific permission directly.
     *
     * @param string $permission
     * @return bool
     */
    public function hasDirectPermission(string $permission): bool
    {
        return $this->directPermissions()->where('name', $permission)->exists();
    }

    /**
     * Get the user roles attribute for frontend.
     *
     * @return array
     */
    public function getUserRolesAttribute(): array
    {
        // Use Spatie's getRoleNames() method which returns a collection
        return $this->getRoleNames()->toArray();
    }

    /**
     * Get the user permissions attribute for frontend.
     *
     * @return array
     */
    public function getUserPermissionsAttribute(): array
    {
        // Use Spatie's getAllPermissions() method which returns a collection
        return $this->getAllPermissions()->pluck('name')->toArray();
    }

    // get user tickets
    public function assignedTickets()
    {
        return $this->hasMany(\App\Models\Support\Ticket::class, 'assigned_to');
    }


    /**
     * Get the project time logs for this user.
     */
    public function projectTimeLogs()
    {
        return $this->hasMany(\App\Models\ProjectTimeLog::class);
    }

    /**
     * Get the project tasks assigned to this user.
     */
    public function assignedTasks()
    {
        return $this->hasMany(\App\Models\ProjectTask::class, 'assigned_to');
    }

    /**
     * Get the project milestones assigned to this user.
     */
    public function assignedMilestones()
    {
        return $this->hasMany(\App\Models\ProjectMilestone::class, 'assigned_to');
    }

    /**
     * Get the employee record for this user.
     */
    public function employee()
    {
        return $this->hasOne(\App\Models\HR\Employee::class);
    }

    /**
     * Get the projects managed by this user.
     */
    public function managedProjects()
    {
        return $this->hasMany(\App\Models\Project::class, 'manager_id');
    }

    /**
     * Check if user is a super user.
     */
    public function isSuperUser(): bool
    {
        return $this->hasRole('super_user');
    }

    /**
     * Check if user is an admin (super user or admin role).
     */
    public function isAdmin(): bool
    {
        return $this->hasRole(['super_user', 'admin']);
    }

    /**
     * Check if user is a staff member (super user, admin, or staff role).
     */
    public function isStaff(): bool
    {
        return $this->hasRole(['super_user', 'admin', 'staff']);
    }

    /**
     * Check if user is a manager (super user, admin, or manager role).
     */
    public function isManager(): bool
    {
        return $this->hasRole(['super_user', 'admin', 'manager']);
    }

    /**
     * Client id linked to this user for shop/B2B order matching.
     */
    public function shopClientId(): ?int
    {
        $owned = $this->client()->value('id');
        if ($owned) {
            return (int) $owned;
        }

        $linked = $this->clients()->value('id');

        return $linked ? (int) $linked : null;
    }

}
