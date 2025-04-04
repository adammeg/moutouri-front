"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, AlertCircle, ImagePlus, X, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { getProductById, updateProduct } from "@/services/products"
import { getCategories } from "@/services/categories"
import ProtectedRoute from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"

// Form schema validation with zod
const formSchema = z.object({
    title: z.string().min(5, { message: "Le titre doit comporter au moins 5 caractères" }),
    description: z.string().min(20, { message: "La description doit comporter au moins 20 caractères" }),
    price: z.coerce.number().min(1, { message: "Le prix doit être supérieur à 0" }),
    category: z.string().min(1, { message: "Veuillez sélectionner une catégorie" }),
    condition: z.string().min(1, { message: "Veuillez sélectionner l'état du produit" }),
    location: z.string().min(1, { message: "Veuillez entrer l'emplacement" }),
    year: z.coerce.number().optional(),
    mileage: z.coerce.number().optional(),
    engineSize: z.coerce.number().optional(),
    color: z.string().optional(),
});

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState<string[]>([]);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    
    // Get the product ID from the params hook
    const productId = params?.id as string;

    // Initialize form with react-hook-form and zod validation
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            category: "",
            condition: "",
            location: "",
            year: undefined,
            mileage: undefined,
            engineSize: undefined,
            color: "",
        },
    });

    // Fetch product data and categories on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch product by ID
                const productResponse = await getProductById(productId);
                if (!productResponse.success) {
                    setError(productResponse.message || "Failed to load product");
                    return;
                }

                const product = productResponse.product;
                console.log("Loaded product:", product);

                // Fetch categories
                const categoriesResponse = await getCategories();
                if (categoriesResponse.success) {
                    setCategories(categoriesResponse.categories);
                }

                // Set form values from product data
                form.reset({
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    category: product.category?._id || product.category,
                    condition: product.condition,
                    location: product.location,
                    year: product.year,
                    mileage: product.mileage || product.kilometrage,
                    engineSize: product.engineSize,
                    color: product.color,
                });

                // Set existing images
                if (product.images && product.images.length > 0) {
                    setImages(product.images);
                }
            } catch (error) {
                console.error("Error loading product data:", error);
                setError("Une erreur est survenue lors du chargement du produit");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [productId, form]);

    // Handle form submission
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true);
            setError(null);

            console.log("Form data:", data);
            console.log("Images to update:", images);
            console.log("New images to upload:", uploadedImages);

            // Call API to update product
            const response = await updateProduct(productId, {
                ...data,
                images: images, // Existing images
                newImages: uploadedImages, // New images to upload
            });

            if (response.success) {
                toast({
                    title: "Produit mis à jour",
                    description: "Votre produit a été mis à jour avec succès",
                    variant: "default",
                });

                // Redirect to product page
                router.push(`/products/${productId}`);
            } else {
                setError(response.message || "Une erreur est survenue lors de la mise à jour du produit");
                toast({
                    title: "Erreur",
                    description: response.message || "Échec de la mise à jour du produit",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error updating product:", error);
            setError("Une erreur est survenue lors de la mise à jour du produit");
            toast({
                title: "Erreur",
                description: "Échec de la mise à jour du produit",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to remove image from the list
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Function to handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check if adding this image would exceed the limit
        if (images.length + uploadedImages.length + files.length > 5) {
            toast({
                title: "Limite d'images atteinte",
                description: "Vous ne pouvez pas ajouter plus de 5 images au total",
                variant: "destructive",
            });
            return;
        }

        // Add the files to uploaded images state
        setUploadedImages(prev => [...prev, ...Array.from(files)]);
        
        // Create object URLs for preview
        const newImageUrls = Array.from(files).map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...newImageUrls]);
        
        // Reset the file input
        e.target.value = '';
    };

    // Render the form
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="container px-4 py-8 mx-auto max-w-4xl">
                <h1 className="text-2xl font-bold mb-6">Modifier votre annonce</h1>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold">Informations principales</h2>

                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Titre de l'annonce*</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: BMW Série 3 320d" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Un titre clair qui décrit bien votre produit
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description*</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Décrivez votre produit en détail..."
                                                        className="min-h-32"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Soyez précis dans votre description pour attirer plus d'acheteurs
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Prix (DT)*</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Catégorie*</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Sélectionnez une catégorie" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {categories.map((category: any) => (
                                                                <SelectItem key={category._id} value={category._id}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="condition"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>État*</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Sélectionnez l'état" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="new">Neuf</SelectItem>
                                                            <SelectItem value="like-new">Comme neuf</SelectItem>
                                                            <SelectItem value="excellent">Excellent</SelectItem>
                                                            <SelectItem value="good">Bon</SelectItem>
                                                            <SelectItem value="fair">Correct</SelectItem>
                                                            <SelectItem value="salvage">Pour pièces</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Localisation*</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Tunis, Sfax..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold">Caractéristiques du véhicule</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="year"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Année</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number" 
                                                            min="1900" 
                                                            max={new Date().getFullYear()} 
                                                            placeholder="Ex: 2018"
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <FormField
                                            control={form.control}
                                            name="mileage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kilométrage</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number" 
                                                            min="0" 
                                                            placeholder="Ex: 75000"
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="engineSize"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cylindrée (cm³)</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number" 
                                                            min="0" 
                                                            placeholder="Ex: 2000"
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <FormField
                                            control={form.control}
                                            name="color"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Couleur</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Noir, Rouge..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Images Section */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold">Photos du produit</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Ajoutez jusqu'à 5 photos de votre produit. La première photo sera utilisée comme image principale.
                                    </p>

                                    {/* Current Images */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative aspect-square border rounded-md overflow-hidden group">
                                                <img
                                                    src={image}
                                                    alt={`Image ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 transition-colors"
                                                >
                                                    <X className="h-4 w-4 text-red-500" />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1">
                                                        Image principale
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Add Image Button */}
                                        {images.length < 5 && (
                                            <label className="cursor-pointer flex items-center justify-center aspect-square border-2 border-dashed rounded-md hover:border-primary hover:bg-primary/5 transition-colors">
                                                <div className="flex flex-col items-center space-y-2 p-4">
                                                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground text-center">
                                                        Ajouter une photo
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                    />
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Actions */}
                        <div className="flex justify-between items-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </Button>

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mise à jour...
                                    </>
                                ) : (
                                    "Mettre à jour l'annonce"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </ProtectedRoute>
    );
}