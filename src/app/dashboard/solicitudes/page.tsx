'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getRequests, deleteRequest, updateRequestStatus } from '@/lib/actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Plus, Search, FileText, Eye, Trash2, Filter, MoreHorizontal, Clock, CheckCircle, XCircle, Package, AlertCircle, SquarePen, ListFilter, TrendingUp, TrendingDown, Flame, BarChart3 
} from 'lucide-react';

// Nota: Para notificaciones de éxito/error, considera usar una librería como 'sonner'
// import { toast } from "sonner"

// --- TIPOS Y CONSTANTES ---

type RequestStatus = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Entregada';
type RequestPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';

type Request = {
  id: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: Date;
  updatedAt: Date;
  beneficiaryName: string | null;
  beneficiaryId: string | null;
};

const STATUS_OPTIONS: { value: RequestStatus; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; className: string; }[] = [
  { value: 'Pendiente', label: 'Pendiente', icon: Clock, className: 'border-yellow-400 text-yellow-800 bg-yellow-100/60' },
  { value: 'Aprobada', label: 'Aprobada', icon: CheckCircle, className: 'border-green-400 text-green-800 bg-green-100/60' },
  { value: 'Rechazada', label: 'Rechazada', icon: XCircle, className: 'border-red-400 text-red-800 bg-red-100/60' },
  { value: 'Entregada', label: 'Entregada', icon: Package, className: 'border-blue-400 text-blue-800 bg-blue-100/60' },
];

const PRIORITY_OPTIONS: { value: RequestPriority; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; className: string; }[] = [
  { value: 'Baja', label: 'Baja', icon: TrendingDown, className: 'bg-green-100 text-green-800' },
  { value: 'Media', label: 'Media', icon: TrendingUp, className: 'bg-yellow-100 text-yellow-800' },
  { value: 'Alta', label: 'Alta', icon: AlertCircle, className: 'bg-orange-100 text-orange-800' },
  { value: 'Urgente', label: 'Urgente', icon: Flame, className: 'bg-red-100 text-red-800' },
];

// --- COMPONENTES INTERNOS ---

// Tarjetas de Estadísticas
const StatsCards = ({ requests }: { requests: Request[] }) => {
  const stats = useMemo(() => {
    return STATUS_OPTIONS.map(option => ({
      ...option,
      count: requests.filter(r => r.status === option.value).length,
    }));
  }, [requests]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(stat => (
        <Card key={stat.value}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.count}</div>
            <p className="text-xs text-muted-foreground">Solicitudes en este estado</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Barra de Herramientas de la Tabla (Búsqueda y Filtros)
const Toolbar = ({ filters, setFilters, priorityOptions, statusOptions }: { 
  filters: any; 
  setFilters: (filters: any) => void;
  priorityOptions: typeof PRIORITY_OPTIONS,
  statusOptions: typeof STATUS_OPTIONS
}) => {
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };
  
  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length - 1; // -1 to exclude searchTerm

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por descripción o beneficiario..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="w-full pl-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <ListFilter className="mr-2 h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full">{activeFiltersCount}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Estado</h4>
                <DropdownMenuRadioGroup value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                  <DropdownMenuRadioItem value="">Todos</DropdownMenuRadioItem>
                  {statusOptions.map(opt => <DropdownMenuRadioItem key={opt.value} value={opt.value}>{opt.label}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Prioridad</h4>
                <DropdownMenuRadioGroup value={filters.priority} onValueChange={(v) => handleFilterChange('priority', v)}>
                  <DropdownMenuRadioItem value="">Todas</DropdownMenuRadioItem>
                  {priorityOptions.map(opt => <DropdownMenuRadioItem key={opt.value} value={opt.value}>{opt.label}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={() => setFilters((prev: any) => ({ ...prev, status: '', priority: '' }))}>
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
};

// Fila de la Tabla de Solicitudes
const RequestTableRow = ({ request, onStatusChange, onDelete }: {
  request: Request;
  onStatusChange: (id: string, newStatus: RequestStatus) => void;
  onDelete: (id: string, description: string) => void;
}) => {
  const StatusBadge = ({ status }: { status: RequestStatus }) => {
    const option = STATUS_OPTIONS.find(o => o.value === status) || { icon: AlertCircle, className: '', label: 'Desconocido' };
    return (
      <Badge variant="outline" className={`${option.className} font-mono text-xs`}>
        <option.icon className="h-3 w-3 mr-1.5" />
        {option.label}
      </Badge>
    );
  };

  const PriorityBadge = ({ priority }: { priority: RequestPriority }) => {
    const option = PRIORITY_OPTIONS.find(o => o.value === priority) || { icon: AlertCircle, className: '', label: 'Desconocido' };
    return (
      <Badge variant="secondary" className={option.className}>
        <option.icon className="h-3 w-3 mr-1.5" />
        {option.label}
      </Badge>
    );
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <p className="truncate max-w-xs">{request.description}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-md">{request.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="text-muted-foreground">{request.beneficiaryName || 'N/A'}</TableCell>
      <TableCell><PriorityBadge priority={request.priority} /></TableCell>
      <TableCell><StatusBadge status={request.status} /></TableCell>
      <TableCell className="text-muted-foreground">
        {format(new Date(request.createdAt), 'dd MMM, yyyy', { locale: es })}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/dashboard/solicitudes/${request.id}`}><Eye className="mr-2 h-4 w-4" /> Ver Detalles</Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger><SquarePen className="mr-2 h-4 w-4" /> Cambiar Estado</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {STATUS_OPTIONS.map(status => (
                  <DropdownMenuItem key={status.value} onClick={() => onStatusChange(request.id, status.value)} className="cursor-pointer">
                    <status.icon className="mr-2 h-4 w-4" /> {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(request.id, request.description)} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

// Tabla de Solicitudes
const RequestTable = ({ requests, onStatusChange, onDelete }: {
  requests: Request[];
  onStatusChange: (id: string, newStatus: RequestStatus) => void;
  onDelete: (id: string, description: string) => void;
}) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descripción</TableHead>
          <TableHead>Beneficiario</TableHead>
          <TableHead>Prioridad</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha Creación</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.length > 0 ? (
          requests.map((request) => (
            <RequestTableRow key={request.id} request={request} onStatusChange={onStatusChange} onDelete={onDelete} />
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-60 text-center text-muted-foreground">
              <div className="flex flex-col items-center justify-center gap-2">
                <FileText className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-semibold">No se encontraron solicitudes</h3>
                <p className="max-w-xs">Intenta ajustar los filtros de búsqueda o crea una nueva solicitud para empezar.</p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

// Diálogo de Confirmación para Eliminar
const DeleteConfirmationDialog = ({ open, onOpenChange, onConfirm, requestDescription }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  requestDescription: string;
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción no se puede deshacer. Esto eliminará permanentemente la solicitud de <span className="font-semibold">"{requestDescription.substring(0, 50)}..."</span>.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">Sí, eliminar</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);


// --- COMPONENTE PRINCIPAL ---

export default function SolicitudesPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ searchTerm: '', status: '', priority: '' });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, requestId: '', requestDescription: '' });

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
      // toast.error("Hubo un error al cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const searchMatch = filters.searchTerm === '' || 
                          r.description.toLowerCase().includes(searchTermLower) ||
                          (r.beneficiaryName && r.beneficiaryName.toLowerCase().includes(searchTermLower));
      const statusMatch = filters.status === '' || r.status === filters.status;
      const priorityMatch = filters.priority === '' || r.priority === filters.priority;
      
      return searchMatch && statusMatch && priorityMatch;
    });
  }, [requests, filters]);

  const handleDelete = async () => {
    try {
      await deleteRequest(deleteDialog.requestId);
      // toast.success("Solicitud eliminada con éxito.");
      loadRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      // toast.error("Error al eliminar la solicitud.");
    } finally {
      setDeleteDialog({ isOpen: false, requestId: '', requestDescription: '' });
    }
  };

  const handleStatusChange = async (id: string, newStatus: RequestStatus) => {
    try {
      await updateRequestStatus(id, newStatus);
      // toast.success(`Estado actualizado a "${newStatus}".`);
      loadRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      // toast.error("Error al actualizar el estado.");
    }
  };
  
  const openDeleteDialog = (id: string, description: string) => {
    setDeleteDialog({ isOpen: true, requestId: id, requestDescription: description });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Cargando solicitudes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestión de Solicitudes</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza, filtra y administra todas las solicitudes de ayuda.
          </p>
        </div>
        <Link href="/dashboard/solicitudes/nueva">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCards requests={requests} />

      {/* Table & Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <Toolbar 
            filters={filters} 
            setFilters={setFilters} 
            priorityOptions={PRIORITY_OPTIONS} 
            statusOptions={STATUS_OPTIONS}
          />
          <RequestTable 
            requests={filteredRequests}
            onStatusChange={handleStatusChange}
            onDelete={openDeleteDialog}
          />
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.isOpen}
        onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}
        onConfirm={handleDelete}
        requestDescription={deleteDialog.requestDescription}
      />
    </div>
  );
}