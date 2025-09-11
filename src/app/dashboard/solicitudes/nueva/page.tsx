'use client';

import { useState, useEffect, useTransition, useMemo, FC } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
    ArrowLeft,
    Save,
    AlertTriangle,
    Loader2,
    ChevronsUpDown,
    Check,
    UserPlus,
    UserCheck,
    FileText,
    HeartHandshake,
    Accessibility,
} from 'lucide-react';
import { createRequest, getBeneficiaries } from '@/lib/actions';
import { cn } from '@/lib/utils';

// --- TIPOS Y CONFIGURACIÓN ---

// MODIFICADO: Tipo actualizado para coincidir con la data de `getBeneficiaries`
type Beneficiary = {
    id: string;
    fullName: string;
    type: 'adulto_mayor' | 'persona_discapacidad';
    disabilityType: string | null;
};

type Priority = 'Baja' | 'Media' | 'Alta' | 'Urgente';

const priorityConfig: Record<Priority, { label: string; color: string; }> = {
    Baja: { label: "Baja", color: "bg-green-500" },
    Media: { label: "Media", color: "bg-yellow-500" },
    Alta: { label: "Alta", color: "bg-orange-500" },
    Urgente: { label: "Urgente", color: "bg-red-500" },
};

const MAX_DESCRIPTION_LENGTH = 500;

// --- COMPONENTE PRINCIPAL ---

export default function NuevaSolicitudPage() {
    const [isPending, startTransition] = useTransition();
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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

    const handleFormSubmit = async (formData: FormData) => {
        setError(null);

        if (!selectedBeneficiaryId) {
            setError("Es obligatorio seleccionar un beneficiario.");
            return;
        }

        formData.set('beneficiaryId', selectedBeneficiaryId);

        startTransition(async () => {
            const result = await createRequest(formData) as { error?: string } | undefined;
            if (result?.error) {
                setError(result.error);
            }
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
            className="max-w-4xl mx-auto p-4 md:p-6"
        >
            <PageHeader />

            <form action={handleFormSubmit}>
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Formulario de Creación de Solicitud</CardTitle>
                        <CardDescription>Sigue los pasos para registrar una nueva petición de ayuda.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-8">
                        {error && <ErrorAlert message={error} />}

                        {/* --- PASO 1: SELECCIÓN DE BENEFICIARIO --- */}
                        <div className="space-y-4">
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
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <SelectedBeneficiaryCard beneficiary={selectedBeneficiary} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* --- PASO 2: DETALLES DE LA SOLICITUD --- */}
                        <div className="space-y-4">
                            <StepTitle icon={<FileText />} title="Paso 2: Detalla la Petición" />
                            <RequestDetails
                                description={description}
                                onDescriptionChange={setDescription}
                                disabled={isPending}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 px-8 py-4 border-t flex flex-col sm:flex-row-reverse gap-3">
                        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending || !selectedBeneficiaryId || !description}>
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

// --- SUBCOMPONENTES ---

const PageHeader: FC = () => (
    <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/solicitudes">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
            </Link>
        </Button>
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Crear Nueva Solicitud</h1>
            <p className="text-muted-foreground">Rellena el formulario para registrar una nueva petición de ayuda.</p>
        </div>
    </div>
);

const NoBeneficiariesAlert: FC = () => (
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

const ErrorAlert: FC<{ message: string }> = ({ message }) => (
    <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al procesar la solicitud</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
    </Alert>
);

const StepTitle: FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-3 pb-2 border-b">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">
            {icon}
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    </div>
);

// NUEVO: Componente visual para la etiqueta de tipo de beneficiario
const BeneficiaryTypeBadge: FC<{ type: Beneficiary['type'] }> = ({ type }) => {
    const isAdultoMayor = type === 'adulto_mayor';
    const Icon = isAdultoMayor ? HeartHandshake : Accessibility;
    const text = isAdultoMayor ? 'Adulto Mayor' : 'P. con Discapacidad';
    const className = isAdultoMayor
        ? 'bg-blue-100 text-blue-800'
        : 'bg-green-100 text-green-800';

    return (
        <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", className)}>
            <Icon className="h-3.5 w-3.5" />
            {text}
        </div>
    );
};

// MODIFICADO: Selector con mejor UI y tipos estrictos
interface BeneficiarySelectorProps {
    beneficiaries: Beneficiary[];
    selectedId: string;
    onSelect: (id: string) => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    disabled?: boolean;
}

const BeneficiarySelector: FC<BeneficiarySelectorProps> = ({ beneficiaries, selectedId, onSelect, isOpen, onOpenChange, disabled }) => (
    <div className="space-y-2">
        <Label htmlFor="beneficiaryId">Beneficiario <span className="text-destructive">*</span></Label>
        <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={isOpen} className="w-full justify-between h-11 text-base font-normal" disabled={disabled}>
                    {selectedId ? beneficiaries.find(b => b.id === selectedId)?.fullName : "Selecciona o busca un beneficiario..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Buscar por nombre..." />
                    <CommandList>
                        <CommandEmpty>No se encontró ningún beneficiario.</CommandEmpty>
                        <CommandGroup>
                            {beneficiaries.map((beneficiary) => (
                                <CommandItem
                                    key={beneficiary.id}
                                    value={beneficiary.fullName}
                                    onSelect={() => {
                                        onSelect(beneficiary.id);
                                        onOpenChange(false);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", selectedId === beneficiary.id ? "opacity-100" : "opacity-0")} />
                                    <div className="flex-1 flex items-center justify-between">
                                        <div>
                                            <p>{beneficiary.fullName}</p>
                                            {beneficiary.disabilityType && (
                                                <p className="text-xs text-muted-foreground">{beneficiary.disabilityType}</p>
                                            )}
                                        </div>
                                        {/* NUEVO: Badge visual para el tipo */}
                                        <BeneficiaryTypeBadge type={beneficiary.type} />
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    </div>
);

// MODIFICADO: Tarjeta de confirmación con más detalles
const SelectedBeneficiaryCard: FC<{ beneficiary: Beneficiary }> = ({ beneficiary }) => (
    <Card className="bg-muted/50 border-dashed">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base text-green-700">
                <UserCheck className="h-5 w-5" />
                Beneficiario Seleccionado
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="font-semibold text-lg">{beneficiary.fullName}</p>
            {/* NUEVO: Mostrar el tipo de beneficiario */}
            <div className="mt-2">
                <BeneficiaryTypeBadge type={beneficiary.type} />
            </div>
        </CardContent>
    </Card>
);

interface RequestDetailsProps {
    description: string;
    onDescriptionChange: (value: string) => void;
    disabled?: boolean;
}

const RequestDetails: FC<RequestDetailsProps> = ({ description, onDescriptionChange, disabled }) => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="description">Descripción de la Solicitud <span className="text-destructive">*</span></Label>
            <Textarea
                id="description" name="description" rows={6} required
                maxLength={MAX_DESCRIPTION_LENGTH} value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Describe con detalle la ayuda que se necesita (ej: Silla de ruedas, medicamentos específicos, sesión de terapia, etc.)"
                className="text-base" disabled={disabled}
            />
            <p className="text-right text-sm text-muted-foreground">
                {description.length} / {MAX_DESCRIPTION_LENGTH}
            </p>
        </div>
        <div className="space-y-2">
            <Label htmlFor="priority">Nivel de Prioridad <span className="text-destructive">*</span></Label>
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
        </div>
    </div>
);