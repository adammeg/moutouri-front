export default function SchemaMarkup() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Moutouri",
            "url": "https://www.moutouri.tn",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.moutouri.tn/products?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "description": "Premier marketplace spécialisé dans la vente et l'achat de motos, scooters et pièces détachées en Tunisie"
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Moutouri",
            "url": "https://www.moutouri.tn",
            "logo": "https://www.moutouri.tn/logo-moutouri.png",
            "sameAs": [
              "https://www.facebook.com/moutouri",
              "https://www.instagram.com/moutouri"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+216 90053729",
              "contactType": "customer service",
              "availableLanguage": ["French", "Arabic"]
            },
            "slogan": "La référence des deux-roues en Tunisie"
          })
        }}
      />
    </>
  );
}