import { notFound } from 'next/navigation';
import { getRequestById, deleteRequest } from '@/lib/actions';
import { SolicitudDetailClient } from './solicitud-client'; // Importamos el nuevo componente de cliente

interface PageProps {
  params: {
    id: string;
  };
}

// Este es un Componente de Servidor, por lo tanto puede ser async
export default async function SolicitudDetailPage({ params }: PageProps) {
  const { id } = params;

  // 1. Obtenemos los datos en el servidor
  const request = await getRequestById(id);

  if (!request) {
    notFound();
  }

  // 2. Preparamos las acciones del servidor que se pasarán al cliente
  const deleteRequestWithId = deleteRequest.bind(null, id);

  // 3. Renderizamos el Componente de Cliente y le pasamos los datos y acciones como props
  return (
    <SolicitudDetailClient
      request={request}
      deleteAction={deleteRequestWithId}
    />
  );
}