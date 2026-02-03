# Department Scoping Implementation - Complete Summary

## ✅ What Has Been Implemented

### 1. **HasDepartmentScope Trait** 
📍 Location: `app/Traits/HasDepartmentScope.php`

A reusable trait for automatic department-based query filtering:

```php
// In any model that has department_id
use App\Traits\HasDepartmentScope;

class Employee extends Model {
    use HasDepartmentScope;
}
```

**Methods Available:**
- `forUserDepartments($user)` - Automatically scope to user's departments
- `forDepartment($departmentId)` - Specific department
- `forDepartments([ids])` - Multiple departments  
- `isAccessibleByUser($user)` - Check if user can access record

**Smart Logic:**
- Super users & admins: Unrestricted access
- Users with "view all departments": Unrestricted access
- Regular staff: Restricted to their assigned departments

---

### 2. **Department-Based Authorization Policy**
📍 Location: `app/Policies/EmployeePolicy.php`

Laravel policy enforcing department-based authorization:

```php
// Automatically check both permission AND department access
$this->authorize('view', $employee);    // Checks policy
$this->authorize('update', $employee);  // Enforces department
$this->authorize('delete', $employee);  // Full authorization
```

**Policy Checks:**
- `viewAny()` - Can view employee list?
- `view($employee)` - Can view this specific employee?
- `create()` - Can create new employees?
- `update($employee)` - Can edit this employee (same dept)?
- `delete($employee)` - Can delete this employee (same dept)?

---

### 3. **New Permissions Added**
📍 Location: `database/seeders/RolesAndPermissionsSeeder.php`

Three new permissions for department control:

| Permission | Purpose |
|-----------|---------|
| `view all departments` | Can view data from all departments (managers) |
| `view own department` | Can only view own department data (staff) |
| `manage own department` | Can manage own department (for future use) |

**Role Assignments:**
- **Manager**: Gets `view all departments` → Sees all employees
- **Staff**: Gets `view own department` → Sees only their dept's employees
- **Admin/Super User**: All permissions (no restrictions)

---

### 4. **Updated Models & Controllers**
📍 Changes Made:

**Employee Model:**
- Added `HasDepartmentScope` trait
- Now supports automatic query scoping

**EmployeeController:**
- `index()` - Applies `forUserDepartments()` scoping
- `show()` - Uses `authorize('view', $employee)`
- `edit()` - Uses `authorize('update', $employee)`
- `update()` - Uses `authorize('update', $employee)`
- `destroy()` - Uses `authorize('delete', $employee)`
- `activate()` / `deactivate()` - Uses `authorize('update', $employee)`

**User Model:**
- Added import for `App\Models\HR\Department`
- `departments()` relation now works correctly

---

### 5. **Service Provider Registration**
📍 Location: `app/Providers/AuthServiceProvider.php`

Created and registered policy mapping:

```php
protected $policies = [
    Employee::class => EmployeePolicy::class,
];
```

Registered in `bootstrap/providers.php`

---

## 🧪 How to Test

### Step 1: Verify Permissions Seeded
```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
```

**Output should show:**
```
✓ Super User role created with absolute permissions
✓ Admin role created with full permissions
✓ Manager role created with advanced permissions
✓ Staff role created with operational permissions
```

### Step 2: Assign Users to Departments
```php
// In Laravel Tinker or seeder:
$user = User::where('email', 'staff@tekrem.com')->first();
$dept = Department::where('code', 'IT')->first();

// Assign user to department
$user->departments()->attach($dept->id);
```

### Step 3: Test Department Scoping
```php
// Test basic scoping
$staff = User::where('email', 'staff@tekrem.com')->first();
$employees = Employee::forUserDepartments($staff)->get();
// Should only return employees from staff's departments

// Test manager access
$manager = User::whereHas('roles', fn($q) => $q->where('name', 'manager'))->first();
$employees = Employee::forUserDepartments($manager)->get();
// Should return ALL employees
```

### Step 4: Test Authorization
```php
$staff = User::where('email', 'staff@tekrem.com')->first();
$employee = Employee::first();

// Check if staff can view this employee
if ($employee->isAccessibleByUser($staff)) {
    echo "Access granted";
} else {
    echo "Access denied";
}
```

---

## 🔄 How It Works in Practice

### Scenario 1: Staff User Views Employee List
```
1. Staff logs in → Assigned to "IT Department"
2. Visits HR > Employees
3. EmployeeController::index() runs:
   - Gets all employees for company
   - Calls .forUserDepartments($user)
   - Only IT dept employees returned
4. Staff sees only their 5 colleagues in IT
```

### Scenario 2: Staff Tries to Edit Employee from Different Dept
```
1. Staff tries to edit Sales employee
2. EmployeeController::update() calls authorize('update', $employee)
3. EmployeePolicy::update() checks:
   - Does user have 'edit employees' permission? ✓ YES
   - Can user access this employee's department? ✗ NO (Sales dept)
4. 403 Forbidden error returned
```

### Scenario 3: Manager Views All Employees
```
1. Manager logs in → Has 'view all departments' permission
2. Visits HR > Employees
3. EmployeeController::index() runs:
   - Gets all employees for company
   - Calls .forUserDepartments($user)
   - Policy checks: user has 'view all departments' ✓
   - Returns ALL employees regardless of department
```

---

## 📋 Files Created/Modified

### Created:
- ✅ `app/Traits/HasDepartmentScope.php`
- ✅ `app/Policies/EmployeePolicy.php`
- ✅ `app/Providers/AuthServiceProvider.php`
- ✅ `database/seeders/DepartmentUserSeeder.php`
- ✅ `app/Console/Commands/TestDepartmentScoping.php`
- ✅ `docs/DEPARTMENT_SCOPING_GUIDE.md`

### Modified:
- ✅ `database/seeders/RolesAndPermissionsSeeder.php` - Added 3 new permissions
- ✅ `app/Models/HR/Employee.php` - Added `HasDepartmentScope` trait
- ✅ `app/Models/User.php` - Added Department import + fixed relationship
- ✅ `app/Http/Controllers/HR/EmployeeController.php` - Added authorization checks
- ✅ `bootstrap/providers.php` - Registered AuthServiceProvider

---

## 🚀 Next Steps to Apply to Other Models

To add department scoping to other HR modules, repeat this pattern:

### 1. Add trait to model:
```php
class Leave extends Model {
    use HasDepartmentScope;
}
```

### 2. Create policy (example):
```php
class LeavePolicy {
    public function view(User $user, Leave $leave) {
        return $user->hasPermissionTo('view leave')
            && $leave->isAccessibleByUser($user);
    }
}
```

### 3. Register policy:
```php
// In AuthServiceProvider
protected $policies = [
    Leave::class => LeavePolicy::class,
];
```

### 4. Apply in controller:
```php
$leaves = Leave::where('company_id', currentCompanyId())
    ->forUserDepartments(auth()->user())
    ->get();
```

**Models Ready for This Pattern:**
- HR\Leave
- HR\Attendance  
- HR\Performance
- HR\Training
- Support\Ticket (optional - if department-based)
- Projects\Project (optional - if department-based)

---

## ⚙️ Configuration

### Permissions Hierarchy:
```
Super User / Admin
    ↓ (has all permissions)
    ├── view all departments
    ├── view all employees
    └── can access everything

Manager
    ↓ (has selective permissions)
    ├── view all departments ✓
    ├── view employees ✓
    └── can manage team across depts

Staff
    ↓ (has limited permissions)
    ├── view own department ✓
    ├── view employees (own dept only) ✓
    └── can manage own dept data
```

### Department Assignment:
Users are assigned to departments via `department_user` pivot table:
```sql
INSERT INTO department_user (department_id, user_id, company_id)
VALUES (1, 5, 1);
```

This is **many-to-many**, so users can belong to multiple departments.

---

## 🐛 Troubleshooting

### Issue: "Policy for Employee not found"
**Solution:** Make sure `AuthServiceProvider` is registered in `bootstrap/providers.php`

### Issue: Users see all data despite being assigned to department
**Solution:** Check if:
1. User has 'view all departments' permission → Remove it
2. User is actually assigned to a department → Check pivot table
3. Controller is applying scoping → Check if using `forUserDepartments()`

### Issue: "Access denied" for valid user
**Solution:** 
1. Check user has 'edit employees' or 'view employees' permission
2. Check user is assigned to employee's department
3. Verify department_id is set on employee record

---

## 📊 Testing the System

```bash
# Test with artisan command
php artisan test:department-scoping staff@tekrem.com
php artisan test:department-scoping manager@tekrem.com

# Manual testing in tinker
php artisan tinker

# Check user's departments
$user = User::find(1);
$user->departments;

# Check employees accessible to user
Employee::forUserDepartments($user)->count();

# Check specific access
$emp = Employee::first();
$emp->isAccessibleByUser($user);
```

---

## ✨ Summary

You now have a **complete department scoping system** where:

✅ Staff are restricted to their assigned department(s)
✅ Managers can view all departments (configurable)
✅ Admins bypass all restrictions
✅ Authorization is enforced at controller level
✅ Queries are automatically scoped
✅ System is extensible to other modules

The implementation follows **Laravel best practices**:
- Uses Traits for reusability
- Uses Policies for authorization
- Uses Service Providers for registration
- Uses Middleware/Authorization gates where needed
- Multi-tenant safe (company_id is respected)
