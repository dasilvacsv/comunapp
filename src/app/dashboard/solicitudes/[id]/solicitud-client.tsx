'use client';

import React, { FC } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getRequestById, updateRequestStatus } from '@/lib/actions';

// --- UI Components ---
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

// --- Icons ---
import {
  ArrowLeft, User, Calendar, Clock, CheckCircle, XCircle, Package, Flag, Trash2,
  FileText, ClipboardList, AlertTriangle, Undo2, HeartHandshake, Accessibility, Cake,
  Home, Phone, Mail, UserCheck, Loader2
} from 'lucide-react';

// --- TIPOS Y CONFIGURACIÓN ---

type RequestData = Awaited<ReturnType<typeof getRequestById>>;
type RequestStatus = NonNullable<RequestData>['estado'];
type RequestPriority = NonNullable<RequestData>['prioridad'];

interface SolicitudDetailClientProps {
  request: NonNullable<RequestData>;
  deleteAction: () => Promise<void>;
}

const statusConfig: Record<RequestStatus, { label: string; icon: React.ElementType; className: string }> = {
  Pendiente: { label: 'Pendiente', icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  Aprobada: { label: 'Aprobada', icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-300' },
  Rechazada: { label: 'Rechazada', icon: XCircle, className: 'bg-red-100 text-red-800 border-red-300' },
  Entregada: { label: 'Entregada', icon: Package, className: 'bg-blue-100 text-blue-800 border-blue-300' },
};

const priorityConfig: Record<RequestPriority, { label: string; className: string }> = {
  Baja: { label: 'Baja', className: 'bg-gray-100 text-gray-800 border-gray-300' },
  Media: { label: 'Media', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  Alta: { label: 'Alta', className: 'bg-orange-100 text-orange-800 border-orange-300' },
  Urgente: { label: 'Urgente', className: 'bg-red-100 text-red-800 border-red-300' },
};


// --- SUBCOMPONENTES DE UI MODULARES Y REUTILIZABLES ---

/**
 * Muestra un botón que refleja el estado de envío de un formulario (pending/idle).
 * ¡Mejora clave para la UX!
 */
const ActionSubmitButton: FC<React.ComponentProps<typeof Button> & { pendingText: string }> = ({ children, pendingText, ...props }) => {
  const { pending } = useFormStatus();
  return (
    <Button {...props} disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

const InfoItem: FC<{ icon: React.ElementType; title: string; value?: string | null }> = ({ icon: Icon, title, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-muted-foreground">{title}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
};

const BeneficiaryTypeBadge: FC<{ type: 'adulto_mayor' | 'persona_discapacidad' }> = ({ type }) => {
  const isAdultoMayor = type === 'adulto_mayor';
  const Icon = isAdultoMayor ? HeartHandshake : Accessibility;
  const text = isAdultoMayor ? 'Adulto Mayor' : 'Persona con Discapacidad';
  const className = isAdultoMayor ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  return (
    <Badge variant="secondary" className={cn("font-normal", className)}>
      <Icon className="h-3.5 w-3.5 mr-1.5" /> {text}
    </Badge>
  );
};

const BeneficiaryInfoCard: FC<{ beneficiary: NonNullable<RequestData>['beneficiaryDetails'] }> = ({ beneficiary }) => {
  if (!beneficiary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Información del Beneficiario</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay un beneficiario asociado a esta solicitud.</p>
        </CardContent>
      </Card>
    );
  }

  const birthDate = beneficiary.fechaNacimiento ? new Date(beneficiary.fechaNacimiento) : null;
  const age = birthDate ? differenceInYears(new Date(), birthDate) : null;

  // Generamos los items de información dinámicamente para un JSX más limpio
  const infoItems = [
    { icon: Cake, title: "Fecha de Nacimiento", value: birthDate ? `${format(birthDate, "dd 'de' MMMM, yyyy", { locale: es })} (${age} años)` : 'No especificado' },
    { icon: UserCheck, title: "Estado Civil", value: beneficiary.estadoCivil },
    { icon: Home, title: "Dirección", value: beneficiary.direccion },
    { icon: Phone, title: "Teléfono", value: beneficiary.telefono },
    { icon: Mail, title: "Correo Electrónico", value: beneficiary.correoElectronico },
  ];

  if (beneficiary.type === 'persona_discapacidad') {
    infoItems.push(
      { icon: Accessibility, title: "Tipo de Discapacidad", value: beneficiary.tipoDiscapacidad },
      { icon: ClipboardList, title: "Grado de Discapacidad", value: beneficiary.gradoDiscapacidad },
      { icon: FileText, title: "Certificación Médica", value: beneficiary.certificacionMedica },
    );
    if (beneficiary.representante) {
        infoItems.push({ icon: User, title: "Representante", value: `${beneficiary.representante.nombre} ${beneficiary.representante.apellido}` });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            <span>{beneficiary.nombre} {beneficiary.apellido}</span>
          </CardTitle>
          <BeneficiaryTypeBadge type={beneficiary.type} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {infoItems.map(item => <InfoItem key={item.title} {...item} />)}
        </div>
        {beneficiary.type === 'adulto_mayor' && beneficiary.descripcionSalud && (
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-2"><ClipboardList className="h-4 w-4 text-muted-foreground" /> Descripción de Salud</p>
            <p className="text-sm p-3 bg-muted/50 rounded-md border text-foreground/80 whitespace-pre-wrap">{beneficiary.descripcionSalud}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 mt-6">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/dashboard/registros/${beneficiary.id}`}>Ver Perfil Completo del Beneficiario</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const RequestActionsCard: FC<{ requestId: string; currentStatus: RequestStatus }> = ({ requestId, currentStatus }) => {
  const approveAction = updateRequestStatus.bind(null, requestId, 'Aprobada');
  const rejectAction = updateRequestStatus.bind(null, requestId, 'Rechazada');
  const deliverAction = updateRequestStatus.bind(null, requestId, 'Entregada');
  const reopenAction = updateRequestStatus.bind(null, requestId, 'Pendiente');

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Gestión de la Solicitud</CardTitle>
        <CardDescription>Actualiza el estado y realiza acciones.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStatus === 'Pendiente' && (
          <div className="p-4 border rounded-lg bg-background space-y-3">
            <p className="text-sm font-medium">Acciones de Revisión</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <form action={approveAction} className="flex-1">
                <ActionSubmitButton className="w-full" pendingText="Aprobando...">
                  <CheckCircle className="mr-2 h-4 w-4" /> Aprobar
                </ActionSubmitButton>
              </form>
              <form action={rejectAction} className="flex-1">
                <ActionSubmitButton variant="outline" className="w-full" pendingText="Rechazando...">
                  <XCircle className="mr-2 h-4 w-4" /> Rechazar
                </ActionSubmitButton>
              </form>
            </div>
          </div>
        )}

        {currentStatus === 'Aprobada' && (
          <div className="p-4 border rounded-lg bg-background space-y-3">
            <p className="text-sm font-medium">Acción de Entrega</p>
            <form action={deliverAction} className="w-full">
              <ActionSubmitButton className="w-full" pendingText="Marcando...">
                <Package className="mr-2 h-4 w-4" /> Marcar como Entregada
              </ActionSubmitButton>
            </form>
             <Separator className="my-3" />
             <form action={reopenAction} className="w-full">
                <ActionSubmitButton variant="secondary" size="sm" className="w-full text-muted-foreground" pendingText="Revirtiendo...">
                    <Undo2 className="mr-2 h-4 w-4" /> Revertir Aprobación
                </ActionSubmitButton>
            </form>
          </div>
        )}
        
        {currentStatus === 'Rechazada' && (
           <div className="text-center p-4 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
             <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
             <h3 className="mt-2 text-md font-semibold text-red-800">Solicitud Rechazada</h3>
             <p className="mt-1 text-sm text-red-600">Puedes reabrirla para una nueva revisión.</p>
             <form action={reopenAction} className="mt-4">
               <ActionSubmitButton variant="outline" className="w-full" pendingText="Reabriendo...">
                 <Undo2 className="mr-2 h-4 w-4" /> Reabrir Solicitud
               </ActionSubmitButton>
             </form>
           </div>
        )}

        {currentStatus === 'Entregada' && (
            <div className="flex items-center gap-3 text-sm text-green-700 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Proceso finalizado con éxito.</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export function SolicitudDetailClient({ request, deleteAction }: SolicitudDetailClientProps) {
  const currentStatusInfo = statusConfig[request.estado];
  const currentPriorityInfo = priorityConfig[request.prioridad];
  const formattedCreationDate = format(new Date(request.createdAt), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      {/* --- Encabezado --- */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" aria-label="Volver a solicitudes">
            <Link href="/dashboard/solicitudes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
                 <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    Solicitud
                 </h1>
                 <Badge variant="secondary">#{request.id.substring(0, 8)}</Badge>
            </div>
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

      {/* --- Contenido Principal --- */}
      <main className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Detalles de la Solicitud</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {request.descripcion}
              </p>
              <Separator className="my-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoItem icon={Calendar} title="Fecha de Creación" value={formattedCreationDate} />
                <InfoItem icon={Clock} title="Última Actualización" value={format(new Date(request.updatedAt), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })} />
              </div>
            </CardContent>
          </Card>

          <BeneficiaryInfoCard beneficiary={request.beneficiaryDetails} />
        </div>

        {/* --- Barra Lateral de Acciones --- */}
        <aside className="space-y-6">
          <RequestActionsCard requestId={request.id} currentStatus={request.estado} />

          <Card className="bg-destructive/10 border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> Zona de Peligro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive/90 mb-4">La eliminación de una solicitud es una acción permanente e irreversible.</p>
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
                      Esta acción no se puede deshacer. Esto eliminará permanentemente la solicitud de la base de datos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    {/*
                      FIX: El error 'React.Children.only' se soluciona aquí.
                      En lugar de envolver el botón en un <form>, llamamos a la Server Action
                      directamente en el `onClick`. Esto evita el conflicto de composición.
                    */}
                    <AlertDialogAction asChild>
                      <Button onClick={deleteAction} variant="destructive">
                        Sí, eliminar permanentemente
                      </Button>
                    </AlertDialogAction>
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