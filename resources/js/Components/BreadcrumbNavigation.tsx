import React from "react";
import { Link } from "@inertiajs/react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import useBreadcrumbs from "@/Hooks/useBreadcrumbs";
import { Home, ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
  isActive?: boolean;
  icon?: React.ElementType;
}

export default function BreadcrumbNavigation({ className }: { className?: string }) {
  const dynamicCrumbs = useBreadcrumbs() as Crumb[];

  const breadcrumbs: Crumb[] = [
    {
      label: "",
      href: "/dashboard",
      icon: Home,
      isActive: dynamicCrumbs.length === 0,
    },
    ...dynamicCrumbs,
  ];

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          const Icon = breadcrumb.icon;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {breadcrumb.isActive ? (
                  <BreadcrumbPage>
                    {Icon && <Icon className="w-4 h-4" />}
                    {breadcrumb.label && (
                      <span className="ml-1">{breadcrumb.label}</span>
                    )}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={breadcrumb.href!}>
                      {Icon && <Icon className="w-4 h-4" />}
                      {breadcrumb.label && (
                        <span className="ml-1">{breadcrumb.label}</span>
                      )}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
