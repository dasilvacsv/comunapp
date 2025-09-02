'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Skeleton } from '@/components/ui/skeleton';

import { 
  BarChart3, Users, FileText, TrendingUp, Download, Filter, Clock, 
  CheckCircle, XCircle, Package, AlertCircle, ClipboardList, 
  ChevronDown, Check, Trash2 
} from 'lucide-react';

import { getReportData } from '@/lib/actions';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { PDFDownloadLink, Document, Page, StyleSheet, Text, View, Font } from '@react-pdf/renderer';

// --- CONSTANTES Y CONFIGURACIÓN ---

const COLORS_STATUS = {
  Aprobada: '#10B981',
  Pendiente: '#F59E0B',
  Rechazada: '#EF4444',
  Entregada: '#3B82F6',
};

const COLORS_PRIORITY = {
  Urgente: '#EF4444',
  Alta: '#F97316',
  Media: '#F59E0B',
  Baja: '#22C55E',
};

const STATUS_OPTIONS = ['Pendiente', 'Aprobada', 'Rechazada', 'Entregada'];
const PRIORITY_OPTIONS = ['Baja', 'Media', 'Alta', 'Urgente'];

// --- UTILIDADES DE ESTILO (PARA LA UI) ---

const getStatusAppearance = (status) => {
  switch (status) {
    case 'Pendiente': return { className: 'border-yellow-300 bg-yellow-50 text-yellow-800', icon: <Clock className="h-4 w-4 text-yellow-500" /> };
    case 'Aprobada': return { className: 'border-green-300 bg-green-50 text-green-800', icon: <CheckCircle className="h-4 w-4 text-green-500" /> };
    case 'Rechazada': return { className: 'border-red-300 bg-red-50 text-red-800', icon: <XCircle className="h-4 w-4 text-red-500" /> };
    case 'Entregada': return { className: 'border-blue-300 bg-blue-50 text-blue-800', icon: <Package className="h-4 w-4 text-blue-500" /> };
    default: return { className: 'border-gray-300 bg-gray-50 text-gray-800', icon: <AlertCircle className="h-4 w-4 text-gray-500" /> };
  }
};

const getPriorityAppearance = (priority) => {
  switch (priority) {
    case 'Urgente': return 'border-red-300 bg-red-50 text-red-800';
    case 'Alta': return 'border-orange-300 bg-orange-50 text-orange-800';
    case 'Media': return 'border-yellow-300 bg-yellow-50 text-yellow-800';
    case 'Baja': return 'border-green-300 bg-green-50 text-green-800';
    default: return 'border-gray-300 bg-gray-50 text-gray-800';
  }
};

// --- COMPONENTE PDF MEJORADO ---

Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
  ]
});

const pdfStyles = StyleSheet.create({
  page: { 
    fontFamily: 'Inter', 
    fontSize: 9, 
    paddingTop: 35, 
    paddingBottom: 65, 
    paddingHorizontal: 35,
    backgroundColor: '#ffffff',
    color: '#374151'
  },
  header: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    textAlign: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  twoColumnGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statLabel: {
    fontWeight: 'medium',
    color: '#4B5563',
  },
  statValue: {
    fontWeight: 'bold',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRowStriped: {
    backgroundColor: '#F9FAFB',
  },
  tableColHeader: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableCol: {
    padding: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
});

const ReportePDF = ({ data }) => {
  const { totalBeneficiaries, totalRequests, requestsByStatus, recentRequests } = data;
  const approvalRate = totalRequests > 0 ? Math.round((requestsByStatus.find(s => s.status === 'Aprobada')?.count || 0) / totalRequests * 100) : 0;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.headerTitle}>Reporte de Gestión</Text>
          <Text style={pdfStyles.headerSubtitle}>Análisis del Sistema de Beneficiarios</Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Resumen General</Text>
          <View style={pdfStyles.twoColumnGrid}>
            <View style={pdfStyles.column}>
              <View style={pdfStyles.statItem}><Text style={pdfStyles.statLabel}>Total Beneficiarios</Text><Text style={pdfStyles.statValue}>{totalBeneficiaries}</Text></View>
              <View style={pdfStyles.statItem}><Text style={pdfStyles.statLabel}>Total Solicitudes</Text><Text style={pdfStyles.statValue}>{totalRequests}</Text></View>
            </View>
            <View style={pdfStyles.column}>
              <View style={pdfStyles.statItem}><Text style={pdfStyles.statLabel}>Tasa de Aprobación</Text><Text style={pdfStyles.statValue}>{approvalRate}%</Text></View>
              <View style={pdfStyles.statItem}><Text style={pdfStyles.statLabel}>Pendientes</Text><Text style={pdfStyles.statValue}>{requestsByStatus.find(s => s.status === 'Pendiente')?.count || 0}</Text></View>
            </View>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Desglose de Solicitudes por Estado</Text>
          <View style={pdfStyles.table}>
            <View style={[pdfStyles.tableRow, pdfStyles.tableColHeader]}>
              <Text style={{ width: '40%' }}>Estado</Text>
              <Text style={{ width: '30%', textAlign: 'right' }}>Cantidad</Text>
              <Text style={{ width: '30%', textAlign: 'right' }}>Porcentaje</Text>
            </View>
            {requestsByStatus.map((item, index) => (
              <View style={[pdfStyles.tableRow, index % 2 === 1 && pdfStyles.tableRowStriped]} key={index}>
                <Text style={[pdfStyles.tableCol, { width: '40%' }]}>{item.status}</Text>
                <Text style={[pdfStyles.tableCol, { width: '30%', textAlign: 'right' }]}>{item.count}</Text>
                <Text style={[pdfStyles.tableCol, { width: '30%', textAlign: 'right' }]}>{(item.count / totalRequests * 100).toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Últimas Solicitudes Registradas</Text>
          <View style={pdfStyles.table}>
            <View style={[pdfStyles.tableRow, pdfStyles.tableColHeader]}>
                <Text style={{ width: '40%' }}>Descripción</Text>
                <Text style={{ width: '25%' }}>Beneficiario</Text>
                <Text style={{ width: '15%' }}>Estado</Text>
                <Text style={{ width: '20%' }}>Fecha</Text>
            </View>
            {recentRequests.slice(0, 10).map((req, index) => (
               <View style={[pdfStyles.tableRow, index % 2 === 1 && pdfStyles.tableRowStriped]} key={req.id}>
                <Text style={[pdfStyles.tableCol, { width: '40%' }]}>{req.description}</Text>
                <Text style={[pdfStyles.tableCol, { width: '25%' }]}>{req.beneficiaryName}</Text>
                <Text style={[pdfStyles.tableCol, { width: '15%' }]}>{req.status}</Text>
                <Text style={[pdfStyles.tableCol, { width: '20%' }]}>{format(new Date(req.createdAt), 'dd/MM/yyyy')}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={pdfStyles.footer} fixed>
          <Text>Generado el: {format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};


// --- COMPONENTES DE UI ---

const StatCard = ({ title, value, description, icon, iconColor = 'text-gray-500' }) => (
  <Card className="transition-transform transform hover:scale-105 hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`h-4 w-4 ${iconColor}`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const EmptyState = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center h-full text-center py-10 text-gray-500">
    <div className="h-10 w-10 mb-2 opacity-50">{icon}</div>
    <p>{message}</p>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-pulse">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
    <hr className="border-gray-200" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
    </div>
    <div className="grid lg:grid-cols-3 gap-6">
      <Skeleton className="lg:col-span-1 h-80" />
      <Skeleton className="lg:col-span-2 h-80" />
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <Skeleton className="h-96" />
      <Skeleton className="h-96" />
    </div>
  </div>
);


// --- COMPONENTE PRINCIPAL ---

export default function ReportesPage() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const filters = { status: statusFilter, priority: priorityFilter };
        const data = await getReportData(filters);
        setReportData(data);
      } catch (err) {
        console.error("Error al cargar datos del reporte:", err);
        setError("No se pudieron cargar los datos. Inténtalo de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [statusFilter, priorityFilter]);

  const { 
    totalBeneficiaries, 
    totalRequests, 
    requestsByStatus, 
    requestsByPriority, 
    recentRequests, 
    beneficiariesByDisability 
  } = reportData || {};

  const memoizedStats = useMemo(() => {
    if (!reportData) return { approvalRate: 0, averageRequests: '0.0', approvedCount: 0 };
    
    const approvedCount = requestsByStatus?.find(s => s.status === 'Aprobada')?.count || 0;
    const approvalRate = totalRequests ? Math.round((approvedCount / totalRequests) * 100) : 0;
    const averageRequests = totalBeneficiaries ? (totalRequests / totalBeneficiaries).toFixed(1) : '0.0';

    return { approvalRate, averageRequests, approvedCount };
  }, [reportData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = reportData?.totalRequests || 0;
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 text-sm">{data.status || data.priority || data.disabilityType}</p>
          <p className="text-xs text-gray-600">Total: <span className="font-semibold">{data.count}</span></p>
          {total > 0 && data.status && (
             <p className="text-xs text-gray-600">Porcentaje: <span className="font-semibold">{((data.count / total) * 100).toFixed(1)}%</span></p>
          )}
        </div>
      );
    }
    return null;
  };
  
  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="p-8 text-center">
        <XCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-red-600">Ocurrió un error</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }
  
  if (!reportData) {
    return (
      <div className="p-8 text-center text-gray-500">
        No se encontraron datos para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header y Acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Reportes 📈</h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado del sistema de gestión de beneficiarios.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <Command>
                <CommandInput placeholder="Buscar filtro..." />
                <CommandList>
                  <CommandEmpty>No se encontraron filtros.</CommandEmpty>
                  <CommandGroup heading="Estado">
                    {STATUS_OPTIONS.map(status => (
                      <CommandItem key={status} onSelect={() => setStatusFilter(statusFilter === status ? '' : status)}>
                        <Check className={`mr-2 h-4 w-4 ${statusFilter === status ? 'opacity-100' : 'opacity-0'}`} />
                        {status}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Prioridad">
                    {PRIORITY_OPTIONS.map(priority => (
                      <CommandItem key={priority} onSelect={() => setPriorityFilter(priorityFilter === priority ? '' : priority)}>
                        <Check className={`mr-2 h-4 w-4 ${priorityFilter === priority ? 'opacity-100' : 'opacity-0'}`} />
                        {priority}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {(statusFilter || priorityFilter) && (
                     <><CommandSeparator /><CommandGroup>
                      <CommandItem onSelect={() => { setStatusFilter(''); setPriorityFilter(''); }} className="text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Limpiar filtros
                      </CommandItem>
                    </CommandGroup></>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <PDFDownloadLink
            document={<ReportePDF data={reportData} />}
            fileName={`Reporte_Gestion_${format(new Date(), 'yyyy-MM-dd')}.pdf`}
          >
            {({ loading }) => (
              <Button className="flex items-center gap-2" disabled={loading}>
                <Download className="h-4 w-4" />
                <span>{loading ? 'Generando PDF...' : 'Exportar PDF'}</span>
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Beneficiarios" value={totalBeneficiaries} description="Personas registradas en el sistema" icon={<Users />} iconColor="text-blue-500" />
        <StatCard title="Total Solicitudes" value={totalRequests} description="Solicitudes de ayuda recibidas" icon={<FileText />} iconColor="text-indigo-500" />
        <StatCard title="Tasa de Aprobación" value={`${memoizedStats.approvalRate}%`} description={`${memoizedStats.approvedCount} de ${totalRequests} solicitudes aprobadas`} icon={<TrendingUp />} iconColor="text-green-500" />
        <StatCard title="Promedio por Beneficiario" value={memoizedStats.averageRequests} description="Solicitudes por cada beneficiario" icon={<BarChart3 />} iconColor="text-purple-500" />
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>Estado actual de las solicitudes.</CardDescription>
          </CardHeader>
          <CardContent>
            {requestsByStatus?.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={requestsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {requestsByStatus.map(entry => <Cell key={entry.status} fill={COLORS_STATUS[entry.status]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState icon={<FileText />} message="No hay datos de solicitudes" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribución por Prioridad</CardTitle>
            <CardDescription>Clasificación de urgencia de las solicitudes.</CardDescription>
          </CardHeader>
          <CardContent>
            {requestsByPriority?.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer>
                  <BarChart data={requestsByPriority} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="priority" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Solicitudes" radius={[4, 4, 0, 0]}>
                      {requestsByPriority.map(entry => <Cell key={entry.priority} fill={COLORS_PRIORITY[entry.priority]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState icon={<AlertCircle />} message="No hay datos de prioridad" />}
          </CardContent>
        </Card>
      </div>

      {/* Listas y Datos Adicionales */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Recientes</CardTitle>
            <CardDescription>Últimas solicitudes registradas en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRequests?.length > 0 ? (
              <div className="space-y-4">
                {recentRequests.map(req => {
                  const statusInfo = getStatusAppearance(req.status);
                  const priorityClass = getPriorityAppearance(req.priority);
                  return (
                    <div key={req.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0">{statusInfo.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-gray-800">{req.description}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className="truncate">{req.beneficiaryName || 'N/A'}</span>
                          <span className="mx-2">•</span>
                          <span className="flex-shrink-0">{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true, locale: es })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end gap-1 flex-shrink-0">
                        <Badge variant="outline" className={`text-xs ${priorityClass}`}>{req.priority}</Badge>
                        <Badge variant="outline" className={`text-xs ${statusInfo.className}`}>{req.status}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <EmptyState icon={<ClipboardList />} message="No hay solicitudes recientes" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beneficiarios por Discapacidad</CardTitle>
            <CardDescription>Distribución de beneficiarios por tipo de discapacidad.</CardDescription>
          </CardHeader>
          <CardContent>
            {beneficiariesByDisability?.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <BarChart data={beneficiariesByDisability} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="disabilityType" type="category" width={100} tick={{ fontSize: 12 }} tickFormatter={val => val.length > 12 ? `${val.substring(0, 12)}...` : val} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Beneficiarios" fill="#34D399" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState icon={<Users />} message="No hay datos de discapacidad" />}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}