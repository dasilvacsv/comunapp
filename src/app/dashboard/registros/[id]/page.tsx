import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Edit, FileText, Calendar, Clock, Cake, Tag, Check, X, Hourglass, Truck, PackageSearch, ArrowRight, Quote } from 'lucide-react';
import Link from 'next/link';
import { getBeneficiaryById, getRequests } from '@/lib/actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/beneficiaries/DeleteButton';
import { cn } from '@/lib/utils'; // Asegúrate de tener esta utilidad de shadcn

interface PageProps {
  params: {
    id: string;
  };
}

// Configuración centralizada para estados y prioridades para mayor consistencia y facilidad de mantenimiento
const statusConfig = {
  'Pendiente': { icon: Hourglass, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200', color: 'bg-yellow-500' },
  'Aprobada': { icon: Check, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200', color: 'bg-green-500' },
  'Rechazada': { icon: X, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200', color: 'bg-red-500' },
  'Entregada': { icon: Truck, className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200', color: 'bg-blue-500' },
  'default': { icon: Hourglass, className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200', color: 'bg-gray-500' }
};

const priorityConfig = {
  'Urgente': { className: 'bg-red-500 text-white border-red-600 hover:bg-red-600' },
  'Alta': { className: 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600' },
  'Media': { className: 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600' },
  'Baja': { className: 'bg-green-500 text-white border-green-600 hover:bg-green-600' },
  'default': { className: 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600' }
};

export default async function BeneficiaryDetailPage({ params }: PageProps) {
  const { id } = params;
  if (!id) notFound();

  const [beneficiary, allRequests] = await Promise.all([
    getBeneficiaryById(id),
    getRequests()
  ]);

  if (!beneficiary) notFound();

  const beneficiaryRequests = allRequests.filter(req => req.beneficiaryId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Ordenar por más reciente

  const statusCounts = beneficiaryRequests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalRequests = beneficiaryRequests.length;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        
        {/* -- Botón de Volver -- */}
        <Link href="/dashboard/registros" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver a Registros
        </Link>

        <div className="grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
          
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tarjeta de Perfil del Beneficiario */}
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="bg-gray-50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{beneficiary.fullName}</CardTitle>
                    <CardDescription>Perfil detallado y datos personales.</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 self-end md:self-auto">
                  <Link href={`/dashboard/registros/${id}/editar`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                  </Link>
                  <DeleteButton id={id} fullName={beneficiary.fullName} />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {beneficiary.birthDate && (
                    <div className="flex items-start gap-3">
                      <Cake className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <Label className="text-xs font-semibold text-gray-500">FECHA DE NACIMIENTO</Label>
                        <p className="text-base font-medium text-gray-800">
                          {format(new Date(beneficiary.birthDate), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                  )}
                  {beneficiary.disabilityType && (
                    <div className="flex items-start gap-3">
                      <Tag className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <Label className="text-xs font-semibold text-gray-500">TIPO DE DISCAPACIDAD</Label>
                        <Badge variant="secondary" className="text-base">{beneficiary.disabilityType}</Badge>
                      </div>
                    </div>
                  )}
                </div>
                {beneficiary.notes && (
                  <div className="space-y-2 pt-6 border-t">
                    <Label className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                      <Quote className="h-4 w-4" />
                      NOTAS ADICIONALES
                    </Label>
                    <blockquote className="border-l-4 border-primary/50 bg-primary/5 text-gray-700 p-4 rounded-r-lg italic">
                      {beneficiary.notes}
                    </blockquote>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 px-6 py-3 text-xs text-gray-500 flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4"/>
                  <span>Registrado: {format(new Date(beneficiary.createdAt), 'dd/MM/yy HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4"/>
                  <span>Última act.: {format(new Date(beneficiary.updatedAt), 'dd/MM/yy HH:mm')}</span>
                </div>
              </CardFooter>
            </Card>

            {/* Historial de Solicitudes */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Historial de Solicitudes
              </h2>
              {totalRequests === 0 ? (
                <Card className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed">
                  <PackageSearch className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800">Sin Solicitudes</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mb-6">Este beneficiario no tiene solicitudes registradas. Puedes crear una nueva.</p>
                  <Link href="/dashboard/solicitudes/nueva">
                    <Button><FileText className="h-4 w-4 mr-2" />Crear Solicitud</Button>
                  </Link>
                </Card>
              ) : (
                <div className="relative space-y-6 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
                  {beneficiaryRequests.map((request) => {
                    const statusInfo = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.default;
                    const priorityInfo = priorityConfig[request.priority as keyof typeof priorityConfig] || priorityConfig.default;
                    const IconComponent = statusInfo.icon;
                    return (
                      <Link
                        key={request.id}
                        href={`/dashboard/solicitudes/${request.id}`}
                        className="group relative flex items-start gap-4 pl-10"
                      >
                        <div className={`absolute left-4 top-1 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full ${statusInfo.color}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 w-full bg-white p-4 border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all duration-200">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <p className="font-semibold text-gray-800 line-clamp-1">{request.description}</p>
                            <div className="flex items-center gap-2 shrink-0">
                               <Badge className={cn('font-semibold', priorityInfo.className)}>{request.priority}</Badge>
                               <Badge className={cn('font-semibold', statusInfo.className)}>{request.status}</Badge>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                             <div className="flex items-center gap-1.5">
                               <Calendar className="h-3.5 w-3.5" />
                               <span>{format(new Date(request.createdAt), 'dd MMMM yyyy', { locale: es })}</span>
                             </div>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               Ver Detalle <ArrowRight className="h-3.5 w-3.5"/>
                             </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Columna Lateral de Estadísticas */}
          <div className="space-y-8">
            <Card className="shadow-sm sticky top-8">
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
                <CardDescription>Resumen de las solicitudes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border">
                    <span className="text-sm font-medium text-gray-600">Total de Solicitudes</span>
                    <span className="text-2xl font-bold text-gray-900">{totalRequests}</span>
                 </div>

                 {totalRequests > 0 && (
                  <div>
                    <div className="flex rounded-full overflow-hidden h-2 my-4 bg-gray-200">
                      {Object.entries(statusCounts).map(([status, count]) => {
                          const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.default;
                          const percentage = (count / totalRequests) * 100;
                          return <div key={status} className={statusInfo.color} style={{ width: `${percentage}%` }} />;
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
                              <div className="flex items-center gap-2">
                                <span className={cn("h-2.5 w-2.5 rounded-full", config.color)}></span>
                                <span className="text-gray-600">{status}</span>
                              </div>
                              <div className="font-semibold text-gray-800">
                                {count} <span className="text-gray-400 font-normal">({percentage}%)</span>
                              </div>
                            </div>
                          );
                      })}
                    </div>
                  </div>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}