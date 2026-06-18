import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowRight } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

export interface ModuleCard {
  key: string;
  name: string;
  description: string;
  route: string;
  metrics: Array<{ label: string; value: string | number }>;
}

interface ModuleCardGridProps {
  modules: ModuleCard[];
}

export default function ModuleCardGrid({ modules }: ModuleCardGridProps) {
  const route = useRoute();

  if (!modules.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module) => (
        <Link key={module.key} href={route(module.route)}>
          <Card className="h-full transition-colors hover:bg-accent/30">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{module.name}</CardTitle>
                  <CardDescription className="mt-1">{module.description}</CardDescription>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {module.metrics.slice(0, 4).map((metric) => (
                  <div key={metric.label}>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-lg font-semibold">{metric.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
