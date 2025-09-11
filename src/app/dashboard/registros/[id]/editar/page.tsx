import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBeneficiaryById } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { EditForm } from '@/components/beneficiaries/EditForm';
import { ArrowLeft, FilePenLine, Info } from 'lucide-react';

interface PageProps {
  params: { id: string };
}

export default async function EditarRegistroPage({ params }: PageProps) {
  const { id } = params;
  const beneficiary = await getBeneficiaryById(id);

  if (!beneficiary) {
    notFound();
  }

  return (
    <main className="bg-muted/30 min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
            <Link href={`/dashboard/registros/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a los detalles
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="p-3 bg-primary/10 rounded-full w-fit">
                <FilePenLine className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Editar Beneficiario</h1>
                <p className="text-muted-foreground mt-2 text-base">
                  Estás modificando el registro de <span className="font-semibold text-primary">{beneficiary.fullName}</span>.
                </p>
              </div>
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg">
                <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Recuerda guardar los cambios cuando termines. Todos los campos pueden ser actualizados.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <EditForm beneficiary={beneficiary} />
          </div>
        </div>
      </div>
    </main>
  );
}