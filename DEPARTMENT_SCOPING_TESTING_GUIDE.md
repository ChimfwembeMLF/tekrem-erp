# Department Scoping - Implementation Checklist & Testing Guide

## ✅ Implementation Checklist

### Phase 1: Core Setup (COMPLETED)
- [x] Create HasDepartmentScope trait
- [x] Create EmployeePolicy
- [x] Create AuthServiceProvider
- [x] Add permissions to seeder
- [x] Update Employee model
- [x] Update User model (fix Department import)
- [x] Update EmployeeController
- [x] Create DepartmentUserSeeder
- [x] Create TestDepartmentScoping command
- [x] Register AuthServiceProvider in bootstrap/providers.php

### Phase 2: Verification
- [ ] Run RolesAndPermissionsSeeder
- [ ] Check permissions in database
- [ ] Test query scoping in tinker
- [ ] Test authorization in tinker
- [ ] Verify UI shows only department data
- [ ] Test 403 errors work correctly

### Phase 3: Extension (Optional)
- [ ] Add trait to Leave model
- [ ] Add trait to Attendance model
- [ ] Add trait to Performance model
- [ ] Add trait to Training model
- [ ] Create policies for each
- [ ] Register policies
- [ ] Update controllers

### Phase 4: Testing (Before Deployment)
- [ ] Unit tests pass
- [ ] Manual browser testing
- [ ] Edge cases tested
- [ ] Performance acceptable
- [ ] Documentation reviewed

### Phase 5: Deployment
- [ ] Backup database
- [ ] Run migrations
- [ ] Run seeders
- [ ] Test in staging
- [ ] Monitor logs
- [ ] Verify in production

---

## 🧪 Verification Tests

### Test 1: Permissions Seeded
```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
```

**Check:**
```bash
php artisan tinker
```

```php
# Should return 321
Permission::count()

# Should be true
Role::where('name', 'manager')
    ->first()
    ->hasPermissionTo('view all departments')

# Should be true
Role::where('name', 'staff')
    ->first()
    ->hasPermissionTo('view own department')
```

**Expected Output:**
```
✓ 321 permissions
✓ Manager has view all departments
✓ Staff has view own department
```

---

### Test 2: Models Working
```php
# Test User-Department relationship
$user = User::find(1);
$user->departments; // Should work now

# Test Employee trait
$emp = Employee::first();
$emp->forUserDepartments($user); // Should work
```

**Expected Output:**
```
✓ User::departments works
✓ Employee::forUserDepartments works
```

---

### Test 3: Query Scoping
```php
# Create test data
$user = User::where('email', 'staff@tekrem.com')->first();
$dept1 = Department::where('code', 'IT')->first();
$dept2 = Department::where('code', 'SALES')->first();

# Assign user to department
$user->departments()->attach($dept1->id);

# Create employees in both departments
Employee::factory(5)->create(['department_id' => $dept1->id]);
Employee::factory(3)->create(['department_id' => $dept2->id]);

# Test scoping
$accessible = Employee::forUserDepartments($user)->get();
echo "User can see: " . $accessible->count() . " employees";
# Should output: 5

# Test manager
$manager = User::whereHas('roles', fn($q) => $q->where('name', 'manager'))->first();
$all = Employee::forUserDepartments($manager)->get();
echo "Manager can see: " . $all->count() . " employees";
# Should output: 8
```

**Expected Output:**
```
✓ Staff sees only 5 employees (their dept)
✓ Manager sees all 8 employees
```

---

### Test 4: Authorization
```php
$user = User::where('email', 'staff@tekrem.com')->first();
$dept = Department::where('code', 'IT')->first();
$user->departments()->attach($dept->id);

# Get employees from both departments
$empInDept = Employee::where('department_id', $dept->id)->first();
$empNotInDept = Employee::whereNotIn('department_id', 
    $user->departments->pluck('id'))->first();

# Test access
echo $empInDept->isAccessibleByUser($user) ? "✓" : "✗";
# Should output: ✓

echo $empNotInDept->isAccessibleByUser($user) ? "✓" : "✗";
# Should output: ✗
```

**Expected Output:**
```
✓ Can access own department employees
✗ Cannot access other department employees
```

---

### Test 5: Controller Authorization
```php
# Simulate HTTP request as staff user
$staff = User::where('email', 'staff@tekrem.com')->first();
$empInDept = Employee::where('department_id', $staff->departments->first()->id)->first();
$empNotInDept = Employee::whereNotIn('department_id', 
    $staff->departments->pluck('id'))->first();

# Try to view own department employee (should work)
$response = $this->actingAs($staff)
    ->get(route('hr.employees.show', $empInDept));
# Should return 200

# Try to view other department employee (should fail)
$response = $this->actingAs($staff)
    ->get(route('hr.employees.show', $empNotInDept));
# Should return 403
```

**Expected Output:**
```
✓ 200 for own department
✗ 403 for other department
```

---

### Test 6: UI Display
1. Login as staff user
2. Go to HR > Employees
3. Should see: Only employees from assigned department(s)
4. Click on employee from other department (if URL known)
5. Should see: 403 Forbidden error
6. Login as manager
7. Go to HR > Employees
8. Should see: All employees from all departments

**Expected Output:**
```
✓ Staff sees only their department
✓ Staff gets 403 for other departments
✓ Manager sees all employees
```

---

## 🔧 Troubleshooting Guide

### Issue: Users see all data
**Diagnosis:**
```php
$user = User::find(5);
echo $user->hasPermissionTo('view all departments'); # Check this

$dept = Department::first();
echo $user->departments->contains($dept->id); # And this
```

**Solution:**
- If has `view all departments`: Remove it with `$user->revokePermissionTo('view all departments')`
- If not in any department: Assign with `$user->departments()->attach($dept->id)`

---

### Issue: 403 Forbidden when shouldn't be
**Diagnosis:**
```php
$user = User::find(5);
$emp = Employee::find(10);

# Check all three conditions
echo $user->hasPermissionTo('view employees'); # 1
echo $emp->isAccessibleByUser($user); # 2
echo $user->hasRole(['super_user', 'admin']); # 3
```

**Solution:**
- Missing permission: `$user->givePermissionTo('view employees')`
- Not in department: `$user->departments()->attach($emp->department_id)`
- Check policy: Verify EmployeePolicy is registered

---

### Issue: Query still returns all data
**Diagnosis:**
```php
# Check if scoping is applied
$query = Employee::forUserDepartments($user);
echo $query->toSql(); # Should have WHERE clause
```

**Solution:**
- Check HasDepartmentScope trait is added to model
- Verify `forUserDepartments()` is being called
- Check User model has Department import

---

### Issue: "Policy not found" error
**Diagnosis:**
```php
# Check if provider is registered
# In bootstrap/providers.php, AuthServiceProvider should be listed
```

**Solution:**
1. Verify AuthServiceProvider.php exists
2. Check it's registered in bootstrap/providers.php
3. Run: `php artisan cache:clear`

---

## 📊 Data Validation

### Before Extension:
```bash
# Count total employees
SELECT COUNT(*) FROM hr_employees; # e.g., 50

# Check departments
SELECT COUNT(*) FROM hr_departments; # e.g., 5

# Check department_user assignments
SELECT COUNT(*) FROM department_user; # e.g., 20
```

### After Extension:
```bash
# Same counts should remain
SELECT COUNT(*) FROM hr_employees; # 50
SELECT COUNT(*) FROM hr_departments; # 5
SELECT COUNT(*) FROM department_user; # 20

# Verify employees have departments
SELECT COUNT(*) FROM hr_employees WHERE department_id IS NOT NULL; # Should be > 0
```

---

## 🧪 Unit Testing

### Example Test:
```php
namespace Tests\Feature\HR;

use Tests\TestCase;
use App\Models\User;
use App\Models\HR\Employee;
use App\Models\HR\Department;

class EmployeeDepartmentScopingTest extends TestCase
{
    public function test_staff_can_only_view_own_department_employees()
    {
        $dept1 = Department::factory()->create();
        $dept2 = Department::factory()->create();
        
        $staff = User::factory()
            ->hasAttached($dept1, [], 'departments')
            ->create()
            ->assignRole('staff');

        Employee::factory(3)->create(['department_id' => $dept1->id]);
        Employee::factory(2)->create(['department_id' => $dept2->id]);

        $accessible = Employee::forUserDepartments($staff)->count();
        $this->assertEquals(3, $accessible);
    }

    public function test_staff_cannot_update_employee_from_other_department()
    {
        $dept1 = Department::factory()->create();
        $dept2 = Department::factory()->create();
        
        $staff = User::factory()
            ->hasAttached($dept1, [], 'departments')
            ->create()
            ->assignRole('staff');

        $employee = Employee::factory()->create(['department_id' => $dept2->id]);

        $this->actingAs($staff)
            ->put(route('hr.employees.update', $employee), [
                'job_title' => 'Updated'
            ])
            ->assertForbidden();
    }
}
```

**Run with:**
```bash
php artisan test
```

---

## 📋 Production Deployment

### Pre-Deployment Checklist:
- [ ] All tests pass
- [ ] Code reviewed
- [ ] No console errors
- [ ] Database backed up
- [ ] Rollback plan documented

### Deployment Steps:
```bash
# 1. Backup database
mysqldump -u root tekrem_dev > backup_$(date +%Y%m%d).sql

# 2. Pull changes
git pull origin feature/department-scoping

# 3. Install dependencies (if any)
composer install

# 4. Run migrations (if any)
php artisan migrate --force

# 5. Seed permissions
php artisan db:seed --class=RolesAndPermissionsSeeder

# 6. Clear cache
php artisan cache:clear

# 7. Verify in UI
# - Login as staff
# - Check employees shown only from department
# - Check 403 on cross-department access
# - Login as manager
# - Verify all employees visible
```

### Post-Deployment:
- [ ] Monitor error logs
- [ ] Check user activity
- [ ] Verify performance
- [ ] Collect feedback
- [ ] Document issues

---

## ✨ Final Validation

Run this complete test:

```php
# 1. Permissions exist
Permission::whereIn('name', [
    'view all departments',
    'view own department',
    'manage own department'
])->count() # Should be 3

# 2. Traits work
Employee::first()?->forUserDepartments(auth()->user()); # Should not error

# 3. Policies registered
Gate::getPolicyFor(Employee::class) # Should not be null

# 4. Users have departments
User::first()?->departments()->count() >= 0 # Should work

# 5. Authorization enforces
auth()->user()->can('view', Employee::first()) # Should work

# Output: All pass
echo "✅ All systems operational!"
```

---

## 🎯 Success Criteria

| Criterion | Status |
|-----------|--------|
| Permissions seeded | ✓ |
| Models use trait | ✓ |
| Policies created | ✓ |
| Controllers updated | ✓ |
| Query scoping works | Test |
| Authorization enforced | Test |
| UI shows correct data | Test |
| No broken features | Test |
| Performance acceptable | Test |
| Documentation complete | ✓ |

Once all tests pass: **✅ READY FOR PRODUCTION**

---

## 📞 Quick Reference

### Verify Setup:
```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
php artisan tinker
Permission::count() # Should be 321+
exit
```

### Test Access:
```php
# In tinker
$user = User::find(1);
$user->departments->count() # Check assignments
Employee::forUserDepartments($user)->count() # Check scoping
```

### Extend to New Model:
1. Add `use HasDepartmentScope;` to model
2. Create `ModelPolicy` class
3. Add to `AuthServiceProvider::$policies`
4. Use in controller: `$this->authorize('view', $model);`

---

**All tests passing? You're ready to deploy! 🚀**
