'use client';

import { useState, useEffect } from 'react';
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
    Link as LinkIcon
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import {
    getAllAds,
    createAd,
    updateAd,
    deleteAd
} from '@/services/ads';

// Define types for our ad and form data
interface Ad {
    _id: string;
    title: string;
    description: string;
    image: string;
    link?: string;
    position: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    createdBy: {
        firstName: string;
        lastName: string;
        _id: string;
    };
}

interface FormData {
    title: string;
    description: string;
    image: File | null;
    link: string;
    position: string;
    isActive: boolean;
    startDate: string;
    endDate: string;
}

export default function AdminAdsPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentAd, setCurrentAd] = useState<Ad | null>(null);
    const [previewImage, setPreviewImage] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<FormData>({
        defaultValues: {
            title: '',
            description: '',
            image: null,
            link: '',
            position: 'home-hero',
            isActive: true,
            startDate: new Date().toISOString().split('T')[0],
            endDate: ''
        }
    });

    // Load ads when component mounts
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            router.push('/dashboard');
            return;
        } else {
            setAccessToken(localStorage.getItem('accessToken') || '');
        }
    }, [user, router]);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const response = await getAllAds(accessToken);

            if (response.success) {
                setAds(response.ads);
            } else {
                toast({
                    title: 'Erreur',
                    description: response.message || 'Impossible de charger les publicités',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error fetching ads:', error);
            toast({
                title: 'Erreur',
                description: 'Une erreur s\'est produite lors du chargement des publicités',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && e.target.result) {
                    setPreviewImage(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);

            // Set in form
            form.setValue('image', file);
        }
    };

    const openCreateDialog = () => {
        // Reset form
        form.reset({
            title: '',
            description: '',
            image: null,
            link: '',
            position: 'home-hero',
            isActive: true,
            startDate: new Date().toISOString().split('T')[0],
            endDate: ''
        });
        setPreviewImage('');
        setCurrentAd(null);
        setDialogOpen(true);
    };

    const openEditDialog = (ad: Ad) => {
        setCurrentAd(ad);
        form.reset({
            title: ad.title,
            description: ad.description,
            image: null,
            link: ad.link || '',
            position: ad.position,
            isActive: ad.isActive,
            startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
            endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : ''
        });
        setPreviewImage(ad.image);
        setDialogOpen(true);
    };

    const handleDeleteAd = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette publicité?')) {
            try {
                setIsDeleting(true);
                const response = await deleteAd(id, accessToken);

                if (response.success) {
                    toast({
                        title: 'Succès',
                        description: 'Publicité supprimée avec succès',
                    });
                    fetchAds();
                } else {
                    toast({
                        title: 'Erreur',
                        description: response.message || 'Impossible de supprimer la publicité',
                        variant: 'destructive'
                    });
                }
            } catch (error) {
                console.error('Error deleting ad:', error);
                toast({
                    title: 'Erreur',
                    description: 'Une erreur s\'est produite lors de la suppression',
                    variant: 'destructive'
                });
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const onSubmit = async (formData: FormData) => {
        try {
            // Create FormData for file upload
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('link', formData.link);
            data.append('position', formData.position);
            data.append('isActive', formData.isActive.toString());
            data.append('startDate', formData.startDate);

            if (formData.endDate) {
                data.append('endDate', formData.endDate);
            }

            // Add image only if it's set
            if (formData.image) {
                data.append('image', formData.image);
            }

            if (currentAd) {
                // Update existing ad
                setIsUpdating(true);
                const response = await updateAd(currentAd._id, data, accessToken);

                if (response.success) {
                    toast({
                        title: 'Succès',
                        description: 'Publicité mise à jour avec succès',
                    });
                    setDialogOpen(false);
                    fetchAds();
                } else {
                    toast({
                        title: 'Erreur',
                        description: response.message || 'Impossible de mettre à jour la publicité',
                        variant: 'destructive'
                    });
                }
                setIsUpdating(false);
            } else {
                // Create new ad
                setIsCreating(true);
                const response = await createAd(data, accessToken);

                if (response.success) {
                    toast({
                        title: 'Succès',
                        description: 'Publicité créée avec succès',
                    });
                    setDialogOpen(false);
                    fetchAds();
                } else {
                    toast({
                        title: 'Erreur',
                        description: response.message || 'Impossible de créer la publicité',
                        variant: 'destructive'
                    });
                }
                setIsCreating(false);
            }
        } catch (error) {
            console.error('Error submitting ad:', error);
            toast({
                title: 'Erreur',
                description: 'Une erreur s\'est produite lors de la soumission',
                variant: 'destructive'
            });
            setIsCreating(false);
            setIsUpdating(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestion des Publicités</h1>
                        <p className="text-muted-foreground">
                            Créez et gérez des publicités pour différentes sections du site.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle Publicité
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {ads.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="rounded-full bg-muted p-3 mb-4">
                                        <div className="h-10 w-10 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-1">Aucune publicité</h3>
                                    <p className="text-muted-foreground max-w-xs mb-4">
                                        Vous n'avez pas encore créé de publicités. Cliquez sur le bouton ci-dessous pour commencer.
                                    </p>
                                    <Button onClick={openCreateDialog}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Créer une Publicité
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            ads.map((ad) => (
                                <Card key={ad._id}>
                                    <div className="md:flex">
                                        <div className="relative h-48 md:h-auto md:w-64 overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                                            <Image
                                                src={ad.image}
                                                alt={ad.title}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs">
                                                {ad.position === 'home-hero' && 'Accueil - Après Hero'}
                                                {ad.position === 'home-middle' && 'Accueil - Milieu'}
                                                {ad.position === 'home-bottom' && 'Accueil - Bas'}
                                                {ad.position === 'sidebar' && 'Barre Latérale'}
                                                {ad.position === 'product-page' && 'Page Produit'}
                                            </div>
                                            {!ad.isActive && (
                                                <div className="absolute top-2 right-2 bg-destructive text-white text-xs px-2 py-1 rounded">
                                                    Inactif
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex-1">
                                            <div className="flex flex-col h-full">
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="text-lg font-bold">{ad.title}</h3>
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            {format(new Date(ad.createdAt), 'dd MMM yyyy', { locale: fr })}
                                                        </div>
                                                    </div>
                                                    <p className="text-muted-foreground mb-2">{ad.description}</p>

                                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                                        <span>Par {ad.createdBy.firstName} {ad.createdBy.lastName}</span>
                                                    </div>
                                                </div>

                                                {ad.link && (
                                                    <div className="mt-2 bg-muted/50 p-2 rounded text-sm flex items-center">
                                                        <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                                            {ad.link}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openEditDialog(ad)}>
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Modifier
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDeleteAd(ad._id)} disabled={isDeleting}>
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg">
                            <Plus className="h-6 w-6" />
                            <span className="sr-only">Ajouter une publicité</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{currentAd ? 'Modifier la publicité' : 'Ajouter une nouvelle publicité'}</DialogTitle>
                            <DialogDescription>
                                {currentAd
                                    ? 'Modifiez les détails de la publicité ci-dessous.'
                                    : 'Remplissez le formulaire pour créer une nouvelle publicité.'}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Titre</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Titre de la publicité" />
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
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Description de la publicité" rows={3} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field: { value, onChange, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Image</FormLabel>
                                            <FormControl>
                                                <div className="space-y-2">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        {...field}
                                                    />
                                                    {previewImage && (
                                                        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                                                            <Image
                                                                src={previewImage}
                                                                alt="Preview"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Format recommandé : 1200x400px, ratio 3:1
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="link"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lien (optionnel)</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="https://..." />
                                            </FormControl>
                                            <FormDescription>
                                                URL vers laquelle l'utilisateur sera redirigé en cliquant sur la publicité
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date de début</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date de fin (optionnel)</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Laissez vide pour une durée indéterminée
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionnez une position" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="home-hero">Accueil - Après Hero</SelectItem>
                                                    <SelectItem value="home-middle">Accueil - Milieu</SelectItem>
                                                    <SelectItem value="home-bottom">Accueil - Bas</SelectItem>
                                                    <SelectItem value="sidebar">Barre Latérale</SelectItem>
                                                    <SelectItem value="product-page">Page Produit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
    );
}