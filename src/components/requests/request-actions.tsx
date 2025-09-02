'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface RequestActionsProps {
  deleteAction: () => Promise<void>;
}

export function RequestActions({ deleteAction }: RequestActionsProps) {
  return (
    <form
      action={async () => {
        if (confirm('¿Estás seguro de que quieres eliminar esta solicitud? Esta acción no se puede deshacer.')) {
          await deleteAction();
        }
      }}
    >
      <Button type="submit" variant="destructive">
        <Trash2 className="h-4 w-4 mr-2" />
        Eliminar Solicitud
      </Button>
    </form>
  );
}