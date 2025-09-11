import { notFound } from 'next/navigation';
import { getRequestById, deleteRequest } from '@/lib/actions';
import { SolicitudDetailClient } from './solicitud-client';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SolicitudDetailPage({ params }: PageProps) {
  const { id } = params;

  const request = await getRequestById(id);

  if (!request) {
    notFound();
  }

  const deleteRequestWithId = deleteRequest.bind(null, id);

  return (
    <SolicitudDetailClient
      request={request}
      deleteAction={deleteRequestWithId}
    />
  );
}