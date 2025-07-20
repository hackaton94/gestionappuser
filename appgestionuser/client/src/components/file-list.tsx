import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FileText, Download, Eye, Search, FileIcon, File } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { authManager } from '@/lib/auth';
import { useState } from 'react';
import { type File as FileType } from '@shared/schema';

// Composant pour afficher et gérer la liste des fichiers
interface FileListProps {
  isReadOnly?: boolean; // Si true, affichage en lecture seule pour les utilisateurs simples
}

export function FileList({ isReadOnly = false }: FileListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Récupération des fichiers via React Query
  const { data: filesData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/files', { page: currentPage, limit: itemsPerPage, search: searchTerm }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await authManager.authenticatedFetch(`/api/files?${params}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des fichiers');
      }
      return response.json();
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  // Gestionnaire de téléchargement de fichier
  const handleDownload = (file: FileType) => {
    // Simulation du téléchargement
    const link = document.createElement('a');
    link.href = file.cheminFichier;
    link.download = file.nom;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Gestionnaire de visualisation de fichier
  const handleView = (file: FileType) => {
    // Simulation de l'ouverture du fichier
    window.open(file.cheminFichier, '_blank');
  };

  // Affichage du skeleton pendant le chargement
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isReadOnly ? 'Mes Fichiers' : 'Gestion des Fichiers'}
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
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="mt-4 mx-auto block"
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const files = filesData?.data || [];
  const pagination = filesData?.pagination;

  return (
    <Card className="w-full data-table">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isReadOnly ? 'Mes Fichiers' : 'Gestion des Fichiers'}
          </CardTitle>
          
          {/* Barre de recherche */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un fichier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Aucun fichier trouvé pour cette recherche' : 'Aucun fichier disponible'}
            </p>
          </div>
        ) : (
          <>
            {/* Table des fichiers pour desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Fichier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Taille</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Modifié</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file: FileType) => (
                    <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {file.type.split('/')[1]?.toUpperCase() || 'FICHIER'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatFileSize(file.taille)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(file.dateModification)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(file)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(file)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Télécharger
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cartes pour mobile */}
            <div className="md:hidden space-y-4">
              {files.map((file: FileType) => (
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
                        <span>{formatDate(file.dateModification)}</span>
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
                          onClick={() => handleDownload(file)}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Télécharger
                        </Button>
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
