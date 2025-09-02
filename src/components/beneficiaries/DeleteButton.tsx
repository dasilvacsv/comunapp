// components/beneficiaries/DeleteButton.tsx

'use client'; // <-- Esto lo convierte en un Componente de Cliente

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteBeneficiary } from '@/lib/actions';

// Definimos las props que el componente recibirá
interface DeleteButtonProps {
  id: string;
  fullName: string;
}

export function DeleteButton({ id, fullName }: DeleteButtonProps) {
  // La acción del formulario se pasa como una función que se ejecutará en el servidor
  const deleteAction = deleteBeneficiary.bind(null, id);

  return (
    <form action={deleteAction}>
      <Button
        type="submit"
        variant="outline"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        // Este onClick ahora es válido porque estamos en un Componente de Cliente
        onClick={(e) => {
          if (!confirm(`¿Estás seguro de que quieres eliminar el registro de ${fullName}?`)) {
            e.preventDefault(); // Cancela el envío del formulario si el usuario dice "No"
          }
        }}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Eliminar
      </Button>
    </form>
  );
}