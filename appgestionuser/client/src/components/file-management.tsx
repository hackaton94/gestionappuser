import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { 
  FileText, 
  FilePlus, 
  Edit, 
  Trash2, 
  Search, 
  Download,
  Eye,
  FileIcon
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { authManager } from '@/lib/auth';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertFileSchema, type File } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Schéma pour le formulaire de fichier (sans chemin et créateur)
const fileFormSchema = insertFileSchema.omit({ cheminFichier: true, creeParId: true });
type FileFormData = z.infer<typeof fileFormSchema>;

// Composant pour la gestion complète des fichiers (Admin seulement)
export function FileManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Formulaire pour ajouter/modifier un fichier
  const form = useForm<FileFormData>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      nom: '',
      description: '',
      type: '',
      taille: 0,
    },
  });

  // Récupération des fichiers via React Query
  const { data: filesData, isLoading, error } = useQuery({
    queryKey: ['/api/files', { 
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchTerm,
      type: typeFilter === 'all' ? undefined : typeFilter
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await authManager.authenticatedFetch(`/api/files?${params}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des fichiers');
      }
      return response.json();
    },
  });

  // Mutation pour créer un fichier
  const createFileMutation = useMutation({
    mutationFn: async (fileData: FileFormData) => {
      const completeFileData = {
        ...fileData,
        cheminFichier: `/uploads/${fileData.nom.replace(/\s+/g, '_').toLowerCase()}`,
      };
      
      const response = await authManager.authenticatedFetch('/api/files', {
        method: 'POST',
        body: JSON.stringify(completeFileData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/dashboard'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Succès",
        description: "Fichier ajouté avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour modifier un fichier
  const updateFileMutation = useMutation({
    mutationFn: async ({ id, fileData }: { id: number; fileData: Partial<FileFormData> }) => {
      const response = await authManager.authenticatedFetch(`/api/files/${id}`, {
        method: 'PUT',
        body: JSON.stringify(fileData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la modification');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      setEditingFile(null);
      form.reset();
      toast({
        title: "Succès",
        description: "Fichier modifié avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer un fichier
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await authManager.authenticatedFetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/dashboard'] });
      toast({
        title: "Succès",
        description: "Fichier supprimé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fonction pour obtenir l'icône selon le type de fichier
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
    if (type.includes('image')) return '🖼️';
    return '📄';
  };

  // Fonction pour formater la taille des fichiers
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Gestionnaire de soumission du formulaire
  const onSubmit = (data: FileFormData) => {
    if (editingFile) {
      // Modifier un fichier existant
      updateFileMutation.mutate({ id: editingFile.id, fileData: data });
    } else {
      // Créer un nouveau fichier
      createFileMutation.mutate(data);
    }
  };

  // Ouvrir le dialog de modification
  const handleEdit = (file: File) => {
    setEditingFile(file);
    form.reset({
      nom: file.nom,
      description: file.description || '',
      type: file.type,
      taille: file.taille,
    });
  };

  // Fermer les dialogs et réinitialiser
  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingFile(null);
    form.reset();
  };

  // Gestionnaires de visualisation et téléchargement
  const handleView = (file: File) => {
    window.open(file.cheminFichier, '_blank');
  };

  const handleDownload = (file: File) => {
    const link = document.createElement('a');
    link.href = file.cheminFichier;
    link.download = file.nom;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Affichage du skeleton pendant le chargement
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gestion des Fichiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-red-600 text-center">
            Erreur lors du chargement des fichiers
          </p>
        </CardContent>
      </Card>
    );
  }

  const files = filesData?.data || [];
  const pagination = filesData?.pagination;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gestion des Fichiers
          </CardTitle>
          
          {/* Bouton d'ajout */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <FilePlus className="w-4 h-4 mr-2" />
                Ajouter fichier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter un fichier</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau fichier au système.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du fichier</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="rapport_annuel.pdf" />
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
                          <Textarea {...field} placeholder="Description du fichier..." rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type MIME</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="application/pdf">PDF</SelectItem>
                            <SelectItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                              Word (DOCX)
                            </SelectItem>
                            <SelectItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                              Excel (XLSX)
                            </SelectItem>
                            <SelectItem value="application/vnd.openxmlformats-officedocument.presentationml.presentation">
                              PowerPoint (PPTX)
                            </SelectItem>
                            <SelectItem value="image/jpeg">Image JPEG</SelectItem>
                            <SelectItem value="image/png">Image PNG</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="taille"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taille (en octets)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            placeholder="1024000"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createFileMutation.isPending}
                      className="btn-primary"
                    >
                      {createFileMutation.isPending ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="word">Word</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="powerpoint">PowerPoint</SelectItem>
              <SelectItem value="image">Images</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Aucun fichier trouvé pour cette recherche' : 'Aucun fichier dans le système'}
            </p>
          </div>
        ) : (
          <>
            {/* Table pour desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Fichier</th>
                    <th>Type</th>
                    <th>Taille</th>
                    <th>Créé par</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file: File) => (
                    <tr key={file.id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getFileIcon(file.type)}</span>
                          <div>
                            <p className="font-medium text-gray-900">{file.nom}</p>
                            {file.description && (
                              <p className="text-sm text-gray-500">{file.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="secondary">
                          {file.type.split('/')[1]?.toUpperCase() || 'FICHIER'}
                        </Badge>
                      </td>
                      <td className="text-gray-600">
                        {formatFileSize(file.taille)}
                      </td>
                      <td className="text-gray-600">
                        A. Blami
                      </td>
                      <td className="text-gray-600">
                        {formatDate(file.dateCreation)}
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(file)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(file)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4" />
                          </Button>

                          {/* Dialog de modification */}
                          <Dialog open={editingFile?.id === file.id} onOpenChange={(open) => {
                            if (!open) setEditingFile(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(file)}
                                className="text-yellow-600 hover:text-yellow-800"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Modifier le fichier</DialogTitle>
                                <DialogDescription>
                                  Modifiez les informations de {file.nom}.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                  <FormField
                                    control={form.control}
                                    name="nom"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Nom du fichier</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
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
                                          <Textarea {...field} rows={3} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <DialogFooter className="gap-2">
                                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                      Annuler
                                    </Button>
                                    <Button 
                                      type="submit" 
                                      disabled={updateFileMutation.isPending}
                                      className="btn-primary"
                                    >
                                      {updateFileMutation.isPending ? 'Modification...' : 'Modifier'}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>

                          {/* Dialog de suppression */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer le fichier</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer {file.nom} ?
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteFileMutation.mutate(file.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cartes pour mobile */}
            <div className="md:hidden space-y-4">
              {files.map((file: File) => (
                <Card key={file.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{file.nom}</p>
                      {file.description && (
                        <p className="text-sm text-gray-500 mt-1">{file.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>{formatFileSize(file.taille)}</span>
                        <span>{formatDate(file.dateCreation)}</span>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(file)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(file)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="flex-1 text-red-600">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le fichier</AlertDialogTitle>
                              <AlertDialogDescription>
                                Supprimer {file.nom} ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteFileMutation.mutate(file.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Affichage {(pagination.page - 1) * pagination.limit + 1} à{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                  {pagination.total} fichiers
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
