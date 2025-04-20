"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Plus,
    Pencil,
    Trash2,
    ChevronRight,
    Loader2,
    Calendar,
    Link as LinkIcon,
    Upload,
    Eye,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import DashboardLayout from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog-compat"; // Use compatibility version

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AD_POSITIONS } from '@/config/ad-positions';
import { createAd, updateAd, getAllAds, deleteAd } from '@/services/ads';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ProtectedRoute from '@/components/protected-route';
import { uploadToCloudinary } from '@/services/cloudinary-upload';
import { IMAGE_BASE_URL } from '@/config/config';

// Form validation schema
const adFormSchema = z.object({
    title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
    description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
    position: z.string().min(1, "Veuillez sélectionner une position"),
    link: z.string().url("Veuillez entrer une URL valide").or(z.string().length(0)),
    isActive: z.boolean().default(true),
});

export default function AdsAdminPage() {
    const router = useRouter();
    const { getAuthToken, isAdmin } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [ads, setAds] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentAd, setCurrentAd] = useState<any>(null);
    const [adImage, setAdImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [adIdToDelete, setAdIdToDelete] = useState<string | null>(null);
    
    // Initialize react-hook-form
    const form = useForm({
        resolver: zodResolver(adFormSchema),
        defaultValues: {
            title: '',
            description: '',
            position: '',
            link: '',
            isActive: true
        }
    });

    // Load ads on component mount
    useEffect(() => {
        fetchAds();
    }, []);

    // Update form values when currentAd changes
    useEffect(() => {
        if (currentAd) {
            form.reset({
                title: currentAd.title || '',
                description: currentAd.description || '',
                position: currentAd.position || '',
                link: currentAd.link || '',
                isActive: currentAd.isActive !== undefined ? currentAd.isActive : true
            });
            setImagePreview(currentAd.image);
        } else {
            form.reset({
                title: '',
                description: '',
                position: '',
                link: '',
                isActive: true
            });
            setAdImage(null);
            setImagePreview(null);
        }
    }, [currentAd, form]);

    // Fetch all ads
    const fetchAds = async () => {
        try {
            setIsLoading(true);
            const token = getAuthToken();
            
            if (!token) {
                toast({
                    title: "Non autorisé",
                    description: "Veuillez vous connecter pour accéder à cette page",
                    variant: "destructive"
                });
                router.push('/login');
                return;
            }
            
            const response = await getAllAds(token);
            
            if (response.success) {
                console.log("Ads loaded successfully:", response.ads);
                setAds(response.ads || []);
            } else {
                throw new Error(response.message || "Failed to load ads");
            }
        } catch (error) {
            console.error("Error fetching ads:", error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les publicités",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setAdImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Open dialog to create a new ad
    const handleNewAd = () => {
        setCurrentAd(null);
        setDialogOpen(true);
    };

    // Open dialog to edit an existing ad
    const handleEditAd = (ad: any) => {
        setCurrentAd(ad);
        setDialogOpen(true);
    };

    // Handle form submission (create or update)
    const onSubmit = async (data: z.infer<typeof adFormSchema>) => {
        const token = getAuthToken();
        
        if (!token) {
            toast({
                title: "Non autorisé",
                description: "Veuillez vous connecter pour accéder à cette page",
                variant: "destructive"
            });
            return;
        }
        
        let imageUrl = currentAd?.image || null;
        
        // Upload image if selected
        if (adImage) {
            try {
                // Don't use the OR operator here as it causes type issues
                if (currentAd) {
                    setIsUpdating(true);
                } else {
                    setIsCreating(true);
                }
                
                imageUrl = await uploadToCloudinary(adImage);
                console.log("Image uploaded successfully:", imageUrl);
            } catch (uploadError) {
                console.error("Error uploading image:", uploadError);
                toast({
                    title: "Erreur",
                    description: "Échec du téléchargement de l'image",
                    variant: "destructive"
                });
                setIsCreating(false);
                setIsUpdating(false);
                return;
            }
        } else if (!currentAd?.image && !adImage) {
            toast({
                title: "Image requise",
                description: "Veuillez télécharger une image pour la publicité",
                variant: "destructive"
            });
            return;
        }
        
        // Prepare ad data
        const adData = {
            ...data,
            image: imageUrl,
        };
        
        try {
            // Update existing ad
            if (currentAd) {
                setIsUpdating(true);
                
                // Create FormData for the request
                const formData = new FormData();
                Object.entries(adData).forEach(([key, value]) => {
                    formData.append(key, value as string);
                });
                
                const response = await updateAd(currentAd._id, formData, token);
                
                if (response.success) {
                    toast({
                        title: "Succès",
                        description: "Publicité mise à jour avec succès",
                    });
                    
                    setDialogOpen(false);
                    fetchAds();
                } else {
                    toast({
                        title: "Erreur",
                        description: response.message || "Échec de la mise à jour de la publicité",
                        variant: "destructive"
                    });
                }
            } 
            // Create new ad
            else {
                setIsCreating(true);
                
                // Create FormData for the request
                const formData = new FormData();
                Object.entries(adData).forEach(([key, value]) => {
                    formData.append(key, value as string);
                });
                
                const response = await createAd(formData, token);
                
                if (response.success) {
                    toast({
                        title: "Succès",
                        description: "Publicité créée avec succès",
                    });
                    
                    setDialogOpen(false);
                    fetchAds();
                } else {
                    toast({
                        title: "Erreur",
                        description: response.message || "Échec de la création de la publicité",
                        variant: "destructive"
                    });
                }
            }
        } catch (error) {
            console.error("Error saving ad:", error);
            toast({
                title: "Erreur",
                description: "Une erreur s'est produite lors de l'enregistrement de la publicité",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
            setIsUpdating(false);
        }
    };
    
    // Handle ad deletion
    const handleDeleteAd = async (adId: string) => {
        try {
            setIsDeleting(true);
            const token = getAuthToken();
            
            if (!token) {
                toast({
                    title: "Non autorisé",
                    description: "Veuillez vous connecter pour accéder à cette page",
                    variant: "destructive"
                });
                return;
            }
            
            const response = await deleteAd(adId, token);
            
            if (response.success) {
                toast({
                    title: "Succès",
                    description: "Publicité supprimée avec succès",
                });
                
                // Update the ads list
                fetchAds();
            } else {
                toast({
                    title: "Erreur",
                    description: response.message || "Échec de la suppression de la publicité",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Error deleting ad:", error);
            toast({
                title: "Erreur",
                description: "Une erreur s'est produite lors de la suppression de la publicité",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
            setAdIdToDelete(null);
        }
    };
    
    // Helper function to format the date
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
        } catch (error) {
            return "Date inconnue";
        }
    };
    
    // Helper function to get position label
    const getPositionLabel = (position: string) => {
        const positionMap: Record<string, string> = {
            'home-hero': 'Bannière héro accueil',
            'home-middle': 'Milieu accueil',
            'home-bottom': 'Bas accueil',
            'sidebar': 'Barre latérale',
            'product-page': 'Page produit',
            'product-in-list': 'Dans liste produits'
        };
        
        return positionMap[position] || position;
    };

    return (
        <ProtectedRoute adminOnly>
            <DashboardLayout>
                <div className="container py-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Gestion des publicités</h1>
                        <Button onClick={handleNewAd}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle publicité
                        </Button>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Chargement des publicités...</span>
                        </div>
                    ) : ads.length === 0 ? (
                        <div className="text-center p-12 bg-muted rounded-lg">
                            <h2 className="text-xl font-semibold mb-2">Aucune publicité trouvée</h2>
                            <p className="text-muted-foreground mb-6">
                                Commencez par ajouter votre première publicité pour promouvoir vos produits ou services.
                            </p>
                            <Button onClick={handleNewAd}>
                                <Plus className="h-4 w-4 mr-2" />
                                Créer une publicité
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {ads.map((ad) => (
                                <Card key={ad._id} className="overflow-hidden">
                                    <div className="aspect-video relative bg-muted">
                                        {ad.image ? (
                                            <Image
                                                src={ad.image}
                                                alt={ad.title}
                                                fill
                                                className="object-cover"
                                                onError={(e) => {
                                                    // Fallback for broken images
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-image.jpg';
                                                }}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                                <span className="text-muted-foreground">No Image</span>
                                            </div>
                                        )}
                                        <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${
                                            ad.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {ad.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-lg">{ad.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {ad.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Position:</span>
                                            <span className="font-medium">{getPositionLabel(ad.position)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Créée:</span>
                                            <span>{formatDate(ad.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Vues:</span>
                                            <div className="flex items-center">
                                                <Eye className="w-3 h-3 mr-1" />
                                                {ad.impressions || 0}
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Clics:</span>
                                            <div className="flex items-center">
                                                <Activity className="w-3 h-3 mr-1" />
                                                {ad.clicks || 0}
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <Button variant="outline" size="sm" onClick={() => handleEditAd(ad)}>
                                                <Pencil className="h-4 w-4 mr-1" />
                                                Modifier
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => setAdIdToDelete(ad._id)}
                                                disabled={isDeleting && adIdToDelete === ad._id}
                                            >
                                                {isDeleting && adIdToDelete === ad._id ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                        Suppression...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Supprimer
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                    
                    {/* Confirmation dialog for deletion */}
                    <Dialog 
                        open={!!adIdToDelete} 
                        onOpenChange={(open) => !open && setAdIdToDelete(null)}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmer la suppression</DialogTitle>
                                <DialogDescription>
                                    Êtes-vous sûr de vouloir supprimer cette publicité ? Cette action ne peut pas être annulée.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setAdIdToDelete(null)}
                                    disabled={isDeleting}
                                >
                                    Annuler
                                </Button>
                                <Button 
                                    variant="destructive"
                                    onClick={() => adIdToDelete && handleDeleteAd(adIdToDelete)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Suppression...
                                        </>
                                    ) : (
                                        'Supprimer'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog for creating/editing ads */}
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {currentAd ? 'Modifier la publicité' : 'Créer une nouvelle publicité'}
                                </DialogTitle>
                                <DialogDescription>
                                    {currentAd 
                                        ? 'Modifiez les détails de la publicité' 
                                        : 'Remplissez les informations pour créer une nouvelle publicité'}
                                </DialogDescription>
                            </DialogHeader>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Titre <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Titre de la publicité" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        placeholder="Description de la publicité" 
                                                        rows={3}
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="position"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Position <span className="text-red-500">*</span></FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner la position de la publicité" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={AD_POSITIONS.HOME_HERO}>Bannière d'accueil principale</SelectItem>
                                                        <SelectItem value={AD_POSITIONS.HOME_MIDDLE}>Bannière milieu d'accueil</SelectItem>
                                                        <SelectItem value={AD_POSITIONS.HOME_BOTTOM}>Bannière bas d'accueil</SelectItem>
                                                        <SelectItem value={AD_POSITIONS.SIDEBAR}>Bannière latérale</SelectItem>
                                                        <SelectItem value={AD_POSITIONS.PRODUCT_RELATED}>Page produit</SelectItem>
                                                        <SelectItem value={AD_POSITIONS.PRODUCT_IN_LIST}>Dans liste des produits</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lien (URL)</FormLabel>
                                                <FormControl>
                                                    <div className="flex">
                                                        <span className="bg-muted px-3 flex items-center border rounded-l-md">
                                                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                                        </span>
                                                        <Input 
                                                            placeholder="https://example.com" 
                                                            {...field} 
                                                            className="rounded-l-none"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    URL vers laquelle l'utilisateur sera redirigé en cliquant sur la publicité
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Image upload */}
                                    <div className="space-y-2">
                                        <FormLabel>Image <span className="text-red-500">{!currentAd?.image && '*'}</span></FormLabel>
                                        <div className="mt-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            
                                            {imagePreview ? (
                                                <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                                                    <img 
                                                        src={imagePreview} 
                                                        alt="Preview" 
                                                        className="object-cover w-full h-full"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
                                                        onClick={() => {
                                                            setAdImage(null);
                                                            setImagePreview(null);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex flex-col items-center justify-center w-full aspect-video rounded-md border-2 border-dashed cursor-pointer hover:bg-muted/30 transition-colors"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Cliquez pour télécharger une image
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        PNG, JPG ou WebP recommandé
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Actif</FormLabel>
                                                    <FormDescription>
                                                        Activer ou désactiver l'affichage de cette publicité
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <DialogFooter className="pt-4 sticky bottom-0 bg-background pb-2">
                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button type="submit" disabled={isCreating || isUpdating}>
                                            {isCreating || isUpdating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {currentAd ? 'Mise à jour...' : 'Création...'}
                                                </>
                                            ) : (
                                                <>{currentAd ? 'Mettre à jour' : 'Créer'}</>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}