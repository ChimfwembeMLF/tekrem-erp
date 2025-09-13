# Agile PMS Refactor Todo List

This file tracks the major tasks required to refactor the project management system for full Agile support.

## Tasks

1. Remove milestone approval logic
   - Delete milestone approval settings and code from ProjectSetupController.php and related config. Remove any UI or API endpoints for milestone approval.

2. Remove waterfall/legacy milestone templates
   - Delete legacy milestone templates and phases from ProjectSeeder.php and ProjectPlanningAIService.php. Replace with Agile concepts (Sprints, User Stories, Epics).

3. Remove manual status/closure meetings
   - Delete communication templates for status meetings, closure meetings, requirements gathering from CommunicationSeeder.php.

4. Remove milestone budgets
   - Delete milestone-level budget tracking from ProjectSetupController.php and related config.

5. Remove time approval logic
   - Delete time approval logic/settings from ProjectSetupController.php and related config.

6. Remove rigid progress/completion tracking
   - Refactor ProjectMilestone.php and Project.php to remove logic that marks projects complete only when all milestones are done. Make completion iterative.

7. Remove documentation-heavy phases
   - Delete phases/tasks focused on documentation, requirements analysis, contract review from ProjectSeeder.php and CommunicationSeeder.php.

8. Remove non-Agile roles/permissions
   - Delete permissions for hierarchical approvals (approve leave, approve performance, approve milestones) from RolesAndPermissionsSeeder.php.

9. Add Agile entities and features
   - Add models, migrations, and UI for Sprints, Backlog, User Stories, Epics, Kanban/Scrum boards, Story Points, Sprint Reviews, Retrospectives. Replace 'milestones' with 'sprints' and 'user stories'.
