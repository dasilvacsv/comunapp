'use server'; // El componente principal sigue siendo del servidor

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { beneficiaries, requests } from '@/lib/db/schema';
import { count, eq, desc } from 'drizzle-orm';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PackageCheck,
  PlusCircle,
  FilePlus,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

// Componente de Gráfico (CLIENTE)
import { RequestsStatusChart } from '@/components/dashboard/requests-status-chart';


// Helper para mapear estados a colores e iconos (mejora la mantenibilidad)
const statusConfig = {
  Pendiente: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', badgeColor: 'bg-yellow-500 hover:bg-yellow-600' },
  Aprobada: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', badgeColor: 'bg-green-500 hover:bg-green-600' },
  Rechazada: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', badgeColor: 'bg-red-500 hover:bg-red-600' },
  Entregada: { icon: PackageCheck, color: 'text-blue-600', bgColor: 'bg-blue-100', badgeColor: 'bg-blue-500 hover:bg-blue-600' },
};

async function getDashboardData() {
  const [
    totalBeneficiaries,
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    deliveredRequests,
    recentRequests,
  ] = await Promise.all([
    db.select({ count: count() }).from(beneficiaries),
    db.select({ count: count() }).from(requests),
    db.select({ count: count() }).from(requests).where(eq(requests.status, 'Pendiente')),
    db.select({ count: count() }).from(requests).where(eq(requests.status, 'Aprobada')),
    db.select({ count: count() }).from(requests).where(eq(requests.status, 'Rechazada')),
    db.select({ count: count() }).from(requests).where(eq(requests.status, 'Entregada')),
    db
      .select({
        id: requests.id,
        status: requests.status,
        createdAt: requests.createdAt,
        beneficiaryName: beneficiaries.fullName,
      })
      .from(requests)
      .leftJoin(beneficiaries, eq(requests.beneficiaryId, beneficiaries.id))
      .orderBy(desc(requests.createdAt))
      .limit(5),
  ]);

  return {
    stats: {
      totalBeneficiaries: totalBeneficiaries[0]?.count || 0,
      totalRequests: totalRequests[0]?.count || 0,
      pending: pendingRequests[0]?.count || 0,
      approved: approvedRequests[0]?.count || 0,
      rejected: rejectedRequests[0]?.count || 0,
      delivered: deliveredRequests[0]?.count || 0,
    },
    recentRequests,
  };
}

function StatCard({ title, value, icon: Icon, description, colorClass, bgColorClass, actionLink, actionText }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="text-3xl font-bold">{value}</div>
          </div>
          <div className={`p-3 rounded-lg ${bgColorClass}`}>
            <Icon className={`h-6 w-6 ${colorClass}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
        {actionLink && (
           <Link href={actionLink} className="text-xs font-semibold text-primary hover:underline mt-2 inline-block">
             {actionText} →
           </Link>
         )}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const { stats, recentRequests } = await getDashboardData();

  // Preparamos los datos para el gráfico
  const chartData = [
    { name: 'Pendiente', value: stats.pending, fill: 'var(--color-pending)' },
    { name: 'Aprobada', value: stats.approved, fill: 'var(--color-approved)' },
    { name: 'Rechazada', value: stats.rejected, fill: 'var(--color-rejected)' },
    { name: 'Entregada', value: stats.delivered, fill: 'var(--color-delivered)' },
  ].filter(item => item.value > 0); // Filtramos para no mostrar categorías con 0

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido de nuevo 👋</h1>
        <p className="text-muted-foreground mt-1">
          Aquí tienes un resumen del estado del sistema de gestión.
        </p>
      </header>

      <main className="flex flex-col gap-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard
            title="Total Beneficiarios"
            value={stats.totalBeneficiaries}
            icon={Users}
            description="Personas registradas en el sistema"
            colorClass="text-sky-600"
            bgColorClass="bg-sky-100"
          />
          <StatCard
            title="Solicitudes Pendientes"
            value={stats.pending}
            icon={Clock}
            description="Esperando por revisión y aprobación"
            colorClass="text-yellow-600"
            bgColorClass="bg-yellow-100"
            actionLink="/dashboard/solicitudes?status=Pendiente"
            actionText="Revisar ahora"
          />
          <StatCard
            title="Aprobadas"
            value={stats.approved}
            icon={CheckCircle}
            description="Ayudas listas para ser entregadas"
            colorClass="text-green-600"
            bgColorClass="bg-green-100"
          />
           <StatCard
            title="Total Entregadas"
            value={stats.delivered}
            icon={PackageCheck}
            description="Ayudas que ya han sido entregadas"
            colorClass="text-blue-600"
            bgColorClass="bg-blue-100"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Solicitudes Recientes</CardTitle>
                <CardDescription>
                  Las últimas 5 solicitudes creadas en el sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flow-root">
                  <ul role="list" className="-my-4 divide-y divide-gray-200">
                    {recentRequests.map((req) => (
                      <li key={req.id} className="flex items-center py-4 space-x-4">
                        <div className={`p-2 rounded-full ${statusConfig[req.status]?.bgColor || 'bg-gray-100'}`}>
                           {(() => {
                            const Icon = statusConfig[req.status]?.icon || FileText;
                            const color = statusConfig[req.status]?.color || 'text-gray-600';
                            return <Icon className={`h-5 w-5 ${color}`} />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {req.beneficiaryName || 'Beneficiario no encontrado'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Creado: {new Date(req.createdAt).toLocaleDateString('es-VE')}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                           <Badge className={`${statusConfig[req.status]?.badgeColor || 'bg-gray-500'} text-white`}>
                            {req.status}
                           </Badge>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/solicitudes/${req.id}`}>Ver</Link>
                          </Button>
                        </div>
                      </li>
                    ))}
                    {recentRequests.length === 0 && (
                      <p className="text-sm text-center text-gray-500 py-4">No hay solicitudes recientes.</p>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Funciones principales del sistema.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button asChild>
                  <Link href="/dashboard/registros/nuevo">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Registrar Beneficiario
                  </Link>
                </Button>
                 <Button asChild variant="secondary">
                  <Link href="/dashboard/solicitudes/nueva">
                    <FilePlus className="mr-2 h-4 w-4" />
                    Crear Solicitud
                  </Link>
                </Button>
                 <Button asChild variant="outline">
                  <Link href="/dashboard/reportes">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ver Reportes
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
               <CardHeader>
                <CardTitle>Resumen de Solicitudes</CardTitle>
                 <CardDescription>Distribución total por estado.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* ✨ AQUÍ INSERTAMOS EL GRÁFICO ✨ */}
                <RequestsStatusChart data={chartData} totalRequests={stats.totalRequests} />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}