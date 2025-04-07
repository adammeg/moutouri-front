import { ChevronRight } from "lucide-react";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Generate JSON-LD for breadcrumbs
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://moutouri.tn${item.href}`
    }))
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      
      <nav className={`flex ${className}`} aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1 text-sm">
          {items.map((item, index) => (
            <li key={item.href}>
              <div className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                )}
                {item.current ? (
                  <span className="text-muted-foreground" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    href={item.href}
                    className="text-primary hover:text-primary/80"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
} 