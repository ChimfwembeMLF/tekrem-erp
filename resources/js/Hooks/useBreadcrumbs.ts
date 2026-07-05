import { useMemo } from 'react';
import useRoute from '@/Hooks/useRoute';
import useTranslate from '@/Hooks/useTranslate';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
  icon?: React.ElementType;
}

export default function useBreadcrumbs(): BreadcrumbItem[] {
  const route = useRoute();
  const { t } = useTranslate();

  return useMemo(() => {
    const currentRoute = route().current();
    const breadcrumbs: BreadcrumbItem[] = [];

    const isPublicRoute = (name: string) =>
      name === 'home' ||
      name.startsWith('shop.') ||
      name.startsWith('guest.') ||
      name.startsWith('guest-chat.') ||
      name === 'about' ||
      name === 'services' ||
      name.startsWith('services.') ||
      name === 'portfolio' ||
      name === 'contact' ||
      name === 'careers.index' ||
      name.startsWith('careers.') ||
      name === 'help' ||
      name === 'faq' ||
      name.startsWith('terms.') ||
      name.startsWith('privacy-policy.') ||
      name.startsWith('refund-policy.') ||
      (name.startsWith('support.') && !name.startsWith('support.chatbot.') && name !== 'support.dashboard');

    const pushCrud = (prefix: string) => {
      if (currentRoute === `${prefix}.create`) {
        breadcrumbs.push({ label: t('common.create', 'Create'), isActive: true });
      } else if (currentRoute === `${prefix}.edit`) {
        breadcrumbs.push({ label: t('common.edit', 'Edit'), isActive: true });
      } else if (currentRoute === `${prefix}.show`) {
        breadcrumbs.push({ label: t('common.details', 'Details'), isActive: true });
      } else if (currentRoute === `${prefix}.index`) {
        breadcrumbs[breadcrumbs.length - 1].isActive = true;
      }
    };

    if (!currentRoute) {
      return breadcrumbs;
    }

    // Public shop
    if (currentRoute.startsWith('shop.')) {
      breadcrumbs.push({
        label: t('shop.title', 'Shop'),
        href: route('shop.index'),
        isActive: currentRoute === 'shop.index',
      });
      if (currentRoute === 'shop.show') {
        breadcrumbs.push({ label: t('common.details', 'Product'), isActive: true });
      } else if (currentRoute === 'shop.cart') {
        breadcrumbs.push({ label: t('shop.cart', 'Cart'), isActive: true });
      } else if (currentRoute === 'shop.checkout') {
        breadcrumbs.push({ label: t('shop.checkout', 'Checkout'), isActive: true });
      } else if (currentRoute === 'shop.order.confirmation') {
        breadcrumbs.push({ label: t('shop.confirmation', 'Order Confirmed'), isActive: true });
      }
      return breadcrumbs;
    }

    if (isPublicRoute(currentRoute)) {
      return breadcrumbs;
    }

    // App routes: prepend dashboard link (except on dashboard itself)
    if (currentRoute !== 'dashboard') {
      breadcrumbs.push({
        label: t('navigation.dashboard', 'Dashboard'),
        href: route('dashboard'),
      });
    }

    // Route-specific breadcrumb generation
    if (currentRoute) {
      // CRM Module
      if (currentRoute.startsWith('crm.')) {
        breadcrumbs.push({
          label: t('crm.title', 'CRM'),
          href: route('crm.dashboard'),
        });

        if (currentRoute.startsWith('crm.clients.')) {
          breadcrumbs.push({
            label: t('crm.clients', 'Clients'),
            href: route('crm.clients.index'),
          });

          if (currentRoute === 'crm.clients.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.clients.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.clients.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('crm.leads.')) {
          breadcrumbs.push({
            label: t('crm.leads', 'Leads'),
            href: route('crm.leads.index'),
          });

          if (currentRoute === 'crm.leads.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.leads.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.leads.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('crm.communications.')) {
          breadcrumbs.push({
            label: t('crm.communications', 'Communications'),
            href: route('crm.communications.index'),
          });

          if (currentRoute === 'crm.communications.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.communications.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.communications.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('crm.livechat.')) {
          breadcrumbs.push({
            label: t('crm.chat', 'LiveChat'),
            href: route('crm.livechat.index'),
            isActive: true,
          });
        }

        if (currentRoute.startsWith('crm.analytics.')) {
          breadcrumbs.push({
            label: t('crm.analytics', 'Analytics'),
            href: route('crm.analytics.dashboard'),
          });

          if (currentRoute === 'crm.analytics.reports') {
            breadcrumbs.push({
              label: t('common.reports', 'Reports'),
              isActive: true,
            });
          }
        }

        if (currentRoute === 'crm.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        }
      }

      // Finance Module
      if (currentRoute.startsWith('finance.')) {
        breadcrumbs.push({
          label: t('finance.title', 'Finance'),
          href: route('finance.dashboard'),
        });

        if (currentRoute.startsWith('finance.accounts.')) {
          breadcrumbs.push({
            label: t('finance.accounts', 'Accounts'),
            href: route('finance.accounts.index'),
          });

          if (currentRoute === 'finance.accounts.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.accounts.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.accounts.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.transactions.')) {
          breadcrumbs.push({
            label: t('finance.transactions', 'Transactions'),
            href: route('finance.transactions.index'),
          });

          if (currentRoute === 'finance.transactions.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.transactions.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.transactions.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.invoices.')) {
          breadcrumbs.push({
            label: t('finance.invoices', 'Invoices'),
            href: route('finance.invoices.index'),
          });

          if (currentRoute === 'finance.invoices.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.invoices.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.invoices.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.payments.')) {
          breadcrumbs.push({
            label: t('finance.payments', 'Payments'),
            href: route('finance.payments.index'),
          });

          if (currentRoute === 'finance.payments.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.payments.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.payments.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.expenses.')) {
          breadcrumbs.push({
            label: t('finance.expenses', 'Expenses'),
            href: route('finance.expenses.index'),
          });

          if (currentRoute === 'finance.expenses.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.expenses.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.expenses.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.budgets.')) {
          breadcrumbs.push({
            label: t('finance.budgets', 'Budgets'),
            href: route('finance.budgets.index'),
          });

          if (currentRoute === 'finance.budgets.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.budgets.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.budgets.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.reports.')) {
          breadcrumbs.push({
            label: t('common.reports', 'Reports'),
            href: route('finance.reports.index'),
          });

          if (currentRoute === 'finance.reports.income-statement') {
            breadcrumbs.push({
              label: t('finance.income_statement', 'Income Statement'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.reports.cash-flow') {
            breadcrumbs.push({
              label: t('finance.cash_flow', 'Cash Flow'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.reports.balance-sheet') {
            breadcrumbs.push({
              label: t('finance.balance_sheet', 'Balance Sheet'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.reports.expense-report') {
            breadcrumbs.push({
              label: t('finance.expense_report', 'Expense Report'),
              isActive: true,
            });
          }
        }

        if (currentRoute === 'finance.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        }
      }

      // HR Module
      if (currentRoute.startsWith('hr.')) {
        breadcrumbs.push({
          label: t('hr.title', 'HR'),
          href: route('hr.dashboard'),
        });

        if (currentRoute === 'hr.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        }
      }

       // HR Module
       if (currentRoute.startsWith('customer.')) {
        breadcrumbs.push({
          label: t('customer.title', 'Customer'),
          href: route('customer.dashboard'),
        });

        if (currentRoute === 'customer.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        }
      }

      // Projects Module
      if (currentRoute.startsWith('projects.')) {
        breadcrumbs.push({
          label: t('projects.title', 'Projects'),
          href: route('projects.index'),
        });

        if (currentRoute === 'projects.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        } else if (currentRoute === 'projects.index') {
          breadcrumbs.push({
            label: t('projects.all_projects', 'All Projects'),
            isActive: true,
          });
        } else if (currentRoute === 'projects.create') {
          breadcrumbs.push({
            label: t('common.create', 'Create Project'),
            isActive: true,
          });
        } else if (currentRoute === 'projects.show') {
          breadcrumbs.push({
            label: t('common.details', 'Project Details'),
            isActive: true,
          });
        } else if (currentRoute === 'projects.edit') {
          breadcrumbs.push({
            label: t('common.edit', 'Edit Project'),
            isActive: true,
          });
        } else if (currentRoute === 'projects.analytics') {
          breadcrumbs.push({
            label: t('projects.analytics', 'Analytics'),
            isActive: true,
          });
        } else if (currentRoute === 'projects.my-tasks') {
          breadcrumbs.push({
            label: t('projects.my_tasks', 'My Tasks'),
            isActive: true,
          });
        } else if (currentRoute.startsWith('projects.templates.')) {
          breadcrumbs.push({
            label: t('projects.templates', 'Templates'),
            href: route('projects.templates.index'),
            isActive: currentRoute === 'projects.templates.index',
          });

          if (currentRoute === 'projects.templates.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'projects.templates.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'projects.templates.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        } else if (currentRoute.startsWith('projects.tags.')) {
          breadcrumbs.push({
            label: t('projects.tags', 'Tags'),
            href: route('projects.tags.index'),
            isActive: currentRoute === 'projects.tags.index',
          });

          if (currentRoute === 'projects.tags.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'projects.tags.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'projects.tags.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }
      }

      // Support Module
      if (currentRoute.startsWith('support.')) {
        breadcrumbs.push({
          label: t('support.title', 'Support'),
          href: route('support.dashboard'),
        });

        if (currentRoute.startsWith('support.tickets.')) {
          breadcrumbs.push({
            label: t('support.tickets', 'Tickets'),
            href: route('support.tickets.index'),
          });
          pushCrud('support.tickets');
        } else if (currentRoute.startsWith('support.knowledge-base.')) {
          breadcrumbs.push({
            label: t('support.knowledge_base', 'Knowledge Base'),
            href: route('support.knowledge-base.index'),
            isActive: currentRoute === 'support.knowledge-base.index',
          });
          pushCrud('support.knowledge-base');
        } else if (currentRoute === 'support.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        } else if (currentRoute.startsWith('support.chatbot.')) {
          breadcrumbs.push({
            label: t('support.chatbot', 'Chatbot'),
            isActive: true,
          });
        }
      }

      // Inventory Module
      if (currentRoute.startsWith('inventory.')) {
        breadcrumbs.push({
          label: t('inventory.title', 'Inventory'),
          href: route('inventory.dashboard'),
        });

        if (currentRoute.startsWith('inventory.products.')) {
          breadcrumbs.push({
            label: t('inventory.products', 'Products'),
            href: route('inventory.products.index'),
          });
          pushCrud('inventory.products');
        } else if (currentRoute.startsWith('inventory.warehouses.')) {
          breadcrumbs.push({
            label: t('inventory.warehouses', 'Warehouses'),
            href: route('inventory.warehouses.index'),
            isActive: currentRoute === 'inventory.warehouses.index',
          });
          if (currentRoute === 'inventory.warehouses.stock') {
            breadcrumbs.push({ label: t('inventory.stock', 'Stock'), isActive: true });
          }
        } else if (currentRoute === 'inventory.dashboard') {
          breadcrumbs.push({ label: t('navigation.dashboard', 'Dashboard'), isActive: true });
        }
      }

      // Procurement Module
      if (currentRoute.startsWith('procurement.')) {
        breadcrumbs.push({
          label: t('procurement.title', 'Procurement'),
          href: route('procurement.dashboard'),
        });

        if (currentRoute.startsWith('procurement.suppliers.')) {
          breadcrumbs.push({
            label: t('procurement.suppliers', 'Suppliers'),
            href: route('procurement.suppliers.index'),
            isActive: currentRoute === 'procurement.suppliers.index',
          });
        } else if (currentRoute.startsWith('procurement.purchase-orders.')) {
          breadcrumbs.push({
            label: t('procurement.purchase_orders', 'Purchase Orders'),
            href: route('procurement.purchase-orders.index'),
          });
          pushCrud('procurement.purchase-orders');
        } else if (currentRoute === 'procurement.dashboard') {
          breadcrumbs.push({ label: t('navigation.dashboard', 'Dashboard'), isActive: true });
        }
      }

      // Sales Module
      if (currentRoute.startsWith('sales.')) {
        breadcrumbs.push({
          label: t('sales.title', 'Sales'),
          href: route('sales.dashboard'),
        });

        if (currentRoute.startsWith('sales.orders.')) {
          breadcrumbs.push({
            label: t('sales.orders', 'Orders'),
            href: route('sales.orders.index'),
          });
          pushCrud('sales.orders');
        } else if (currentRoute === 'sales.dashboard') {
          breadcrumbs.push({ label: t('navigation.dashboard', 'Dashboard'), isActive: true });
        }
      }

      // POS Module
      if (currentRoute.startsWith('pos.')) {
        breadcrumbs.push({
          label: t('pos.title', 'POS'),
          href: route('pos.index'),
          isActive: currentRoute === 'pos.index',
        });
        if (currentRoute === 'pos.terminal') {
          breadcrumbs.push({ label: t('pos.terminal', 'Terminal'), isActive: true });
        }
      }

      // Ecommerce Admin
      if (currentRoute.startsWith('ecommerce.')) {
        breadcrumbs.push({
          label: t('ecommerce.title', 'Ecommerce'),
          href: route('ecommerce.dashboard'),
          isActive: currentRoute === 'ecommerce.dashboard',
        });

        if (currentRoute.startsWith('ecommerce.orders.')) {
          breadcrumbs.push({ label: t('ecommerce.orders', 'Orders'), href: route('ecommerce.orders.index') });
          pushCrud('ecommerce.orders');
        } else if (currentRoute.startsWith('ecommerce.shipping.')) {
          breadcrumbs.push({ label: t('ecommerce.shipping', 'Shipping'), href: route('ecommerce.shipping.index') });
          pushCrud('ecommerce.shipping');
        } else if (currentRoute.startsWith('ecommerce.coupons.')) {
          breadcrumbs.push({ label: t('ecommerce.coupons', 'Coupons'), href: route('ecommerce.coupons.index') });
          pushCrud('ecommerce.coupons');
        } else if (currentRoute.startsWith('ecommerce.reviews.')) {
          breadcrumbs.push({ label: t('ecommerce.reviews', 'Reviews'), href: route('ecommerce.reviews.index') });
          pushCrud('ecommerce.reviews');
        } else if (currentRoute.startsWith('ecommerce.settings.')) {
          breadcrumbs.push({ label: t('ecommerce.settings', 'Settings'), href: route('ecommerce.settings.edit') });
        }
      }

      // AI Module
      if (currentRoute.startsWith('ai.')) {
        breadcrumbs.push({
          label: t('ai.title', 'AI'),
          href: route('ai.dashboard'),
        });

        if (currentRoute.startsWith('ai.services.')) {
          breadcrumbs.push({ label: t('ai.services', 'Services'), href: route('ai.services.index') });
          pushCrud('ai.services');
        } else if (currentRoute.startsWith('ai.models.')) {
          breadcrumbs.push({ label: t('ai.models', 'Models'), href: route('ai.models.index') });
          pushCrud('ai.models');
        } else if (currentRoute.startsWith('ai.prompt-templates.')) {
          breadcrumbs.push({ label: t('ai.prompts', 'Prompts'), href: route('ai.prompt-templates.index') });
          pushCrud('ai.prompt-templates');
        } else if (currentRoute === 'ai.dashboard') {
          breadcrumbs.push({ label: t('navigation.dashboard', 'Dashboard'), isActive: true });
        }
      }

      // Admin Module
      if (currentRoute.startsWith('admin.')) {
        breadcrumbs.push({
          label: t('admin.title', 'Admin'),
          href: route('admin.users.index'),
        });

        if (currentRoute.startsWith('admin.users.')) {
          breadcrumbs.push({ label: t('admin.users', 'Users'), href: route('admin.users.index') });
          pushCrud('admin.users');
        } else if (currentRoute.startsWith('admin.roles.')) {
          breadcrumbs.push({ label: t('admin.roles', 'Roles'), href: route('admin.roles.index') });
          pushCrud('admin.roles');
        } else if (currentRoute.startsWith('admin.permissions.')) {
          breadcrumbs.push({ label: t('admin.permissions', 'Permissions'), href: route('admin.permissions.index') });
          pushCrud('admin.permissions');
        } else if (currentRoute.startsWith('admin.modules.')) {
          breadcrumbs.push({ label: t('admin.modules', 'Modules'), href: route('admin.modules.index') });
          pushCrud('admin.modules');
        }
      }

      // Analytics Module
      if (currentRoute.startsWith('analytics.')) {
        breadcrumbs.push({
          label: t('analytics.title', 'Analytics'),
          href: route('analytics.dashboard'),
        });

        if (currentRoute === 'analytics.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        }
      }

      // Settings
      if (currentRoute.startsWith('settings.')) {
        breadcrumbs.push({
          label: t('navigation.settings', 'Settings'),
          href: route('settings.index'),
        });

        if (currentRoute === 'settings.general') {
          breadcrumbs.push({
            label: t('settings.general', 'General'),
            isActive: true,
          });
        } else if (currentRoute === 'settings.users') {
          breadcrumbs.push({
            label: t('settings.users', 'Users'),
            isActive: true,
          });
        } else if (currentRoute === 'settings.advanced.index') {
          breadcrumbs.push({
            label: t('settings.advanced', 'Advanced'),
            isActive: true,
          });
        } else if (currentRoute === 'settings.notifications') {
          breadcrumbs.push({
            label: t('navigation.notifications', 'Notifications'),
            isActive: true,
          });
        }
      }

      // AI Conversation Export (under CRM)
      if (currentRoute.startsWith('crm.ai-conversations.')) {
        breadcrumbs.push({
          label: t('crm.title', 'CRM'),
          href: route('crm.dashboard'),
        });
        breadcrumbs.push({
          label: 'AI Conversation Export',
          isActive: true,
        });
      }

      // Profile
      if (currentRoute === 'profile.show') {
        breadcrumbs.push({
          label: t('navigation.profile', 'Profile'),
          isActive: true,
        });
      }

      // Notifications
      if (currentRoute === 'notifications.index') {
        breadcrumbs.push({
          label: t('navigation.notifications', 'Notifications'),
          isActive: true,
        });
      }

      // Dashboard
      if (currentRoute === 'dashboard') {
        breadcrumbs.push({
          label: t('navigation.dashboard', 'Dashboard'),
          isActive: true,
        });
      }
    }

    return breadcrumbs;
  }, [route, t]);
}
