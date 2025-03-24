'use client';

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BikeIcon as Motorcycle, Sparkles, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleAdSense from '@/components/google-adsense';
import HeroBackground from "@/components/hero-background";
import PromotionalAds from '@/components/promotional-ads';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-black text-white py-6 relative z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-moutouri.png"
              alt="Moutouri"
              width={32}
              height={32}
              className="h-8 w-8"
            />
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
        {/* Hero section with animated background */}
        <section className="py-24 relative overflow-hidden">
          <HeroBackground />

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                La Marketplace Ultime pour Motards
              </h2>
            </motion.div>
            <section className="container mx-auto px-4 -mt-6 mb-12">
              <PromotionalAds position="home-hero" className="shadow-lg" />
            </section>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto">
                Achetez, vendez et échangez des motos, scooters et pièces dans une communauté
                créée par des motards, pour des motards.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg">
                <Link href="/register">Rejoindre la Communauté</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Categories section with images */}
        <section className="py-16 container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-10 text-center"
          >
            Explorez les Catégories
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeIn} transition={{ duration: 0.5 }}>
              <Card className="border-2 border-primary/20 hover:border-primary transition-all duration-300 overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="images/sportbike.jpg"
                    alt="Moto sportive"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
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
            </motion.div>

            <motion.div variants={fadeIn} transition={{ duration: 0.5 }}>
              <Card className="border-2 border-primary/20 hover:border-primary transition-all duration-300 overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="images/scooter.png"
                    alt="Scooter électrique"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
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
            </motion.div>

            <motion.div variants={fadeIn} transition={{ duration: 0.5 }}>
              <Card className="border-2 border-primary/20 hover:border-primary transition-all duration-300 overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="images/parts.png"
                    alt="Pièces de moto"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
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
            </motion.div>
          </motion.div>
        </section>

        {/* Features section with animations */}
        <section className="py-16 bg-muted relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-10 text-center"
            >
              Pourquoi Choisir Moutouri?
            </motion.h2>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                { title: "Vendeurs Vérifiés", desc: "Notre communauté de vendeurs est vérifiée pour garantir des annonces légitimes et des transactions sécurisées." },
                { title: "Annonces Détaillées", desc: "Informations complètes sur les produits, images de haute qualité et transparence des prix." },
                { title: "Communauté de Motards", desc: "Connectez-vous avec d'autres passionnés qui partagent votre passion pour les motos et la conduite." },
                { title: "Publication Facile", desc: "Publiez vos articles à vendre rapidement grâce à notre processus simplifié et convivial." },
                { title: "Compatible Mobile", desc: "Accédez à la marketplace n'importe quand, n'importe où depuis votre smartphone ou tablette." }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <motion.h3
                    className="text-xl font-bold mb-3 text-primary"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <p>{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonial section (new) */}
        <section className="py-16 container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-10 text-center"
          >
            Ce que disent nos utilisateurs
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeIn}
              className="bg-card p-6 rounded-lg shadow border border-primary/10"
            >
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-primary/10 p-2 mr-4">
                  <Image
                    src="images/avatar1.png"
                    alt="Utilisateur"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold">Mehdi B.</h4>
                  <p className="text-sm text-muted-foreground">Motard depuis 5 ans</p>
                </div>
              </div>
              <p className="italic">« J'ai trouvé ma Kawasaki Z900 sur Moutouri en seulement deux jours. Le contact avec le vendeur était super simple et le prix était juste. »</p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-card p-6 rounded-lg shadow border border-primary/10"
            >
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-primary/10 p-2 mr-4">
                  <Image
                    src="images/avatar2.png"
                    alt="Utilisateur"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold">Sonia T.</h4>
                  <p className="text-sm text-muted-foreground">Passionnée de scooters</p>
                </div>
              </div>
              <p className="italic">« J'ai pu vendre mon ancien scooter et acheter un modèle électrique en utilisant Moutouri. La communauté est vraiment accueillante ! »</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Call to action (enhanced) */}
        <section className="py-16 bg-primary/5 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Prêt à rejoindre la communauté Moutouri?
              </h2>
              <p className="text-lg mb-8 text-muted-foreground">
                Que vous cherchiez à acheter ou à vendre, Moutouri vous connecte avec des passionnés de deux-roues.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link href="/register">Créer un compte gratuitement</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute left-0 right-0 -bottom-10 h-20 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        {/* Ads */}
        <GoogleAdSense
          slot="2488891530"
          format="horizontal"
          className="adsense-container"
        />

        <GoogleAdSense
          slot="2488891530"
          className="adsense-container my-8"
        />
      </main>

      <footer className="bg-black text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image
                src="/logo-moutouri.png"
                alt="Moutouri"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="text-xl font-bold">Moutouri</span>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h3 className="font-bold mb-2 text-primary">Contactez-nous</h3>
                <p className="text-sm">
                  Moutouri est une plateforme de vente et d'achat de motos et de scooters en Tunisie.
                </p>
                <p className="text-sm mt-2">
                  <span className="block">adam.bhedj13@gmail.com</span>
                  <span className="block">+216 90053729</span>
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-primary">Nous suivre</h3>
                <div className="flex gap-3">
                  <Link href="#" className="hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </Link>
                  <Link href="#" className="hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Moutouri. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}