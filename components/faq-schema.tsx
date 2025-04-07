export default function FAQSchema() {
  const faqs = [
    {
      question: "Comment vendre ma moto sur Moutouri ?",
      answer: "Pour vendre votre moto sur Moutouri, créez un compte, cliquez sur 'Publier une annonce', remplissez les détails de votre moto (marque, modèle, année, kilométrage, etc.), ajoutez des photos de qualité et fixez votre prix. Une fois soumise, votre annonce sera visible par tous les utilisateurs."
    },
    {
      question: "Quelles sont les marques de scooters les plus populaires en Tunisie ?",
      answer: "En Tunisie, les marques de scooters les plus populaires sont SYM, Vespa, Kymco, Honda, Yamaha et MBK. Ces marques sont appréciées pour leur fiabilité, leur disponibilité des pièces détachées et leur valeur de revente."
    },
    {
      question: "Puis-je acheter des pièces détachées pour ma moto sur Moutouri ?",
      answer: "Oui, Moutouri propose une large sélection de pièces détachées pour motos et scooters. Vous pouvez trouver des pièces neuves et d'occasion pour la plupart des marques populaires en Tunisie."
    },
    {
      question: "Quelle cylindrée de moto puis-je conduire avec un permis A2 ?",
      answer: "Avec un permis A2, vous pouvez conduire des motos d'une puissance maximale de 35 kW (environ 47 ch) et d'un rapport puissance/poids ne dépassant pas 0,2 kW/kg. Cela inclut généralement des motos jusqu'à 500-650cc selon le modèle."
    },
    {
      question: "Comment négocier le prix d'une moto d'occasion ?",
      answer: "Pour négocier efficacement, renseignez-vous sur le prix du marché, inspectez la moto pour identifier d'éventuels défauts, demandez l'historique d'entretien, et faites une offre raisonnable en justifiant votre prix. Soyez prêt à un compromis et restez courtois pendant la négociation."
    }
  ];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
} 