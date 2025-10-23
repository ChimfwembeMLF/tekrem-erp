<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Project;
use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\BoardCard;
use App\Models\Sprint;
use App\Models\Epic;
use App\Models\Label;
use App\Models\BoardMember;
use App\Models\SprintReport;
use Carbon\Carbon;

class ProjectManagementSeeder extends Seeder
{
    public function run()
    {
        // Get existing users or create some if none exist
        $users = User::all();
        if ($users->count() < 5) {
            $users = collect([
                User::create([
                    'name' => 'Project Manager',
                    'email' => 'pm@example.com',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]),
                User::create([
                    'name' => 'Lead Developer',
                    'email' => 'lead@example.com',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]),
                User::create([
                    'name' => 'Frontend Developer',
                    'email' => 'frontend@example.com',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]),
                User::create([
                    'name' => 'Backend Developer',
                    'email' => 'backend@example.com',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]),
                User::create([
                    'name' => 'QA Engineer',
                    'email' => 'qa@example.com',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]),
                User::create([
                    'name' => 'UI/UX Designer',
                    'email' => 'designer@example.com',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]),
            ]);
        }

        // Create realistic projects
        $projects = [
            [
                'name' => 'E-Commerce Platform',
                'description' => 'A comprehensive e-commerce platform with modern features including real-time notifications, advanced search, and mobile-first design.',
                'status' => 'active',
                'start_date' => now()->subMonths(3),
                'end_date' => now()->addMonths(6),
                'owner_id' => $users->first()->id,
            ],
            [
                'name' => 'Mobile Banking App',
                'description' => 'Secure mobile banking application with biometric authentication, real-time transactions, and comprehensive financial management tools.',
                'status' => 'active',
                'start_date' => now()->subMonths(2),
                'end_date' => now()->addMonths(8),
                'owner_id' => $users->skip(1)->first()->id,
            ],
            [
                'name' => 'Internal CRM System',
                'description' => 'Customer relationship management system for internal use with advanced analytics, automation, and integration capabilities.',
                'status' => 'planning',
                'start_date' => now()->addWeeks(2),
                'end_date' => now()->addMonths(5),
                'owner_id' => $users->first()->id,
            ],
        ];

        foreach ($projects as $projectData) {
            $project = Project::create($projectData);
            
            // Create Kanban board for the project
            $board = Board::create([
                'project_id' => $project->id,
                'name' => $project->name . ' Board',
                'description' => 'Main development board for ' . $project->name,
                'type' => 'kanban',
                'owner_id' => $users->first()->id,
            ]);

            // Add team members to the board
            $roles = ['admin', 'member', 'member', 'member', 'viewer'];
            foreach ($users->take(5) as $index => $user) {
                BoardMember::create([
                    'board_id' => $board->id,
                    'user_id' => $user->id,
                    'role' => $roles[$index] ?? 'member',
                    'joined_at' => now()->subDays(rand(1, 30)),
                ]);
            }

            // Create realistic epics
            $epics = [
                [
                    'name' => 'User Authentication & Security',
                    'description' => 'Implement comprehensive user authentication system with security features',
                    'color' => '#FF6B6B',
                ],
                [
                    'name' => 'Core Business Logic',
                    'description' => 'Develop the main business functionality and workflows',
                    'color' => '#4ECDC4',
                ],
                [
                    'name' => 'User Interface & Experience',
                    'description' => 'Design and implement user-friendly interfaces',
                    'color' => '#45B7D1',
                ],
            ];

            $createdEpics = collect();
            foreach ($epics as $epicData) {
                $epic = Epic::create([
                    'board_id' => $board->id,
                    'name' => $epicData['name'],
                    'description' => $epicData['description'],
                    'color' => $epicData['color'],
                ]);
                $createdEpics->push($epic);
            }

            // Create realistic labels
            $labels = [
                ['name' => 'Bug', 'color' => '#FF4757'],
                ['name' => 'Feature', 'color' => '#2ED573'],
                ['name' => 'Enhancement', 'color' => '#FFA502'],
                ['name' => 'Critical', 'color' => '#FF3838'],
                ['name' => 'Documentation', 'color' => '#70A1FF'],
                ['name' => 'Testing', 'color' => '#5352ED'],
            ];

            $createdLabels = collect();
            foreach ($labels as $labelData) {
                $label = Label::create([
                    'board_id' => $board->id,
                    'name' => $labelData['name'],
                    'color' => $labelData['color'],
                ]);
                $createdLabels->push($label);
            }

            // Create realistic columns
            $columns = [
                ['name' => 'Backlog', 'order' => 1, 'color' => '#95A5A6', 'is_done_column' => false],
                ['name' => 'To Do', 'order' => 2, 'color' => '#3498DB', 'is_done_column' => false],
                ['name' => 'In Progress', 'order' => 3, 'color' => '#F39C12', 'is_done_column' => false],
                ['name' => 'Review', 'order' => 4, 'color' => '#9B59B6', 'is_done_column' => false],
                ['name' => 'Testing', 'order' => 5, 'color' => '#E67E22', 'is_done_column' => false],
                ['name' => 'Done', 'order' => 6, 'color' => '#27AE60', 'is_done_column' => true],
            ];

            $createdColumns = collect();
            foreach ($columns as $columnData) {
                $column = BoardColumn::create([
                    'board_id' => $board->id,
                    'name' => $columnData['name'],
                    'order' => $columnData['order'],
                    'color' => $columnData['color'],
                    'is_done_column' => $columnData['is_done_column'],
                ]);
                $createdColumns->push($column);
            }

            // Create realistic sprints
            $sprints = [
                [
                    'name' => 'Sprint 1 - Foundation',
                    'goal' => 'Set up project foundation and basic architecture',
                    'start_date' => now()->subWeeks(4),
                    'end_date' => now()->subWeeks(2),
                    'status' => 'completed',
                ],
                [
                    'name' => 'Sprint 2 - Core Features',
                    'goal' => 'Implement core business logic and primary features',
                    'start_date' => now()->subWeeks(2),
                    'end_date' => now(),
                    'status' => 'active',
                ],
                [
                    'name' => 'Sprint 3 - Polish & Testing',
                    'goal' => 'Refine features, comprehensive testing, and bug fixes',
                    'start_date' => now(),
                    'end_date' => now()->addWeeks(2),
                    'status' => 'planned',
                ],
            ];

            $createdSprints = collect();
            foreach ($sprints as $sprintData) {
                $sprint = Sprint::create([
                    'board_id' => $board->id,
                    'name' => $sprintData['name'],
                    'goal' => $sprintData['goal'],
                    'start_date' => $sprintData['start_date'],
                    'end_date' => $sprintData['end_date'],
                    'status' => $sprintData['status'],
                ]);
                $createdSprints->push($sprint);

                // Create sprint report for completed sprints
                if ($sprint->status === 'completed') {
                    SprintReport::create([
                        'sprint_id' => $sprint->id,
                        'user_id' => $users->first()->id,
                        'summary' => 'Sprint completed successfully with most objectives met.',
                        'completed_points' => rand(25, 35),
                        'incomplete_points' => rand(3, 8),
                        'velocity' => rand(28, 32),
                        'metrics' => [
                            'bugs_found' => rand(2, 5),
                            'bugs_fixed' => rand(3, 6),
                            'code_reviews' => rand(15, 25),
                            'deployment_success_rate' => rand(95, 100),
                        ],
                    ]);
                }
            }

            // Create realistic cards for each project type
            $this->createCardsForProject($project->name, $board, $createdColumns, $createdEpics, $createdLabels, $createdSprints, $users);
        }

        $this->command->info('✅ Project Management seeders completed successfully!');
    }

    private function createCardsForProject($projectName, $board, $columns, $epics, $labels, $sprints, $users)
    {
        $cardSets = [];

        if (str_contains($projectName, 'E-Commerce')) {
            $cardSets = $this->getECommerceCards();
        } elseif (str_contains($projectName, 'Banking')) {
            $cardSets = $this->getBankingCards();
        } else {
            $cardSets = $this->getCRMCards();
        }

        foreach ($cardSets as $cardData) {
            $column = $columns->where('name', $cardData['column'])->first() ?? $columns->first();
            $epic = $epics->where('name', 'like', '%' . $cardData['epic'] . '%')->first() ?? $epics->first();
            $sprint = $sprints->where('status', $cardData['sprint_status'])->first() ?? $sprints->first();
            
            $card = BoardCard::create([
                'board_id' => $board->id,
                'column_id' => $column->id,
                'epic_id' => $epic->id,
                'sprint_id' => $sprint->id,
                'type' => $cardData['type'],
                'title' => $cardData['title'],
                'description' => $cardData['description'],
                'priority' => $cardData['priority'],
                'story_points' => $cardData['story_points'],
                'assignee_id' => $users->random()->id,
                'reporter_id' => $users->first()->id,
                'status' => $cardData['status'],
                'due_date' => $cardData['due_date'] ?? null,
                'order' => rand(1, 10),
                'labels' => $cardData['labels'] ?? [],
            ]);
        }
    }

    private function getECommerceCards()
    {
        return [
            [
                'column' => 'Done',
                'epic' => 'Authentication',
                'sprint_status' => 'completed',
                'type' => 'story',
                'title' => 'User Registration & Login',
                'description' => 'Implement user registration and login functionality with email verification',
                'priority' => 'high',
                'story_points' => 8,
                'status' => 'completed',
                'due_date' => now()->subWeeks(1),
                'labels' => ['Feature', 'Authentication'],
            ],
            [
                'column' => 'Done',
                'epic' => 'Core',
                'sprint_status' => 'completed',
                'type' => 'story',
                'title' => 'Product Catalog Setup',
                'description' => 'Create product catalog with categories, search, and filtering capabilities',
                'priority' => 'high',
                'story_points' => 13,
                'status' => 'completed',
                'due_date' => now()->subWeeks(2),
                'labels' => ['Feature', 'Core'],
            ],
            [
                'column' => 'In Progress',
                'epic' => 'Core',
                'sprint_status' => 'active',
                'type' => 'story',
                'title' => 'Shopping Cart Implementation',
                'description' => 'Build shopping cart with add/remove items, quantity management, and persistence',
                'priority' => 'high',
                'story_points' => 8,
                'status' => 'in_progress',
                'due_date' => now()->addDays(3),
                'labels' => ['Feature', 'Critical'],
            ],
            [
                'column' => 'Review',
                'epic' => 'Core',
                'sprint_status' => 'active',
                'type' => 'story',
                'title' => 'Payment Gateway Integration',
                'description' => 'Integrate Stripe payment gateway for secure payment processing',
                'priority' => 'critical',
                'story_points' => 13,
                'status' => 'review',
                'due_date' => now()->addDays(5),
                'labels' => ['Feature', 'Critical'],
            ],
            [
                'column' => 'Testing',
                'epic' => 'Interface',
                'sprint_status' => 'active',
                'type' => 'story',
                'title' => 'Responsive Product Pages',
                'description' => 'Create responsive product detail pages with image gallery and reviews',
                'priority' => 'medium',
                'story_points' => 5,
                'status' => 'testing',
                'due_date' => now()->addWeeks(1),
                'labels' => ['Feature', 'UI/UX'],
            ],
            [
                'column' => 'To Do',
                'epic' => 'Interface',
                'sprint_status' => 'planned',
                'type' => 'story',
                'title' => 'Order Management Dashboard',
                'description' => 'Admin dashboard for managing orders, inventory, and customer data',
                'priority' => 'medium',
                'story_points' => 21,
                'status' => 'todo',
                'due_date' => now()->addWeeks(3),
                'labels' => ['Feature', 'Admin'],
            ],
            [
                'column' => 'Backlog',
                'epic' => 'Core',
                'sprint_status' => 'planned',
                'type' => 'bug',
                'title' => 'Fix Cart Persistence Issue',
                'description' => 'Cart items disappear when user refreshes the page',
                'priority' => 'high',
                'story_points' => 3,
                'status' => 'backlog',
                'labels' => ['Bug', 'Critical'],
            ],
        ];
    }

    private function getBankingCards()
    {
        return [
            [
                'column' => 'Done',
                'epic' => 'Authentication',
                'sprint_status' => 'completed',
                'type' => 'story',
                'title' => 'Biometric Authentication',
                'description' => 'Implement fingerprint and face ID authentication for mobile app',
                'priority' => 'critical',
                'story_points' => 21,
                'status' => 'completed',
                'due_date' => now()->subWeeks(2),
                'labels' => ['Feature', 'Security'],
            ],
            [
                'column' => 'Done',
                'epic' => 'Core',
                'sprint_status' => 'completed',
                'type' => 'story',
                'title' => 'Account Balance Display',
                'description' => 'Show real-time account balances with transaction history',
                'priority' => 'high',
                'story_points' => 8,
                'status' => 'completed',
                'due_date' => now()->subWeeks(1),
                'labels' => ['Feature', 'Core'],
            ],
            [
                'column' => 'In Progress',
                'epic' => 'Core',
                'sprint_status' => 'active',
                'type' => 'story',
                'title' => 'Money Transfer System',
                'description' => 'Enable secure money transfers between accounts and external banks',
                'priority' => 'critical',
                'story_points' => 13,
                'status' => 'in_progress',
                'due_date' => now()->addDays(7),
                'labels' => ['Feature', 'Critical'],
            ],
            [
                'column' => 'Review',
                'epic' => 'Core',
                'sprint_status' => 'active',
                'type' => 'story',
                'title' => 'Transaction Notifications',
                'description' => 'Real-time push notifications for all account transactions',
                'priority' => 'high',
                'story_points' => 5,
                'status' => 'review',
                'due_date' => now()->addDays(4),
                'labels' => ['Feature', 'Notifications'],
            ],
            [
                'column' => 'Testing',
                'epic' => 'Interface',
                'sprint_status' => 'active',
                'type' => 'story',
                'title' => 'Bill Payment Interface',
                'description' => 'User-friendly interface for paying bills and setting up auto-pay',
                'priority' => 'medium',
                'story_points' => 8,
                'status' => 'testing',
                'due_date' => now()->addWeeks(1),
                'labels' => ['Feature', 'UI/UX'],
            ],
            [
                'column' => 'To Do',
                'epic' => 'Core',
                'sprint_status' => 'planned',
                'type' => 'story',
                'title' => 'Fraud Detection System',
                'description' => 'Implement AI-based fraud detection and prevention system',
                'priority' => 'critical',
                'story_points' => 34,
                'status' => 'todo',
                'due_date' => now()->addWeeks(4),
                'labels' => ['Feature', 'Security', 'AI'],
            ],
            [
                'column' => 'Backlog',
                'epic' => 'Authentication',
                'sprint_status' => 'planned',
                'type' => 'bug',
                'title' => 'Login Timeout Issue',
                'description' => 'App logs out users too frequently, causing poor user experience',
                'priority' => 'medium',
                'story_points' => 5,
                'status' => 'backlog',
                'labels' => ['Bug', 'UX'],
            ],
        ];
    }

    private function getCRMCards()
    {
        return [
            [
                'column' => 'Done',
                'epic' => 'Core',
                'sprint_status' => 'completed',
                'type' => 'story',
                'title' => 'Customer Database Schema',
                'description' => 'Design and implement comprehensive customer data structure',
                'priority' => 'high',
                'story_points' => 13,
                'status' => 'completed',
                'due_date' => now()->subWeeks(3),
                'labels' => ['Feature', 'Database'],
            ],
            [
                'column' => 'In Progress',
                'epic' => 'Core',
                'sprint_status' => 'active',
                'type' => 'story',
                'title' => 'Lead Management System',
                'description' => 'Create system for tracking and managing sales leads through pipeline',
                'priority' => 'high',
                'story_points' => 21,
                'status' => 'in_progress',
                'due_date' => now()->addDays(10),
                'labels' => ['Feature', 'Sales'],
            ],
            [
                'column' => 'Review',
                'epic' => 'Interface',
                'sprint_status' => 'active',
                'type' => 'story',
                'title' => 'Contact Management UI',
                'description' => 'Build intuitive interface for managing customer contacts and communications',
                'priority' => 'medium',
                'story_points' => 8,
                'status' => 'review',
                'due_date' => now()->addDays(6),
                'labels' => ['Feature', 'UI/UX'],
            ],
            [
                'column' => 'Testing',
                'epic' => 'Core',
                'sprint_status' => 'active',
                'type' => 'story',
                'title' => 'Email Integration',
                'description' => 'Integrate email system for automated customer communications',
                'priority' => 'medium',
                'story_points' => 13,
                'status' => 'testing',
                'due_date' => now()->addWeeks(1),
                'labels' => ['Feature', 'Integration'],
            ],
            [
                'column' => 'To Do',
                'epic' => 'Interface',
                'sprint_status' => 'planned',
                'type' => 'story',
                'title' => 'Analytics Dashboard',
                'description' => 'Create comprehensive analytics dashboard with sales metrics and reports',
                'priority' => 'medium',
                'story_points' => 21,
                'status' => 'todo',
                'due_date' => now()->addWeeks(3),
                'labels' => ['Feature', 'Analytics'],
            ],
            [
                'column' => 'Backlog',
                'epic' => 'Core',
                'sprint_status' => 'planned',
                'type' => 'enhancement',
                'title' => 'Mobile App Development',
                'description' => 'Develop mobile application for CRM access on the go',
                'priority' => 'low',
                'story_points' => 55,
                'status' => 'backlog',
                'due_date' => now()->addMonths(2),
                'labels' => ['Enhancement', 'Mobile'],
            ],
            [
                'column' => 'Backlog',
                'epic' => 'Interface',
                'sprint_status' => 'planned',
                'type' => 'bug',
                'title' => 'Search Performance Issue',
                'description' => 'Customer search is slow with large datasets, needs optimization',
                'priority' => 'medium',
                'story_points' => 8,
                'status' => 'backlog',
                'labels' => ['Bug', 'Performance'],
            ],
        ];
    }
}
