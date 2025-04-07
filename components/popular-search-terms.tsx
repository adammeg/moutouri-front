import Link from "next/link";

export default function PopularSearchTerms() {
  const popularTerms = [
    { term: 'Honda PCX', url: '/products?q=honda%20pcx' },
    { term: 'Yamaha TMAX', url: '/products?q=yamaha%20tmax' },
    { term: 'SYM GTS', url: '/products?q=sym%20gts' },
    { term: 'Vespa Primavera', url: '/products?q=vespa%20primavera' },
    { term: 'Kymco Agility', url: '/products?q=kymco%20agility' },
    { term: 'Ducati Monster', url: '/products?q=ducati%20monster' },
    { term: 'BMW GS', url: '/products?q=bmw%20gs' },
    { term: 'Casque moto', url: '/products?q=casque%20moto' },
    { term: 'Pièces moteur', url: '/products?q=pieces%20moteur' },
    { term: 'Pneus moto', url: '/products?q=pneus%20moto' },
  ];

  return (
    <div className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-medium mb-4 text-center">Recherches populaires</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {popularTerms.map((item, index) => (
            <Link 
              key={index}
              href={item.url}
              className="text-sm px-3 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
            >
              {item.term}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 