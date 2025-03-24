import Link from "next/link"
import { BikeIcon as Motorcycle, Sparkles, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import GoogleAdSense from '@/components/google-adsense'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-black text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Motorcycle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Moutouri</h1>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="ghost" className="text-white hover:text-primary">
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/register">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-black to-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">La Marketplace Ultime pour Motards</h2>
            <p className="text-xl md:text-2xl mb-10 text-muted-foreground max-w-3xl mx-auto">
              Achetez, vendez et échangez des motos, scooters et pièces dans une communauté créée par des motards, pour
              des motards.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg">
              <Link href="/register">Rejoindre la Communauté</Link>
            </Button>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Explorez les Catégories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-primary/20 hover:border-primary transition-colors">
              <CardHeader className="text-center">
                <Motorcycle className="w-12 h-12 mx-auto text-primary" />
                <CardTitle>Motos</CardTitle>
                <CardDescription>Sportives, cruisers, aventure et plus</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Trouvez votre moto de rêve parmi des milliers d'annonces de motards. Toutes marques et modèles
                  disponibles.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button asChild variant="outline">
                  <Link href="/login">Parcourir les Motos</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary transition-colors">
              <CardHeader className="text-center">
                <Sparkles className="w-12 h-12 mx-auto text-primary" />
                <CardTitle>Scooters</CardTitle>
                <CardDescription>Urbains et options électriques</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Découvrez des scooters efficaces et élégants pour la conduite en ville. Options électriques et à
                  essence disponibles.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button asChild variant="outline">
                  <Link href="/login">Parcourir les Scooters</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary transition-colors">
              <CardHeader className="text-center">
                <Wrench className="w-12 h-12 mx-auto text-primary" />
                <CardTitle>Pièces</CardTitle>
                <CardDescription>Composants d'origine et aftermarket</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Achetez des pièces de qualité pour réparer, entretenir ou améliorer votre moto. Pièces neuves et
                  d'occasion de vendeurs de confiance.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button asChild variant="outline">
                  <Link href="/login">Parcourir les Pièces</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">Pourquoi Choisir Moutouri?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3">Vendeurs Vérifiés</h3>
                <p>
                  Notre communauté de vendeurs est vérifiée pour garantir des annonces légitimes et des transactions
                  sécurisées.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3">Annonces Détaillées</h3>
                <p>Informations complètes sur les produits, images de haute qualité et transparence des prix.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3">Communauté de Motards</h3>
                <p>
                  Connectez-vous avec d'autres passionnés qui partagent votre passion pour les motos et la conduite.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3">Messagerie Sécurisée</h3>
                <p>
                  Communiquez en toute sécurité avec les acheteurs et vendeurs via notre système de messagerie intégré.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3">Publication Facile</h3>
                <p>Publiez vos articles à vendre rapidement grâce à notre processus simplifié et convivial.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3">Compatible Mobile</h3>
                <p>Accédez à la marketplace n'importe quand, n'importe où depuis votre smartphone ou tablette.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Horizontal ad at the top */}
        <GoogleAdSense
          slot="2488891530"
          format="horizontal"
          className="adsense-container"
        />

        {/* Responsive ad in the middle */}
        <GoogleAdSense
          slot="2488891530"
          className="adsense-container my-8"
        />
      </main>

      <footer className="bg-black text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img src="/logo-moutouri.png" alt="Moutouri" className="h-6 w-6" />
              <span className="text-xl font-bold">Moutouri</span>
            </div>
            <div className="flex gap-8">
              <p className="hover:text-primary">
                Contactez-nous
              </p>
              <p>
                Moutouri est une plateforme de vente et d'achat de motos et de scooters en Tunisie.
                <br></br>
                Pour Contacter Moutouri, veuillez nous contacter à l'adresse suivante :
                <br></br>
                adam.bhedj13@gmail.com
                <br></br>
                +216 90053729
              </p>
            </div>
          </div>
          <div className="mt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Moutouri. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

