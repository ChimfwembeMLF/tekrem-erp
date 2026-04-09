<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\ProjectTemplate;
use App\Models\User;
use App\Models\Client;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::whereHas('roles', fn($q) => $q->whereIn('name', ['admin', 'super_user']))->first();
        $clients = Client::all();
        $allUsers = User::all();

        if (!$user || $clients->isEmpty()) {
            $this->command->warn('No admin/super_user or clients found. Please run UserSeeder and ClientSeeder first.');
            return;
        }

        // Business-focused project templates
        $templates = [
            [
                'name' => 'Business Process Improvement',
                'description' => 'Streamline operations to improve efficiency and reduce costs',
                'category' => 'Operations',
                'template_data' => [
                    'milestones' => [
                        ['name' => 'Process Analysis', 'description' => 'Review existing processes', 'priority' => 'high'],
                        ['name' => 'Workflow Redesign', 'description' => 'Propose optimized workflows', 'priority' => 'medium'],
                        ['name' => 'Implementation', 'description' => 'Execute process improvements', 'priority' => 'high'],
                        ['name' => 'Review & Optimization', 'description' => 'Measure results and fine-tune', 'priority' => 'high'],
                    ],
                    'default_budget' => 50000,
                    'estimated_duration' => 90,
                ],
                'created_by' => $user->id,
            ],
            [
                'name' => 'Marketing Campaign',
                'description' => 'Plan and execute marketing initiatives to increase brand visibility',
                'category' => 'Marketing',
                'template_data' => [
                    'milestones' => [
                        ['name' => 'Market Research', 'description' => 'Analyze target audience', 'priority' => 'high'],
                        ['name' => 'Campaign Strategy', 'description' => 'Define marketing plan', 'priority' => 'medium'],
                        ['name' => 'Content Creation', 'description' => 'Develop marketing assets', 'priority' => 'high'],
                        ['name' => 'Launch & Monitor', 'description' => 'Execute and track campaign', 'priority' => 'critical'],
                    ],
                    'default_budget' => 30000,
                    'estimated_duration' => 60,
                ],
                'created_by' => $user->id,
            ],
            [
                'name' => 'Financial Audit',
                'description' => 'Conduct internal financial review for compliance and reporting',
                'category' => 'Finance',
                'template_data' => [
                    'milestones' => [
                        ['name' => 'Data Collection', 'description' => 'Gather financial documents', 'priority' => 'high'],
                        ['name' => 'Preliminary Review', 'description' => 'Identify risks or discrepancies', 'priority' => 'medium'],
                        ['name' => 'Audit Fieldwork', 'description' => 'Perform detailed audit', 'priority' => 'high'],
                        ['name' => 'Reporting', 'description' => 'Produce audit report', 'priority' => 'critical'],
                    ],
                    'default_budget' => 40000,
                    'estimated_duration' => 45,
                ],
                'created_by' => $user->id,
            ],
        ];

        foreach ($templates as $templateData) {
            ProjectTemplate::create($templateData);
        }

        // Sample business projects
        $projects = [
            [
                'name' => 'Office Workflow Optimization',
                'description' => 'Improve internal office processes and documentation',
                'status' => 'active',
                'priority' => 'high',
                'category' => 'Operations',
                'start_date' => now()->subDays(20),
                'deadline' => now()->addDays(60),
                'budget' => 55000,
                'spent_amount' => 20000,
                'progress' => 40,
                'client_id' => $clients->random()->id,
                'manager_id' => $allUsers->random()->id,
                'team_members' => $allUsers->random(min(3, $allUsers->count()))->pluck('id')->toArray(),
                'tags' => ['Process', 'Efficiency'],
            ],
            [
                'name' => 'Q2 Marketing Campaign',
                'description' => 'Execute Q2 brand awareness and lead generation campaigns',
                'status' => 'active',
                'priority' => 'medium',
                'category' => 'Marketing',
                'start_date' => now()->subDays(10),
                'deadline' => now()->addDays(50),
                'budget' => 32000,
                'spent_amount' => 10000,
                'progress' => 25,
                'client_id' => $clients->random()->id,
                'manager_id' => $allUsers->random()->id,
                'team_members' => $allUsers->random(min(4, $allUsers->count()))->pluck('id')->toArray(),
                'tags' => ['Marketing', 'Campaign'],
            ],
            [
                'name' => 'Annual Financial Audit',
                'description' => 'Review the company’s financial statements for compliance and accuracy',
                'status' => 'draft',
                'priority' => 'critical',
                'category' => 'Finance',
                'start_date' => now()->addDays(5),
                'deadline' => now()->addDays(40),
                'budget' => 45000,
                'spent_amount' => 0,
                'progress' => 0,
                'client_id' => $clients->random()->id,
                'manager_id' => $allUsers->random()->id,
                'team_members' => $allUsers->random(min(2, $allUsers->count()))->pluck('id')->toArray(),
                'tags' => ['Audit', 'Finance'],
            ],
            [
                'name' => 'Employee Onboarding Program',
                'description' => 'Redesign and improve new employee onboarding process',
                'status' => 'completed',
                'priority' => 'high',
                'category' => 'HR',
                'start_date' => now()->subDays(90),
                'end_date' => now()->subDays(5),
                'deadline' => now()->subDays(2),
                'budget' => 28000,
                'spent_amount' => 27000,
                'progress' => 100,
                'client_id' => $clients->random()->id,
                'manager_id' => $allUsers->random()->id,
                'team_members' => $allUsers->random(min(5, $allUsers->count()))->pluck('id')->toArray(),
                'tags' => ['HR', 'Training'],
            ],
        ];

        foreach ($projects as $projectData) {
            $project = Project::create($projectData);
            $this->createMilestonesForProject($project, $allUsers);
        }

        $this->command->info('Business projects seeded successfully!');
    }

    private function createMilestonesForProject(Project $project, $allUsers): void
    {
        $milestoneTemplates = [
            ['name' => 'Kickoff', 'description' => 'Initial alignment and setup', 'priority' => 'high', 'order' => 1],
            ['name' => 'Planning', 'description' => 'Define tasks and responsibilities', 'priority' => 'high', 'order' => 2],
            ['name' => 'Execution', 'description' => 'Complete main activities', 'priority' => 'critical', 'order' => 3],
            ['name' => 'Review', 'description' => 'Evaluate results and feedback', 'priority' => 'medium', 'order' => 4],
            ['name' => 'Closure', 'description' => 'Finalize and report completion', 'priority' => 'critical', 'order' => 5],
        ];

        foreach ($milestoneTemplates as $data) {
            $progress = $project->status === 'completed' ? 100 : rand(0, 80);
            $status = $project->status === 'completed' ? 'completed' : ($progress > 50 ? 'in-progress' : 'pending');

            $project->milestones()->create([
                'name' => $data['name'],
                'description' => $data['description'],
                'priority' => $data['priority'],
                'progress' => $progress,
                'status' => $status,
                'order' => $data['order'],
                'assigned_to' => $allUsers->random()->id,
                'due_date' => $project->start_date->addDays($data['order'] * 10),
                'completion_date' => $status === 'completed' ? now()->subDays(rand(1, 10)) : null,
            ]);
        }
    }
}