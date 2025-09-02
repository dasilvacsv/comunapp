'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components from shadcn/ui
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Icons from lucide-react
import { ArrowLeft, Save, AlertTriangle, Loader2, ChevronsUpDown, Check, UserPlus, UserCheck, FileText, Star } from 'lucide-react';

// Server Actions
import { createRequest, getBeneficiaries } from '@/lib/actions';

// Utilities (Asegúrate de tener este archivo o importa `clsx` y `tailwind-merge` directamente)
import { cn } from '@/lib/utils';

// --- Types & Constants ---

type Beneficiary = {
  id: string;
  fullName: string;
  disabilityType: string | null;
  // Añade más campos si los tienes para mostrar en la tarjeta de confirmación
  // ci: string | null; 
};

const priorityConfig = {
  Baja: { label: "Baja", color: "bg-green-500", icon: <Star className="h-4 w-4 text-green-500" /> },
  Media: { label: "Media", color: "bg-yellow-500", icon: <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> },
  Alta: { label: "Alta", color: "bg-orange-500", icon: <Star className="h-4 w-4 text-orange-500 fill-orange-500" /> },
  Urgente: { label: "Urgente", color: "bg-red-500", icon: <Star className="h-4 w-4 text-red-500 fill-red-500" /> },
};

const MAX_DESCRIPTION_LENGTH = 500;

// --- Main Component ---

export default function NuevaSolicitudPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Data state
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedBeneficiary = useMemo(
    () => beneficiaries.find((b) => b.id === selectedBeneficiaryId),
    [selectedBeneficiaryId, beneficiaries]
  );

  useEffect(() => {
    async function loadBeneficiaries() {
      try {
        const data = await getBeneficiaries();
        setBeneficiaries(data);
      } catch (err) {
        setError('No se pudieron cargar los beneficiarios. Refresca la página para intentarlo de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }
    loadBeneficiaries();
  }, []);

  type CreateRequestResult = { error?: string } | undefined;

  const handleFormSubmit = async (formData: FormData) => {
    setError(null);
    if (!selectedBeneficiaryId) {
      setError("Es obligatorio seleccionar un beneficiario.");
      return;
    }
    
    formData.set('beneficiaryId', selectedBeneficiaryId);
    // La descripción ya está en el FormData gracias al `name` del Textarea

    startTransition(async () => {
      const result = await createRequest(formData) as CreateRequestResult;
      if (result?.error) {
        setError(result.error);
      }
      // La redirección en caso de éxito se maneja en la server action.
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (beneficiaries.length === 0 && !isLoading) {
    return <NoBeneficiariesAlert />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-4 md:p-6"
    >
      <PageHeader />

      <form action={handleFormSubmit}>
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {error && <ErrorAlert message={error} />}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* --- Columna Izquierda: Selección de Beneficiario --- */}
              <div className="md:col-span-2 space-y-6">
                <StepTitle icon={<UserCheck />} title="Paso 1: Elige al Beneficiario" />
                <BeneficiarySelector
                  beneficiaries={beneficiaries}
                  selectedId={selectedBeneficiaryId}
                  onSelect={setSelectedBeneficiaryId}
                  isOpen={comboboxOpen}
                  onOpenChange={setComboboxOpen}
                  disabled={isPending}
                />
                <AnimatePresence>
                  {selectedBeneficiary && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SelectedBeneficiaryCard beneficiary={selectedBeneficiary} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* --- Columna Derecha: Detalles de la Solicitud --- */}
              <div className="md:col-span-3 space-y-6">
                 <StepTitle icon={<FileText />} title="Paso 2: Detalla la Petición" />
                <RequestDetails
                  description={description}
                  onDescriptionChange={setDescription}
                  disabled={isPending}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/50 px-8 py-4 border-t flex flex-col sm:flex-row-reverse gap-3">
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending || !selectedBeneficiaryId}>
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isPending ? 'Guardando...' : 'Crear Solicitud'}
            </Button>
            <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard/solicitudes">Cancelar</Link>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  );
}


// --- Sub-Componentes Internos para Mayor Claridad ---

const PageHeader = () => (
  <div className="flex items-center gap-4 mb-8">
    <Button variant="outline" size="icon" asChild>
      <Link href="/dashboard/solicitudes">
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Volver</span>
      </Link>
    </Button>
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Solicitud</h1>
      <p className="text-muted-foreground">Rellena el formulario para registrar una nueva petición de ayuda.</p>
    </div>
  </div>
);

const NoBeneficiariesAlert = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
    <Alert variant="default" className="max-w-lg border-yellow-400 bg-yellow-50 text-yellow-900">
      <AlertTriangle className="h-5 w-5 !text-yellow-600" />
      <AlertTitle className="font-bold">No hay beneficiarios registrados</AlertTitle>
      <AlertDescription className="mt-2">
        Para crear una solicitud, primero debes registrar a un beneficiario en el sistema.
        <Button asChild size="sm" className="mt-4 gap-2">
          <Link href="/dashboard/registros/nuevo">
            <UserPlus className="h-4 w-4" />
            Registrar Primer Beneficiario
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  </div>
);

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive" className="mb-6">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Error al procesar la solicitud</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const StepTitle = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">
            {icon}
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    </div>
);


const BeneficiarySelector = ({ beneficiaries, selectedId, onSelect, isOpen, onOpenChange, disabled }: any) => (
  <div className="space-y-2">
    <Label htmlFor="beneficiaryId">Beneficiario <span className="text-destructive">*</span></Label>
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between h-11 text-base font-normal"
          disabled={disabled}
        >
          {selectedId
            ? beneficiaries.find((b: any) => b.id === selectedId)?.fullName
            : "Selecciona o busca..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar por nombre..." />
          <CommandList>
            <CommandEmpty>No se encontró ningún beneficiario.</CommandEmpty>
            <CommandGroup>
              {beneficiaries.map((beneficiary: any) => (
                <CommandItem
                  key={beneficiary.id}
                  value={beneficiary.fullName}
                  onSelect={() => {
                    onSelect(beneficiary.id);
                    onOpenChange(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedId === beneficiary.id ? "opacity-100" : "opacity-0")}
                  />
                  <div>
                    <p>{beneficiary.fullName}</p>
                    {beneficiary.disabilityType && (
                      <p className="text-xs text-muted-foreground">{beneficiary.disabilityType}</p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
     <p className="text-sm text-muted-foreground">Elige la persona que recibirá la ayuda.</p>
  </div>
);

const SelectedBeneficiaryCard = ({ beneficiary }: { beneficiary: Beneficiary }) => (
    <Card className="bg-muted/50">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="h-5 w-5 text-primary"/>
                Beneficiario Confirmado
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
            <p className="font-semibold text-lg">{beneficiary.fullName}</p>
            {beneficiary.disabilityType && (
                <p className="text-sm text-muted-foreground">{beneficiary.disabilityType}</p>
            )}
        </CardContent>
    </Card>
);

const RequestDetails = ({ description, onDescriptionChange, disabled }: any) => (
    <div className="space-y-6">
        {/* Campo Descripción */}
        <div className="space-y-2">
            <Label htmlFor="description">
                Descripción de la Solicitud <span className="text-destructive">*</span>
            </Label>
            <Textarea
                id="description"
                name="description"
                rows={6}
                required
                maxLength={MAX_DESCRIPTION_LENGTH}
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Describe con detalle la ayuda que se necesita (ej: Silla de ruedas, medicamentos específicos, sesión de terapia, etc.)"
                className="text-base"
                disabled={disabled}
            />
            <div className="text-right text-sm text-muted-foreground">
                {description.length} / {MAX_DESCRIPTION_LENGTH}
            </div>
        </div>

        {/* Campo Prioridad */}
        <div className="space-y-2">
            <Label htmlFor="priority">
                Nivel de Prioridad <span className="text-destructive">*</span>
            </Label>
            <Select name="priority" defaultValue="Media" required disabled={disabled}>
                <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Selecciona una prioridad" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(priorityConfig).map(([key, { label, color }]) => (
                        <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-3">
                                <span className={cn("h-2.5 w-2.5 rounded-full", color)}></span>
                                <span>{label}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Indica la urgencia de esta solicitud.</p>
        </div>
    </div>
);