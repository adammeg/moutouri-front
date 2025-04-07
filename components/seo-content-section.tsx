export default function SEOContentSection() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Premier Marketplace de Motos et Scooters en Tunisie</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3">Large choix de deux-roues</h3>
            <p className="mb-4">
              Moutouri est la référence pour l'achat et la vente de motos, scooters et cyclomoteurs en Tunisie. 
              Trouvez des modèles de grandes marques comme <strong>Honda</strong>, <strong>Yamaha</strong>, <strong>SYM</strong>, 
              <strong>Vespa</strong>, <strong>Kymco</strong> et bien d'autres.
            </p>
            <p>
              Que vous recherchiez une <strong>moto sportive</strong>, un <strong>scooter urbain</strong>, 
              une <strong>moto cross</strong>, un <strong>trail</strong> ou une <strong>routière</strong>, 
              notre plateforme regroupe des milliers d'annonces de vendeurs particuliers et professionnels.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">Pièces détachées et accessoires</h3>
            <p className="mb-4">
              Besoin de <strong>pièces détachées</strong> pour votre deux-roues ? Moutouri propose également 
              un large choix de <strong>pièces moteur</strong>, <strong>carénages</strong>, <strong>pneus</strong>, 
              <strong>freins</strong>, <strong>filtres</strong> et <strong>accessoires</strong> pour personnaliser 
              votre moto ou scooter.
            </p>
            <p>
              Découvrez également des <strong>casques</strong>, <strong>blousons</strong>, <strong>gants</strong> 
              et autres <strong>équipements de protection</strong> indispensables pour votre sécurité.
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Pourquoi choisir Moutouri ?</h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <li className="bg-card p-4 rounded-lg">
              <h4 className="font-medium mb-2">Plateforme spécialisée</h4>
              <p className="text-sm">100% dédiée aux motos et scooters en Tunisie pour des transactions ciblées.</p>
            </li>
            <li className="bg-card p-4 rounded-lg">
              <h4 className="font-medium mb-2">Annonces vérifiées</h4>
              <p className="text-sm">Nos équipes contrôlent les annonces pour garantir qualité et fiabilité.</p>
            </li>
            <li className="bg-card p-4 rounded-lg">
              <h4 className="font-medium mb-2">Mise en relation directe</h4>
              <p className="text-sm">Contactez directement les vendeurs pour négocier et voir le véhicule.</p>
            </li>
          </ul>
        </div>
        
        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            Cylindrées disponibles : 50cc, 125cc, 250cc, 300cc, 400cc, 500cc, 600cc, 750cc, 900cc, 1000cc et plus.
            Principales villes : Tunis, Sfax, Sousse, Nabeul, Monastir, Bizerte, Kairouan, Gabès, Ariana, Gafsa.
          </p>
        </div>
      </div>
    </section>
  );
} 