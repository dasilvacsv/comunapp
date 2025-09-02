'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Flag,
  Trash2,
  FileText,
  ClipboardList,
  AlertTriangle,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';
import { updateRequestStatus } from '@/lib/actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import React from 'react';

// --- Tipos de Datos ---
interface RequestData {
  id: string;
  description: string;
  status: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Entregada';
  priority: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  createdAt: Date;
  updatedAt: Date;
  beneficiaryId: string | null;
  beneficiaryName: string | null;
  beneficiaryDisabilityType: string | null;
  beneficiaryNotes: string | null;
}

interface SolicitudClientProps {
  request: RequestData;
  deleteAction: () => Promise<void>;
}

// --- Configuraciones y Mapeos ---

const statusConfig = {
  Pendiente: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
    color: 'text-yellow-500',
  },
  Aprobada: {
    label: 'Aprobada',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
    color: 'text-green-500',
  },
  Rechazada: {
    label: 'Rechazada',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
    color: 'text-red-500',
  },
  Entregada: {
    label: 'Entregada',
    icon: Package,
    className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
    color: 'text-blue-500',
  },
};

const priorityConfig = {
  Baja: { label: 'Baja', className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700' },
  Media: { label: 'Media', className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700' },
  Alta: { label: 'Alta', className: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700' },
  Urgente: { label: 'Urgente', className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700' },
};

// --- Componentes UI Auxiliares ---

function InfoCard({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-muted-foreground">{title}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// --- Componente de Panel de Acciones y Ciclo de Vida (Timeline Mejorado) ---

// Paso individual del Timeline
function TimelineStep({
  icon: Icon,
  title,
  isCompleted,
  isCurrent,
  isLast,
  children,
}: {
  icon: React.ElementType;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLast: boolean;
  children?: React.ReactNode;
}) {
  const statusColor = isCompleted || isCurrent ? 'bg-primary' : 'bg-border';
  const textColor = isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground';
  const iconColor = isCompleted || isCurrent ? 'text-primary-foreground' : 'text-muted-foreground';

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', statusColor)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        {!isLast && <div className={cn('w-px flex-1', isCompleted ? 'bg-primary' : 'bg-border')} />}
      </div>
      <div className="flex-1 pb-8">
        <p className={cn('font-semibold', textColor)}>{title}</p>
        {isCurrent && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

// Vista para el estado Rechazado
function RejectedStateView({ reopenAction }: { reopenAction: () => Promise<void> }) {
  return (
    <div className="text-center p-4 border-2 border-dashed border-red-300 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
      <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
      <h3 className="mt-2 text-lg font-semibold text-red-800 dark:text-red-300">Solicitud Rechazada</h3>
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">Esta solicitud fue denegada. Puedes reabrirla para reconsideración.</p>
      <form action={reopenAction} className="mt-4">
        <Button variant="outline" className="w-full">
          <Undo2 className="mr-2 h-4 w-4" /> Reabrir Solicitud
        </Button>
      </form>
    </div>
  );
}

// Componente principal del panel de acciones
function RequestActionsCard({ requestId, currentStatus }: { requestId: string; currentStatus: RequestData['status'] }) {
  const approveAction = updateRequestStatus.bind(null, requestId, 'Aprobada');
  const rejectAction = updateRequestStatus.bind(null, requestId, 'Rechazada');
  const deliverAction = updateRequestStatus.bind(null, requestId, 'Entregada');
  const reopenAction = updateRequestStatus.bind(null, requestId, 'Pendiente');

  const steps = [
    { status: 'Pendiente', icon: Clock },
    { status: 'Aprobada', icon: CheckCircle },
    { status: 'Entregada', icon: Package },
  ];
  const currentStepIndex = steps.findIndex(step => step.status === currentStatus);
  const isRejected = currentStatus === 'Rechazada';

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Gestión de la Solicitud</CardTitle>
        <CardDescription>Visualiza y actualiza el estado del ciclo de vida.</CardDescription>
      </CardHeader>
      <CardContent>
        {isRejected ? (
          <RejectedStateView reopenAction={reopenAction} />
        ) : (
          <div>
            {steps.map((step, index) => (
              <TimelineStep
                key={step.status}
                icon={step.icon}
                title={step.status}
                isCompleted={currentStepIndex > index}
                isCurrent={currentStepIndex === index}
                isLast={index === steps.length - 1}
              >
                {step.status === 'Pendiente' && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <form action={approveAction} className="flex-1"><Button className="w-full">Aprobar</Button></form>
                    <form action={rejectAction} className="flex-1"><Button variant="outline" className="w-full">Rechazar</Button></form>
                  </div>
                )}
                {step.status === 'Aprobada' && (
                   <form action={deliverAction}><Button className="w-full">Marcar como Entregada</Button></form>
                )}
                 {step.status === 'Entregada' && (
                   <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                     <Package className="h-4 w-4 text-blue-500" />
                     <span>Solicitud finalizada y entregada.</span>
                   </div>
                )}
              </TimelineStep>
            ))}
            
            {currentStatus === 'Aprobada' && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Acciones Adicionales</p>
                    <form action={reopenAction}>
                        <Button variant="secondary" size="sm" className="w-full">
                        <Undo2 className="mr-2 h-4 w-4" /> Revertir Aprobación
                        </Button>
                    </form>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Componente Principal de la Página ---

export function SolicitudDetailClient({ request, deleteAction }: SolicitudClientProps) {
  const currentStatusInfo = statusConfig[request.status];
  const currentPriorityInfo = priorityConfig[request.priority];
  const formattedCreationDate = format(new Date(request.createdAt), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      {/* Encabezado de la Página */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/solicitudes">
            <Button variant="outline" size="icon" aria-label="Volver a solicitudes">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Solicitud <span className="text-muted-foreground">#{request.id.substring(0, 8)}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Creada el {formattedCreationDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
            <Badge variant="outline" className={cn('capitalize text-sm py-1 px-3', currentStatusInfo.className)}>
                <currentStatusInfo.icon className="h-4 w-4 mr-1.5" />
                {currentStatusInfo.label}
            </Badge>
            <Badge variant="outline" className={cn('capitalize text-sm py-1 px-3', currentPriorityInfo.className)}>
                <Flag className="h-4 w-4 mr-1.5" />
                {currentPriorityInfo.label}
            </Badge>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Detalles de la Solicitud */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Detalles de la Solicitud</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {request.description}
              </p>
              <Separator className="my-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoCard icon={Calendar} title="Fecha de Creación" value={formattedCreationDate} />
                <InfoCard icon={Clock} title="Última Actualización" value={format(new Date(request.updatedAt), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })} />
              </div>
            </CardContent>
          </Card>

          {/* Información del Beneficiario */}
          {request.beneficiaryId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Información del Beneficiario</CardTitle>
                 <CardDescription>
                  Datos de la persona asociada a esta solicitud.
                 </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Nombre Completo</p>
                        <p className="font-semibold text-xl text-foreground">{request.beneficiaryName || 'No especificado'}</p>
                         {request.beneficiaryDisabilityType && (
                            <p className="text-sm text-muted-foreground mt-1">Discapacidad: <span className='font-medium text-foreground'>{request.beneficiaryDisabilityType}</span></p>
                         )}
                    </div>
                    <Button asChild variant="secondary">
                        <Link href={`/dashboard/registros/${request.beneficiaryId}`}>Ver Perfil Completo</Link>
                    </Button>
                </div>

                {request.beneficiaryNotes && (
                    <>
                    <Separator className="my-6" />
                    <div>
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Notas Adicionales del Beneficiario</p>
                        <div className="text-sm p-4 bg-muted/50 rounded-lg border text-foreground/80">
                            <p className="whitespace-pre-wrap">{request.beneficiaryNotes}</p>
                        </div>
                    </div>
                    </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Barra Lateral de Acciones */}
        <aside className="space-y-6">
          <RequestActionsCard requestId={request.id} currentStatus={request.status} />
            
            {/* Botón de Eliminar */}
            <Card className="bg-destructive/10 border-destructive/30">
                <CardHeader>
                    <CardTitle className="text-base text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> Zona de Peligro</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive/90 mb-4">La eliminación de una solicitud es una acción irreversible.</p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar Solicitud
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la solicitud de los servidores.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <form action={deleteAction}>
                                    <AlertDialogAction asChild>
                                        <Button type="submit" variant="destructive">Sí, eliminar permanentemente</Button>
                                    </AlertDialogAction>
                                </form>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </aside>
      </main>
    </div>
  );
}