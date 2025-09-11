// @/app/dashboard/registros/[id]/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, User, Edit, FileText, Calendar, Clock, Cake, Tag, Check, X, Hourglass, Truck, 
  PackageSearch, ArrowRight, Quote, MapPin, Phone, Mail, HeartHandshake, ShieldCheck, 
  BookUser, Users, Award, BarChart2
} from 'lucide-react';
import Link from 'next/link';
import { getBeneficiaryById, getRequests } from '@/lib/actions'; 
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/beneficiaries/DeleteButton';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// --- CONFIGURACIÓN DE ESTILOS (Sin cambios, pero podría moverse a un archivo de constantes) ---
const statusConfig = {
  'Pendiente': { icon: Hourglass, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200', color: 'bg-yellow-500', borderColor: 'border-yellow-500' },
  'Aprobada': { icon: Check, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200', color: 'bg-green-500', borderColor: 'border-green-500' },
  'Rechazada': { icon: X, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200', color: 'bg-red-500', borderColor: 'border-red-500' },
  'Entregada': { icon: Truck, className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200', color: 'bg-blue-500', borderColor: 'border-blue-500' },
  'default': { icon: Hourglass, className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200', color: 'bg-gray-500', borderColor: 'border-gray-500' }
};

const priorityConfig = {
  'Urgente': { className: 'bg-red-600/90 hover:bg-red-700 text-white' },
  'Alta': { className: 'bg-orange-500/90 hover:bg-orange-600 text-white' },
  'Media': { className: 'bg-yellow-500/90 hover:bg-yellow-600 text-white' },
  'Baja': { className: 'bg-green-500/90 hover:bg-green-600 text-white' },
  'default': { className: 'bg-gray-500/90 hover:bg-gray-600 text-white' }
};

// --- NUEVOS COMPONENTES REUTILIZABLES PARA UNA UI MÁS LIMPIA ---

/**
 * @name DetailField
 * @description Componente mejorado para mostrar un campo de información con un icono estilizado.
 */
const DetailField = ({ icon: Icon, label, value, className }: { icon: React.ElementType, label: string, value?: string | null | React.ReactNode, className?: string }) => {
  if (!value) return null;
  return (
    <div className={cn("flex items-start gap-4", className)}>
      <div className="flex-shrink-0 bg-muted/70 p-2.5 rounded-lg">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-base font-semibold text-foreground mt-0.5">
          {value}
        </div>
      </div>
    </div>
  );
};

/**
 * @name InfoSection
 * @description Contenedor para agrupar secciones de información, mejorando la estructura.
 */
const InfoSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="space-y-6">
    <h3 className="text-xl font-semibold text-foreground tracking-tight">{title}</h3>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
      {children}
    </div>
  </section>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default async function BeneficiaryDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) notFound();

  const [beneficiary, allRequests] = await Promise.all([
    getBeneficiaryById(id),
    getRequests()
  ]);

  if (!beneficiary) notFound();

  const beneficiaryRequests = allRequests
    .filter(req => req.beneficiaryId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="container mx-auto py-8 px-4 md:px-6">
        <Link href="/dashboard/registros" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver a Registros
        </Link>
        
        <div className="grid lg:grid-cols-12 lg:gap-8">
          {/* Columna principal de información */}
          <div className="lg:col-span-8 space-y-8">
            <InfoCard beneficiary={beneficiary} />
            <RequestTimeline requests={beneficiaryRequests} />
          </div>

          {/* Columna lateral de estadísticas */}
          <aside className="lg:col-span-4">
            <div className="sticky top-8 space-y-8">
              <StatSummary requests={beneficiaryRequests} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

// --- COMPONENTES ESPECIALIZADOS DE LA PÁGINA ---

/**
 * @name InfoCard
 * @description Tarjeta principal con la información del beneficiario.
 */
function InfoCard({ beneficiary }: { beneficiary: Awaited<ReturnType<typeof getBeneficiaryById>> }) {
  if (!beneficiary) return null;

  return (
    <Card className="overflow-hidden shadow-sm border-border/60">
      <CardHeader className="bg-gradient-to-br from-muted/20 to-muted/50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-tr from-primary/80 to-primary/50 text-white p-4 rounded-full shadow-inner">
            <User className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">{beneficiary.fullName}</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {beneficiary.type === 'adulto_mayor' ? 'Adulto Mayor' : 'Persona con Discapacidad'}
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-2 self-start md:self-center shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/registros/${beneficiary.id}/editar`}>
              <Edit className="h-4 w-4 mr-2" /> Editar
            </Link>
          </Button>
          <DeleteButton id={beneficiary.id} fullName={beneficiary.fullName} />
        </div>
      </CardHeader>
      
      <CardContent className="p-6 md:p-8 space-y-10">
        <InfoSection title="Información Personal">
          <DetailField icon={Cake} label="Fecha de Nacimiento" value={beneficiary.birthDate ? format(new Date(beneficiary.birthDate), "d 'de' MMMM, yyyy", { locale: es }) : 'No especificado'} />
          <DetailField icon={HeartHandshake} label="Estado Civil" value={beneficiary.estadoCivil} />
          <DetailField icon={Users} label="Etnia" value={beneficiary.etniaAborigen} />
        </InfoSection>

        <Separator />

        <InfoSection title="Datos de Contacto">
          <DetailField icon={MapPin} label="Dirección" value={beneficiary.direccion} />
          <DetailField icon={Phone} label="Teléfono" value={beneficiary.telefono} />
          <DetailField icon={Mail} label="Correo Electrónico" value={beneficiary.correoElectronico} />
        </InfoSection>

        {/* --- SECCIÓN ESPECÍFICA POR TIPO --- */}
        {(beneficiary.type === 'persona_discapacidad' || (beneficiary.type === 'adulto_mayor' && beneficiary.notes)) && <Separator />}
        
        {beneficiary.type === 'persona_discapacidad' && (
          <InfoSection title="Detalles de Discapacidad">
            <DetailField icon={Tag} label="Tipo de Discapacidad" value={beneficiary.disabilityType ? <Badge variant="secondary" className="text-base">{beneficiary.disabilityType}</Badge> : 'No especificado'} />
            <DetailField icon={Award} label="Grado de Discapacidad" value={beneficiary.gradoDiscapacidad} />
            <DetailField icon={ShieldCheck} label="Certificación Médica" value={beneficiary.certificacionMedica} />
          </InfoSection>
        )}

        {beneficiary.representante && (
            <div className="mt-4">
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BookUser className="h-5 w-5 text-primary"/>
                    Representante Asignado
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 p-4 bg-muted/40 rounded-lg border">
                    <DetailField icon={User} label="Nombre" value={`${beneficiary.representante.nombre} ${beneficiary.representante.apellido}`} />
                    <DetailField icon={Phone} label="Teléfono" value={beneficiary.representante.telefono} />
                </div>
            </div>
        )}

        {beneficiary.type === 'adulto_mayor' && beneficiary.notes && (
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground tracking-tight">Descripción de Salud</h3>
            <blockquote className="border-l-4 border-primary bg-primary/5 text-foreground/80 p-4 rounded-r-lg flex gap-4">
              <Quote className="h-6 w-6 text-primary/70 shrink-0 mt-1" />
              <p className="italic">{beneficiary.notes}</p>
            </blockquote>
          </section>
        )}
      </CardContent>

      <CardFooter className="bg-muted/50 px-6 py-4 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 border-t">
        <div className="flex items-center gap-2"><Calendar className="h-4 w-4"/><span>Registrado: {format(new Date(beneficiary.createdAt), 'dd/MM/yy, HH:mm')}</span></div>
        <div className="flex items-center gap-2"><Clock className="h-4 w-4"/><span>Última act.: {beneficiary.updatedAt ? format(new Date(beneficiary.updatedAt), 'dd/MM/yy, HH:mm') : 'N/A'}</span></div>
      </CardFooter>
    </Card>
  );
}

/**
 * @name RequestTimeline
 * @description Muestra el historial de solicitudes en formato de línea de tiempo.
 */
function RequestTimeline({ requests }: { requests: any[] }) {
  if (requests.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed bg-muted/30">
        <PackageSearch className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold text-foreground">Sin Solicitudes</h3>
        <p className="text-muted-foreground max-w-xs mx-auto mb-6 mt-1">Este beneficiario aún no tiene solicitudes. ¡Crea la primera!</p>
        <Button asChild>
          <Link href="/dashboard/solicitudes/nueva"><FileText className="h-4 w-4 mr-2" />Crear Nueva Solicitud</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        Historial de Solicitudes
      </h2>
      <div className="relative space-y-6 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
        {requests.map((request) => {
          const statusInfo = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.default;
          const priorityInfo = priorityConfig[request.priority as keyof typeof priorityConfig] || priorityConfig.default;
          const IconComponent = statusInfo.icon;
          return (
            <Link key={request.id} href={`/dashboard/solicitudes/${request.id}`} className="group relative flex items-start gap-4 pl-10">
              <div className={`absolute left-4 top-2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-slate-50 dark:ring-slate-950 ${statusInfo.color}`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div className={`flex-1 w-full bg-card p-4 border rounded-lg hover:border-primary/80 hover:shadow-md transition-all duration-200 ${statusInfo.borderColor} border-l-4`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <p className="font-semibold text-foreground line-clamp-1">{request.description}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={cn('font-semibold', priorityInfo.className)}>{request.priority}</Badge>
                    <Badge className={cn('font-semibold', statusInfo.className)}>{request.status}</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(new Date(request.createdAt), 'dd MMMM yyyy', { locale: es })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Ver Detalle <ArrowRight className="h-4 w-4"/>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * @name StatSummary
 * @description Tarjeta lateral con el resumen estadístico de las solicitudes.
 */
function StatSummary({ requests }: { requests: any[] }) {
    const totalRequests = requests.length;
    const statusCounts = requests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <Card className="shadow-sm border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Estadísticas</CardTitle>
                    <CardDescription>Resumen de solicitudes.</CardDescription>
                </div>
                <BarChart2 className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40 border">
                    <span className="text-sm font-medium text-muted-foreground">Total de Solicitudes</span>
                    <span className="text-2xl font-bold text-foreground">{totalRequests}</span>
                </div>
                {totalRequests > 0 && (
                    <div>
                        <div className="flex rounded-full overflow-hidden h-2.5 my-4 bg-muted">
                            {Object.entries(statusCounts).map(([status, count]) => {
                                const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.default;
                                const percentage = (count / totalRequests) * 100;
                                return <div key={status} className={statusInfo.color} style={{ width: `${percentage}%` }} title={`${status}: ${count}`} />;
                            })}
                        </div>
                        <div className="space-y-3">
                            {Object.entries(statusConfig)
                                .filter(([key]) => key !== 'default' && statusCounts[key] > 0)
                                .map(([status, config]) => {
                                    const count = statusCounts[status] || 0;
                                    const percentage = totalRequests > 0 ? ((count / totalRequests) * 100).toFixed(0) : 0;
                                    return (
                                        <div key={status} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2.5">
                                                <span className={cn("h-2.5 w-2.5 rounded-full", config.color)}></span>
                                                <span className="text-muted-foreground">{status}</span>
                                            </div>
                                            <div className="font-semibold text-foreground">
                                                {count} <span className="text-muted-foreground/70 font-normal">({percentage}%)</span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}