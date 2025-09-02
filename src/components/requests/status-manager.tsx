import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateRequestStatus } from '@/lib/actions';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';

interface StatusManagerProps {
  requestId: string;
  currentStatus: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Entregada';
}

export function StatusManager({ requestId, currentStatus }: StatusManagerProps) {
  // Pre-vincular las acciones con los datos necesarios
  const approveAction = updateRequestStatus.bind(null, requestId, 'Aprobada');
  const rejectAction = updateRequestStatus.bind(null, requestId, 'Rechazada');
  const deliverAction = updateRequestStatus.bind(null, requestId, 'Entregada');
  const reopenAction = updateRequestStatus.bind(null, requestId, 'Pendiente');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Estado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentStatus === 'Pendiente' && (
          <>
            <form action={approveAction}>
              <Button type="submit" className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" /> Aprobar
              </Button>
            </form>
            <form action={rejectAction}>
              <Button type="submit" variant="destructive" className="w-full">
                <XCircle className="h-4 w-4 mr-2" /> Rechazar
              </Button>
            </form>
          </>
        )}

        {currentStatus === 'Aprobada' && (
          <>
            <form action={deliverAction}>
              <Button type="submit" className="w-full">
                <Package className="h-4 w-4 mr-2" /> Marcar como Entregada
              </Button>
            </form>
            <form action={reopenAction}>
              <Button type="submit" variant="outline" className="w-full">
                <Clock className="h-4 w-4 mr-2" /> Volver a Pendiente
              </Button>
            </form>
          </>
        )}
        
        {currentStatus === 'Rechazada' && (
          <form action={reopenAction}>
            <Button type="submit" variant="outline" className="w-full">
              <Clock className="h-4 w-4 mr-2" /> Volver a Pendiente
            </Button>
          </form>
        )}

        {currentStatus === 'Entregada' && (
          <div className="text-center py-4 flex flex-col items-center gap-2 text-muted-foreground">
            <Package className="h-8 w-8 text-blue-500" />
            <p className="text-sm font-medium">Solicitud completada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}