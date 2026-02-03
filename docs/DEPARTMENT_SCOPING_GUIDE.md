# Department Scoping Implementation Guide

## Overview
Department scoping has been implemented to restrict staff/users to only view and manage data within their assigned department(s).

## What Was Implemented

### 1. HasDepartmentScope Trait (`app/Traits/HasDepartmentScope.php`)
Provides reusable query scoping methods:
- `forUserDepartments($user)` - Filters records to user's departments
- `forDepartment($departmentId)` - Filters to specific department
- `forDepartments($departmentIds)` - Filters to multiple departments
- `isAccessibleByUser($user)` - Checks if user can access a record

**Behavior:**
- Super users and admins: See everything
- Users with "view all departments" permission: See everything
- Regular staff: Only see records from their departments

### 2. New Permissions
Added to `RolesAndPermissionsSeeder.php`:
- `view all departments` - Can view data from all departments
- `view own department` - Can only view data from own department(s)
- `manage own department` - Can manage own department

**Role Assignments:**
- **Manager role**: Gets `view all departments` (can see all)
- **Staff role**: Gets `view own department` (restricted to their dept)

### 3. EmployeePolicy (`app/Policies/EmployeePolicy.php`)
Enforces department-based authorization for:
- `viewAny()` - Check permission to view employees
- `view()` - Check if user can view specific employee
- `create()` - Check if user can create employees
- `update()` - Check if user can edit specific employee (must be in same dept)
- `delete()` - Check if user can delete specific employee (must be in same dept)

### 4. Updated Models
- `Employee` model now uses `HasDepartmentScope` trait

### 5. Updated Controllers
- `EmployeeController` now:
  - Applies `forUserDepartments()` in `index()` method
  - Uses `$this->authorize()` in show, edit, update, destroy, activate, deactivate methods

### 6. Service Provider
- Created `AuthServiceProvider` to register policies
- Registered in `bootstrap/providers.php`

## How to Use

### 1. Assign Users to Departments
```php
// Add user to department
$user->departments()->attach($departmentId);

// Add user to multiple departments
$user->departments()->attach([1, 2, 3]);

// Remove from department
$user->departments()->detach($departmentId);
```

### 2. Query with Department Scoping
```php
// Automatic scoping based on user's departments
$employees = Employee::forUserDepartments(auth()->user())->get();

// Specific department
$employees = Employee::forDepartment($departmentId)->get();

// Check access
if ($employee->isAccessibleByUser(auth()->user())) {
    // User can access this employee
}
```

### 3. Check Authorization in Controllers
```php
// Check if user can view employee
$this->authorize('view', $employee);

// Check if user can edit employee
$this->authorize('update', $employee);

// Check if user can delete employee
$this->authorize('delete', $employee);
```

## Testing

### 1. Run Migrations and Seeders
```bash
php artisan migrate:fresh --seed
```

### 2. Assign Test Users to Departments
```php
// In tinker or seeder
$staff = User::where('email', 'staff@tekrem.com')->first();
$department = Department::first();
$staff->departments()->attach($department->id);
```

### 3. Test Department Scoping
- Login as staff user
- Navigate to HR > Employees
- Should only see employees in assigned department(s)
- Try to access employee from different department (should get 403)

### 4. Test Manager Access
- Login as manager
- Should see all employees across all departments

## Extending to Other Models

To add department scoping to other HR models (Leave, Attendance, etc.):

### 1. Add trait to model
```php
use App\Traits\HasDepartmentScope;

class Leave extends Model
{
    use HasDepartmentScope;
    // ...
}
```

### 2. Add department_id column (if not exists)
```php
Schema::table('hr_leaves', function (Blueprint $table) {
    $table->foreignId('department_id')->nullable()
          ->constrained('hr_departments')->onDelete('set null');
});
```

### 3. Apply scoping in controller
```php
$leaves = Leave::where('company_id', currentCompanyId())
    ->forUserDepartments(auth()->user())
    ->get();
```

### 4. Create policy
```php
class LeavePolicy
{
    public function view(User $user, Leave $leave): bool
    {
        return $user->hasPermissionTo('view leave') 
            && $leave->isAccessibleByUser($user);
    }
    // ... other methods
}
```

## Next Steps

1. **Apply to other HR models:**
   - Leave
   - Attendance
   - Performance Reviews
   - Training enrollments

2. **Add UI indicators:**
   - Show user's department(s) in profile
   - Add department filter in list views
   - Show "Department Access" badge

3. **Add admin tools:**
   - Bulk assign users to departments
   - Department management interface
   - View users per department

4. **Consider hierarchical access:**
   - Parent department can see child departments
   - Department managers can see their team

## Important Notes

- Admins and super users bypass all department restrictions
- Users with no departments assigned will see no records (empty results)
- Company scoping is applied before department scoping
- Department assignments are many-to-many (users can belong to multiple departments)
