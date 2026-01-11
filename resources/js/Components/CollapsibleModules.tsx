import React, { useState, useCallback } from 'react';
import { ChevronRight, Dot } from 'lucide-react'; // Assuming you're using lucide-react

// ==================== TYPES ====================
interface Addon {
  id: number;
  name: string;
  description?: string;
  price?: number;
}

interface Module {
  id: number;
  name: string;
  description?: string;
  addons?: Addon[];
  icon?: string;
}

interface CollapsibleModulesProps {
  modules: Module[];
  defaultOpenIds?: number[];
  showAddonDetails?: boolean;
  onModuleToggle?: (moduleId: number, isOpen: boolean) => void;
}

// ==================== MAIN COMPONENT ====================
function CollapsibleModules({ 
  modules,
  defaultOpenIds = [],
  showAddonDetails = false,
  onModuleToggle
}: CollapsibleModulesProps) {
  // Initialize state with default open modules
  const [openModules, setOpenModules] = useState<{ [key: number]: boolean }>(() => {
    const initial: { [key: number]: boolean } = {};
    defaultOpenIds.forEach(id => {
      initial[id] = true;
    });
    return initial;
  });

  // Memoized toggle function for better performance
  const toggleModule = useCallback((id: number) => {
    setOpenModules((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      
      // Call optional callback
      if (onModuleToggle) {
        onModuleToggle(id, newState[id]);
      }
      
      return newState;
    });
  }, [onModuleToggle]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, moduleId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleModule(moduleId);
    }
  }, [toggleModule]);

  // Empty state
  if (!modules || modules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No modules available</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2" role="list">
      {modules.map((module) => {
        const isOpen = !!openModules[module.id];
        const hasAddons = module.addons && module.addons.length > 0;

        return (
          <li 
            key={module.id} 
            className="flex flex-col"
          >
            {/* Module Header Button */}
            <button
              type="button"
              className="flex items-center w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 group transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                toggleModule(module.id);
              }}
              onKeyDown={(e) => handleKeyDown(e, module.id)}
              aria-expanded={isOpen}
              aria-controls={hasAddons ? `module-addons-${module.id}` : undefined}
              aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${module.name}`}
            >
              {/* Chevron Icon */}
              <ChevronRight
                className={`w-4 h-4 text-green-500 mr-2 transform transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? 'rotate-90' : ''
                }`}
                strokeWidth={2.5}
                aria-hidden="true"
              />

              {/* Module Name & Price */}
              <span className="font-semibold text-left flex-1 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {module.name}
                {typeof module.price === 'number' ? (
                  <span className="ml-2 text-green-600 dark:text-green-400 text-sm font-medium">ZMW {module.price.toFixed(2)}</span>
                ) : (
                  module.price !== undefined && (
                    <span className="ml-2 text-green-600 dark:text-green-400 text-sm font-medium">ZMW {module.price}</span>
                  )
                )}
              </span>

              {/* Addon Count Badge */}
              {hasAddons && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                  {module.addons!.length}
                </span>
              )}
            </button>

            {/* Module Description (Optional) */}
            {module.description && isOpen && (
              <p className="ml-6 mt-1 text-sm text-gray-600 dark:text-gray-400">
                {module.description}
              </p>
            )}

            {/* Addons List */}
            {hasAddons && isOpen && (
              <ul
                id={`module-addons-${module.id}`}
                className="mt-2 ml-6 space-y-1 animate-fadeIn"
                role="list"
                aria-label={`Addons for ${module.name}`}
              >
                {module.addons!.map((addon) => (
                  <li 
                    key={addon.id} 
                    className="flex items-start group/addon"
                  >
                    <Dot 
                      className="w-4 h-4 text-blue-400 dark:text-blue-500 mr-2 flex-shrink-0 mt-0.5" 
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover/addon:text-blue-600 dark:group-hover/addon:text-blue-400 transition-colors duration-200">
                        {addon.name}
                      </span>
                      
                      {/* Always show addon price, optionally show details */}
                      <div className="mt-0.5 space-y-0.5">
                        {showAddonDetails && addon.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {addon.description}
                          </p>
                        )}
                        {typeof addon.price === 'number' ? (
                          <p className="text-xs font-medium text-green-600 dark:text-green-400">
                            +ZMW {addon.price.toFixed(2)}
                          </p>
                        ) : (
                          addon.price !== undefined && (
                            <p className="text-xs font-medium text-green-600 dark:text-green-400">
                              +ZMW {addon.price}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default CollapsibleModules;

// ==================== USAGE EXAMPLES ====================

/*
// Basic Usage
<CollapsibleModules modules={modules} />

// With Default Open Modules
<CollapsibleModules 
  modules={modules}
  defaultOpenIds={[1, 2, 3]}
/>

// With Addon Details
<CollapsibleModules 
  modules={modules}
  showAddonDetails={true}
/>

// With Callback
<CollapsibleModules 
  modules={modules}
  onModuleToggle={(moduleId, isOpen) => {
    console.log(`Module ${moduleId} is now ${isOpen ? 'open' : 'closed'}`);
  }}
/>
*/

// ==================== CSS ADDITIONS ====================
/*
Add this to your global CSS or Tailwind config for the fadeIn animation:

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

Or add to tailwind.config.js:

module.exports = {
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out'
      }
    }
  }
}
*/  