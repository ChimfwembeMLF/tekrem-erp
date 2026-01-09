# Multi-Tenancy: Tables, Migrations, and Models Needing company_id

This checklist tracks all tables, migrations, and models that should include a company_id for full multi-tenancy and data separation.

## Tables / Migrations / Models

- [ ] invoice_items (migration, model)
- [x] invoices (migration, model)
- [x] budgets (migration, model)
- [x] projects (migration, model)
- [x] accounts (already present, verify)
- [ ] module_billings (migration, model)
- [ ] company_modules (migration, model)
- [ ] tasks (migration, model)
- [x] sprints (migration, model)
- [x] boards (migration, model)
- [x] board_columns (migration, model)
- [x] board_cards (migration, model)
- [ ] files (migration, model)
- [x] communications (migration, model)
- [ ] notifications (migration, model)
- [ ] Any other custom tables that store company-specific data

## Instructions
- For each item, add a nullable company_id column in the migration if not present.
- Update the model: add company_id to $fillable, add belongsTo('Company'), and always scope queries by company.
- Update controllers/services to always filter, create, and update records using the current company context.

---
Mark each item as complete after updating.
