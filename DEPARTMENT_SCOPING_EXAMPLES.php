<?php

// ============================================================================
// QUICK REFERENCE: Applying Department Scoping to Other Models
// ============================================================================

// ============================================================================
// 1. LEAVE MODULE - Example Implementation
// ============================================================================

namespace App\Models\HR;

use App\Traits\HasDepartmentScope;

class Leave extends Model
{
    use HasDepartmentScope; // Add this trait

    protected $table = 'hr_leaves';
    protected $fillable = [
        'employee_id',
        'department_id', // Ensure this exists
        'leave_type_id',
        'start_date',
        'end_date',
        // ... other fields
    ];
}

// In LeaveController:
public function index(Request $request): Response
{
    $user = auth()->user();
    
    $leaves = Leave::where('company_id', currentCompanyId())
        ->forUserDepartments($user) // Apply scoping
        ->with(['employee', 'department', 'leaveType'])
        ->paginate(15);

    return Inertia::render('HR/Leaves/Index', [
        'leaves' => $leaves,
    ]);
}

// Create LeavePolicy:
namespace App\Policies;

class LeavePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view leave');
    }

    public function view(User $user, Leave $leave): bool
    {
        return $user->hasPermissionTo('view leave')
            && $leave->isAccessibleByUser($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create leave');
    }

    public function update(User $user, Leave $leave): bool
    {
        return $user->hasPermissionTo('edit leave')
            && $leave->isAccessibleByUser($user);
    }

    public function delete(User $user, Leave $leave): bool
    {
        return $user->hasPermissionTo('delete leave')
            && $leave->isAccessibleByUser($user);
    }
}

// Register in AuthServiceProvider:
protected $policies = [
    Employee::class => EmployeePolicy::class,
    Leave::class => LeavePolicy::class, // Add this
];

// ============================================================================
// 2. ATTENDANCE MODULE - Example Implementation
// ============================================================================

namespace App\Models\HR;

class Attendance extends Model
{
    use HasDepartmentScope;

    protected $table = 'hr_attendances';
    protected $fillable = [
        'employee_id',
        'department_id', // Add if not exists
        'date',
        'status',
        // ... other fields
    ];
}

// In AttendanceController:
public function index(Request $request): Response
{
    $user = auth()->user();
    
    $attendances = Attendance::where('company_id', currentCompanyId())
        ->forUserDepartments($user)
        ->with(['employee', 'department'])
        ->paginate(15);

    return Inertia::render('HR/Attendance/Index', [
        'attendances' => $attendances,
    ]);
}

// ============================================================================
// 3. PERFORMANCE REVIEW MODULE - Example Implementation
// ============================================================================

namespace App\Models\HR;

class PerformanceReview extends Model
{
    use HasDepartmentScope;

    protected $table = 'hr_performance_reviews';
    protected $fillable = [
        'employee_id',
        'department_id', // Add if not exists
        'reviewer_id',
        'rating',
        'comments',
        // ... other fields
    ];
}

// ============================================================================
// 4. MIGRATION EXAMPLE - Add department_id to existing table
// ============================================================================

// Generate migration:
// php artisan make:migration add_department_id_to_hr_leaves_table

namespace Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hr_leaves', function (Blueprint $table) {
            $table->foreignId('department_id')
                ->nullable()
                ->constrained('hr_departments')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('hr_leaves', function (Blueprint $table) {
            $table->dropForeignIdFor('hr_departments');
        });
    }
};

// ============================================================================
// 5. QUERY EXAMPLES - Using Department Scoping
// ============================================================================

// Get employee's leaves only from their departments
$staffUser = User::find(5);
$myLeaves = Leave::forUserDepartments($staffUser)->get();

// Get leaves from specific department
$itLeaves = Leave::forDepartment(1)->get(); // Department ID 1

// Get leaves from multiple departments
$deptLeaves = Leave::forDepartments([1, 2, 3])->get();

// Check if current user can access a leave record
$leave = Leave::find(10);
if ($leave->isAccessibleByUser(auth()->user())) {
    // User can access this leave
}

// Combined query with filters
$pendingLeaves = Leave::where('company_id', currentCompanyId())
    ->forUserDepartments(auth()->user())
    ->where('status', 'pending')
    ->orderBy('created_at', 'desc')
    ->get();

// ============================================================================
// 6. AUTHORIZATION IN CONTROLLERS - Complete Pattern
// ============================================================================

namespace App\Http\Controllers\HR;

class LeaveController extends Controller
{
    /**
     * Display list of leaves.
     */
    public function index(Request $request): Response
    {
        // Authorization check
        $this->authorize('viewAny', Leave::class);

        $user = auth()->user();
        $leaves = Leave::where('company_id', currentCompanyId())
            ->forUserDepartments($user)
            ->with(['employee', 'department'])
            ->paginate(15);

        return Inertia::render('HR/Leaves/Index', ['leaves' => $leaves]);
    }

    /**
     * Display specific leave.
     */
    public function show(Leave $leave): Response
    {
        // Authorization check - also validates department access
        $this->authorize('view', $leave);

        $leave->load(['employee', 'department', 'leaveType']);
        return Inertia::render('HR/Leaves/Show', ['leave' => $leave]);
    }

    /**
     * Store a new leave.
     */
    public function store(Request $request): RedirectResponse
    {
        // Authorization check
        $this->authorize('create', Leave::class);

        $validated = $request->validate([
            'employee_id' => 'required|exists:hr_employees,id',
            'leave_type_id' => 'required|exists:hr_leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $leave = Leave::create($validated);

        return redirect()->route('hr.leaves.show', $leave)
            ->with('success', 'Leave created successfully');
    }

    /**
     * Update a leave.
     */
    public function update(Request $request, Leave $leave): RedirectResponse
    {
        // Authorization check - validates department access
        $this->authorize('update', $leave);

        $validated = $request->validate([/* ... */]);
        $leave->update($validated);

        return back()->with('success', 'Leave updated successfully');
    }

    /**
     * Delete a leave.
     */
    public function destroy(Leave $leave): RedirectResponse
    {
        // Authorization check - validates department access
        $this->authorize('delete', $leave);

        $leave->delete();

        return redirect()->route('hr.leaves.index')
            ->with('success', 'Leave deleted successfully');
    }
}

// ============================================================================
// 7. TESTING - Unit Test Example
// ============================================================================

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\HR\Leave;
use App\Models\HR\Department;

class LeaveDepartmentScopingTest extends TestCase
{
    protected User $staffUser;
    protected User $managerUser;
    protected Department $itDept;
    protected Department $hrDept;

    protected function setUp(): void
    {
        parent::setUp();

        $this->itDept = Department::factory()->create(['code' => 'IT']);
        $this->hrDept = Department::factory()->create(['code' => 'HR']);

        $this->staffUser = User::factory()
            ->hasAttached($this->itDept, [], 'departments')
            ->create();
        $this->staffUser->assignRole('staff');

        $this->managerUser = User::factory()->create();
        $this->managerUser->assignRole('manager');
    }

    public function test_staff_can_only_see_own_department_leaves()
    {
        Leave::factory(3)->create(['department_id' => $this->itDept->id]);
        Leave::factory(2)->create(['department_id' => $this->hrDept->id]);

        $leaves = Leave::forUserDepartments($this->staffUser)->get();

        $this->assertEquals(3, $leaves->count());
        $this->assertTrue($leaves->every(fn($l) => $l->department_id === $this->itDept->id));
    }

    public function test_manager_can_see_all_leaves()
    {
        Leave::factory(3)->create(['department_id' => $this->itDept->id]);
        Leave::factory(2)->create(['department_id' => $this->hrDept->id]);

        $leaves = Leave::forUserDepartments($this->managerUser)->get();

        $this->assertEquals(5, $leaves->count());
    }

    public function test_staff_cannot_update_leave_from_other_department()
    {
        $leave = Leave::factory()->create(['department_id' => $this->hrDept->id]);

        $this->actingAs($this->staffUser)
            ->patch(route('hr.leaves.update', $leave), [
                'status' => 'approved'
            ])
            ->assertForbidden();
    }
}

// ============================================================================
// SUMMARY - Quick Checklist for New Model
// ============================================================================

/*
To add department scoping to any HR model:

□ 1. Add migration if department_id doesn't exist:
     php artisan make:migration add_department_id_to_table

□ 2. Add HasDepartmentScope trait to model:
     use App\Traits\HasDepartmentScope;

□ 3. Create Policy class (if needed):
     php artisan make:policy ModelNamePolicy -m "App\Models\HR\ModelName"

□ 4. Register policy in AuthServiceProvider:
     ModelName::class => ModelNamePolicy::class,

□ 5. Update controller methods to:
     - Use authorize() calls
     - Apply forUserDepartments() in queries

□ 6. Test with:
     php artisan test

Done! Department scoping is now active for that model.
*/
