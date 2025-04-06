export default function SchemaMarkup() {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Moutouri",
            "url": "https://www.moutouri.tn",
            "logo": "https://www.moutouri.tn/logo-moutouri.ico",
            "sameAs": [
              "https://www.facebook.com/moutouri",
              "https://www.instagram.com/moutouri"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+216 90053729",
              "contactType": "customer service",
              "availableLanguage": ["French", "Arabic"]
            }
          })
        }}
      />
    );
  }