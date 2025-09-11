'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { createAdultoMayor, createPersonaConDiscapacidad, getRepresentantes, createRepresentante } from '@/lib/actions';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from '@/components/ui/label';

// Icons
import { ArrowLeft, Save, CalendarIcon, Loader2, User, Info, UserPlus, CheckCircle2, Users, Accessibility, ChevronsUpDown, Check } from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';
import { format, differenceInYears } from "date-fns";
import { es } from 'date-fns/locale';

// --- Esquemas de Validación (Sin cambios) ---
const adultoMayorSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  apellido: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
  fechaNacimiento: z.date().optional(),
  etniaAborigen: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  correoElectronico: z.string().email({ message: "Correo electrónico inválido." }).optional().or(z.literal("")),
  estadoCivil: z.enum(["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"]).optional(),
  descripcionSalud: z.string().max(500, { message: "La descripción no debe exceder los 500 caracteres." }).optional(),
});

const personaDiscapacidadSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  apellido: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
  fechaNacimiento: z.date().optional(),
  etniaAborigen: z.string().optional(),
  tipoDiscapacidad: z.string().optional(),
  gradoDiscapacidad: z.string().optional(),
  certificacionMedica: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  correoElectronico: z.string().email({ message: "Correo electrónico inválido." }).optional().or(z.literal("")),
  estadoCivil: z.enum(["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"]).optional(),
  representanteId: z.string().optional(),
});

type AdultoMayorFormValues = z.infer<typeof adultoMayorSchema>;
type PersonaDiscapacidadFormValues = z.infer<typeof personaDiscapacidadSchema>;

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default function NuevoRegistroPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [beneficiaryType, setBeneficiaryType] = useState<'adulto_mayor' | 'persona_discapacidad'>('adulto_mayor');
  const [representantes, setRepresentantes] = useState<any[]>([]);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRepData, setNewRepData] = useState({ nombre: '', apellido: '', telefono: '' });
  const [isCreatingRep, setIsCreatingRep] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  // Cargar representantes al montar el componente
  useEffect(() => {
    const loadRepresentantes = async () => {
      try {
        const data = await getRepresentantes();
        setRepresentantes(data);
      } catch (error) {
        console.error('Error loading representantes:', error);
      }
    };
    loadRepresentantes();
  }, []);

  // --- Configuraciones de Forms ---
  const adultoMayorForm = useForm<AdultoMayorFormValues>({
    resolver: zodResolver(adultoMayorSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      fechaNacimiento: undefined,
      etniaAborigen: "",
      direccion: "",
      telefono: "",
      correoElectronico: "",
      estadoCivil: undefined,
      descripcionSalud: "",
    },
    mode: "onChange",
  });
  const personaDiscapacidadForm = useForm<PersonaDiscapacidadFormValues>({
    resolver: zodResolver(personaDiscapacidadSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      fechaNacimiento: undefined,
      etniaAborigen: "",
      tipoDiscapacidad: "",
      gradoDiscapacidad: "",
      certificacionMedica: "",
      direccion: "",
      telefono: "",
      correoElectronico: "",
      estadoCivil: undefined,
      representanteId: "",
    },
    mode: "onChange",
  });

  const currentForm = beneficiaryType === 'adulto_mayor' ? adultoMayorForm : personaDiscapacidadForm;
  const { isSubmitting, isValid } = currentForm.formState;

  // --- Handlers de Submit (modificados para no resetear el form) ---
  async function onSubmitAdultoMayor(data: AdultoMayorFormValues) {
    setIsSuccess(false);
    setServerError(null);
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('apellido', data.apellido);
    if (data.fechaNacimiento) formData.append('fechaNacimiento', data.fechaNacimiento.toISOString().split('T')[0]);
    if (data.etniaAborigen) formData.append('etniaAborigen', data.etniaAborigen);
    if (data.direccion) formData.append('direccion', data.direccion);
    if (data.telefono) formData.append('telefono', data.telefono);
    if (data.correoElectronico) formData.append('correoElectronico', data.correoElectronico);
    if (data.estadoCivil) formData.append('estadoCivil', data.estadoCivil);
    if (data.descripcionSalud) formData.append('descripcionSalud', data.descripcionSalud);

    try {
      await createAdultoMayor(formData);
      setIsSuccess(true); // Solo activa la pantalla de éxito
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    }
  }

  async function onSubmitPersonaDiscapacidad(data: PersonaDiscapacidadFormValues) {
    setIsSuccess(false);
    setServerError(null);
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('apellido', data.apellido);
    if (data.fechaNacimiento) formData.append('fechaNacimiento', data.fechaNacimiento.toISOString().split('T')[0]);
    if (data.etniaAborigen) formData.append('etniaAborigen', data.etniaAborigen);
    if (data.tipoDiscapacidad) formData.append('tipoDiscapacidad', data.tipoDiscapacidad);
    if (data.gradoDiscapacidad) formData.append('gradoDiscapacidad', data.gradoDiscapacidad);
    if (data.certificacionMedica) formData.append('certificacionMedica', data.certificacionMedica);
    if (data.direccion) formData.append('direccion', data.direccion);
    if (data.telefono) formData.append('telefono', data.telefono);
    if (data.correoElectronico) formData.append('correoElectronico', data.correoElectronico);
    if (data.estadoCivil) formData.append('estadoCivil', data.estadoCivil);
    if (data.representanteId) formData.append('representanteId', data.representanteId);
    
    try {
      await createPersonaConDiscapacidad(formData);
      setIsSuccess(true); // Solo activa la pantalla de éxito
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    }
  }

  // --- Handlers de creación de representante (sin cambios) ---
  async function handleCreateRepresentante() {
    setIsCreatingRep(true);
    setCreationError(null);

    if (!newRepData.nombre.trim() || !newRepData.apellido.trim()) {
      setCreationError("Nombre y apellido son obligatorios.");
      setIsCreatingRep(false);
      return;
    }

    const formData = new FormData();
    formData.append('nombre', newRepData.nombre);
    formData.append('apellido', newRepData.apellido);
    if (newRepData.telefono) formData.append('telefono', newRepData.telefono);

    try {
      const newRep = await createRepresentante(formData);
      setRepresentantes(prev => [newRep, ...prev]);
      personaDiscapacidadForm.setValue('representanteId', newRep.id, { shouldValidate: true });
      setDialogOpen(false);
      setComboboxOpen(false);
      setNewRepData({ nombre: '', apellido: '', telefono: '' });
    } catch (error) {
      console.error("Fallo al crear representante:", error);
      setCreationError(error instanceof Error ? error.message : "Error desconocido al crear.");
    } finally {
      setIsCreatingRep(false);
    }
  }
  
  // --- AÑADIDO: Función para resetear el estado y registrar a alguien más ---
  function handleCreateAnother() {
    setIsSuccess(false);
    setServerError(null);
    adultoMayorForm.reset();
    personaDiscapacidadForm.reset();
    setBeneficiaryType('adulto_mayor'); // Vuelve al tipo por defecto
  }

  return (
    <main className="bg-muted/30 min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
            <Link href="/dashboard/registros">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Columna Izquierda: Guía */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="p-3 bg-primary/10 rounded-full w-fit">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Nuevo Beneficiario</h1>
                <p className="text-muted-foreground mt-2 text-base">
                  Rellena este formulario para añadir una persona al sistema. Elige el tipo de beneficiario y completa la información correspondiente.
                </p>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
                <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Los campos de nombre y apellido son obligatorios. El resto de la información es opcional pero muy recomendable para un mejor seguimiento.</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Contenido condicional (Formulario o Pantalla de Éxito) */}
          <div className="lg:col-span-2">
            {isSuccess ? (
              // --- PANTALLA DE ÉXITO ---
              <Card className="shadow-sm flex flex-col items-center justify-center text-center p-8 min-h-[500px]">
                <CardContent className="flex flex-col items-center">
                    <CheckCircle2 className="h-20 w-20 text-green-500 mb-4" />
                    <CardTitle className="text-2xl mb-2">¡Registro Exitoso!</CardTitle>
                    <CardDescription className="mb-8 max-w-sm">
                      El nuevo beneficiario ha sido guardado en el sistema correctamente.
                    </CardDescription>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button onClick={handleCreateAnother}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Registrar Otro Beneficiario
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/dashboard/registros">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Volver a la lista
                        </Link>
                      </Button>
                    </div>
                </CardContent>
              </Card>
            ) : (
              // --- FORMULARIO (Código existente) ---
              <Card className="shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle>Tipo de Beneficiario</CardTitle>
                  <CardDescription>Selecciona el tipo de registro que deseas crear.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={beneficiaryType}
                    onValueChange={(value: 'adulto_mayor' | 'persona_discapacidad') => setBeneficiaryType(value)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50">
                      <RadioGroupItem value="adulto_mayor" id="adulto_mayor" />
                      <label htmlFor="adulto_mayor" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Adulto Mayor</div>
                          <div className="text-sm text-muted-foreground">Persona de la tercera edad</div>
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50">
                      <RadioGroupItem value="persona_discapacidad" id="persona_discapacidad" />
                      <label htmlFor="persona_discapacidad" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Accessibility className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Persona con Discapacidad</div>
                          <div className="text-sm text-muted-foreground">Persona con algún tipo de discapacidad</div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  {/* Formulario para Adulto Mayor */}
                  {beneficiaryType === 'adulto_mayor' && (
                    <Form {...adultoMayorForm}>
                      <form onSubmit={adultoMayorForm.handleSubmit(onSubmitAdultoMayor)} className="space-y-8">
                        {/* Datos Personales */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Datos Personales</CardTitle>
                            <CardDescription>Información básica del adulto mayor.</CardDescription>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={adultoMayorForm.control} name="nombre" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre *</FormLabel>
                                    <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Ej. María" className="pl-10" {...field} />
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={adultoMayorForm.control} name="apellido" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apellido *</FormLabel>
                                    <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Ej. García" className="pl-10" {...field} />
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={adultoMayorForm.control} name="fechaNacimiento" render={({ field }) => (
                                <FormItem className="flex flex-col pt-2">
                                    <FormLabel>Fecha de Nacimiento</FormLabel>
                                    <div className="flex items-center gap-3">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Selecciona una fecha</span>)}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus captionLayout="dropdown" fromYear={1920} toYear={new Date().getFullYear()}/>
                                        </PopoverContent>
                                    </Popover>
                                    {field.value && (<Badge variant="secondary" className="whitespace-nowrap font-semibold">{differenceInYears(new Date(), field.value)} años</Badge>)}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={adultoMayorForm.control} name="estadoCivil" render={({ field }) => (
                                <FormItem className="pt-2">
                                    <FormLabel>Estado Civil</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Selecciona el estado civil" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                                        <SelectItem value="Casado/a">Casado/a</SelectItem>
                                        <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                                        <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={adultoMayorForm.control} name="etniaAborigen" render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Etnia Aborigen</FormLabel>
                                    <FormControl><Input placeholder="Ej. Wayuu, Pemón, etc." {...field} /></FormControl>
                                    <FormDescription>Especifica si pertenece a alguna etnia indígena.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                          </CardContent>
                        </Card>
                        {/* Información de Contacto */}
                        <Card>
                          <CardHeader><CardTitle>Información de Contacto</CardTitle><CardDescription>Datos de contacto y ubicación.</CardDescription></CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={adultoMayorForm.control} name="telefono" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl><Input placeholder="Ej. 0414-1234567" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={adultoMayorForm.control} name="correoElectronico" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl><Input placeholder="ejemplo@correo.com" type="email" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={adultoMayorForm.control} name="direccion" render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl><Textarea placeholder="Dirección completa del domicilio" className="resize-y min-h-[60px]" {...field}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                          </CardContent>
                        </Card>
                         {/* Información de Salud */}
                        <Card>
                          <CardHeader><CardTitle>Información de Salud</CardTitle><CardDescription>Detalles relevantes sobre la salud del adulto mayor.</CardDescription></CardHeader>
                          <CardContent>
                            <FormField control={adultoMayorForm.control} name="descripcionSalud" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción de Salud</FormLabel>
                                    <FormControl><Textarea placeholder="Describe condiciones médicas, medicamentos, alergias, etc." className="resize-y min-h-[100px]" {...field}/></FormControl>
                                    <FormDescription>Incluye información relevante sobre medicamentos, condiciones médicas, alergias, etc.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                          </CardContent>
                        </Card>

                        {serverError && (
                          <div className="flex items-center gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                            <p className="font-semibold">{serverError}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-4">
                          <Button type="button" variant="ghost" asChild>
                            <Link href="/dashboard/registros">Cancelar</Link>
                          </Button>
                          <Button type="submit" disabled={!isValid || isSubmitting}>
                            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4 mr-2" /> Guardar Registro</>}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}

                  {/* Formulario para Persona con Discapacidad */}
                  {beneficiaryType === 'persona_discapacidad' && (
                       <Form {...personaDiscapacidadForm}>
                         <form onSubmit={personaDiscapacidadForm.handleSubmit(onSubmitPersonaDiscapacidad)} className="space-y-8">
                            <Card>
                                <CardHeader><CardTitle>Datos Personales</CardTitle><CardDescription>Información básica de la persona con discapacidad.</CardDescription></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={personaDiscapacidadForm.control} name="nombre" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre *</FormLabel>
                                            <FormControl><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Ej. Carlos" className="pl-10" {...field} /></div></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={personaDiscapacidadForm.control} name="apellido" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Apellido *</FormLabel>
                                            <FormControl><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Ej. Rodríguez" className="pl-10" {...field} /></div></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={personaDiscapacidadForm.control} name="fechaNacimiento" render={({ field }) => (
                                        <FormItem className="flex flex-col pt-2">
                                            <FormLabel>Fecha de Nacimiento</FormLabel>
                                            <div className="flex items-center gap-3">
                                            <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Selecciona una fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus captionLayout="dropdown" fromYear={1920} toYear={new Date().getFullYear()}/></PopoverContent></Popover>
                                            {field.value && (<Badge variant="secondary" className="whitespace-nowrap font-semibold">{differenceInYears(new Date(), field.value)} años</Badge>)}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={personaDiscapacidadForm.control} name="estadoCivil" render={({ field }) => (
                                        <FormItem className="pt-2">
                                            <FormLabel>Estado Civil</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona el estado civil" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Soltero/a">Soltero/a</SelectItem><SelectItem value="Casado/a">Casado/a</SelectItem><SelectItem value="Divorciado/a">Divorciado/a</SelectItem><SelectItem value="Viudo/a">Viudo/a</SelectItem></SelectContent></Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={personaDiscapacidadForm.control} name="etniaAborigen" render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Etnia Aborigen</FormLabel>
                                            <FormControl><Input placeholder="Ej. Wayuu, Pemón, etc." {...field} /></FormControl>
                                            <FormDescription>Especifica si pertenece a alguna etnia indígena.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Información de Discapacidad</CardTitle><CardDescription>Detalles específicos sobre la discapacidad.</CardDescription></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={personaDiscapacidadForm.control} name="tipoDiscapacidad" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Discapacidad</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Discapacidad Motora">Discapacidad Motora</SelectItem><SelectItem value="Discapacidad Visual">Discapacidad Visual</SelectItem><SelectItem value="Discapacidad Auditiva">Discapacidad Auditiva</SelectItem><SelectItem value="Discapacidad Intelectual">Discapacidad Intelectual</SelectItem><SelectItem value="Discapacidad Psicosocial">Discapacidad Psicosocial</SelectItem><SelectItem value="Discapacidad Múltiple">Discapacidad Múltiple</SelectItem><SelectItem value="Otro">Otro</SelectItem></SelectContent></Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={personaDiscapacidadForm.control} name="gradoDiscapacidad" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Grado de Discapacidad</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona el grado" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Leve">Leve</SelectItem><SelectItem value="Moderado">Moderado</SelectItem><SelectItem value="Severo">Severo</SelectItem><SelectItem value="Profundo">Profundo</SelectItem></SelectContent></Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={personaDiscapacidadForm.control} name="certificacionMedica" render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Certificación Médica</FormLabel>
                                            <FormControl><Textarea placeholder="Detalles de la certificación médica, número de documento, institución emisora, etc." className="resize-y min-h-[80px]" {...field}/></FormControl>
                                            <FormDescription>Información sobre certificados médicos que respalden la condición de discapacidad.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Información de Contacto</CardTitle><CardDescription>Datos de contacto y ubicación.</CardDescription></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={personaDiscapacidadForm.control} name="telefono" render={({ field }) => (
                                        <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Ej. 0414-1234567" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={personaDiscapacidadForm.control} name="correoElectronico" render={({ field }) => (
                                        <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input placeholder="ejemplo@correo.com" type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={personaDiscapacidadForm.control} name="direccion" render={({ field }) => (
                                        <FormItem className="md:col-span-2"><FormLabel>Dirección</FormLabel><FormControl><Textarea placeholder="Dirección completa del domicilio" className="resize-y min-h-[60px]" {...field}/></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </CardContent>
                            </Card>
                            <Card>
                                 <CardHeader><CardTitle>Representante Legal</CardTitle><CardDescription>Busca un representante existente o crea uno nuevo si no está en la lista.</CardDescription></CardHeader>
                                 <CardContent>
                                    <FormField control={personaDiscapacidadForm.control} name="representanteId" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Representante</FormLabel>
                                            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}>{field.value ? representantes.find((rep) => rep.id === field.value)?.nombre + ' ' + representantes.find((rep) => rep.id === field.value)?.apellido : "Selecciona o crea un representante"}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Buscar representante..." /><CommandList><CommandEmpty><div className="py-4 text-center text-sm"><p className="mb-2">No se encontró el representante.</p><Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button size="sm" variant="outline" onSelect={(e) => e.preventDefault()}><UserPlus className="mr-2 h-4 w-4" />Crear Nuevo</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nuevo Representante</DialogTitle><DialogDescription>Añade los datos del nuevo representante. Se asignará automáticamente.</DialogDescription></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="rep-nombre">Nombre *</Label><Input id="rep-nombre" value={newRepData.nombre} onChange={(e) => setNewRepData(prev => ({ ...prev, nombre: e.target.value }))} placeholder="Ej. José"/></div><div className="space-y-2"><Label htmlFor="rep-apellido">Apellido *</Label><Input id="rep-apellido" value={newRepData.apellido} onChange={(e) => setNewRepData(prev => ({ ...prev, apellido: e.target.value }))} placeholder="Ej. Pérez" /></div><div className="space-y-2"><Label htmlFor="rep-telefono">Teléfono (Opcional)</Label><Input id="rep-telefono" value={newRepData.telefono} onChange={(e) => setNewRepData(prev => ({ ...prev, telefono: e.target.value }))} placeholder="Ej. 0412-1234567" /></div>{creationError && <p className="text-sm font-medium text-destructive">{creationError}</p>}</div><DialogFooter><Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleCreateRepresentante} disabled={isCreatingRep}>{isCreatingRep ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>) : "Guardar"}</Button></DialogFooter></DialogContent></Dialog></div></CommandEmpty><CommandGroup>{representantes.map((rep) => (<CommandItem key={rep.id} value={`${rep.nombre} ${rep.apellido}`} onSelect={() => {personaDiscapacidadForm.setValue("representanteId", rep.id);setComboboxOpen(false);}}><Check className={cn("mr-2 h-4 w-4", field.value === rep.id ? "opacity-100" : "opacity-0")} />{rep.nombre} {rep.apellido}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent></Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                 </CardContent>
                            </Card>
                           
                           {serverError && (
                               <div className="flex items-center gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                                 <p className="font-semibold">{serverError}</p>
                               </div>
                           )}

                           <div className="flex items-center justify-end gap-4">
                               <Button type="button" variant="ghost" asChild><Link href="/dashboard/registros">Cancelar</Link></Button>
                               <Button type="submit" disabled={!isValid || isSubmitting}>{isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4 mr-2" /> Guardar Registro</>}</Button>
                           </div>
                         </form>
                       </Form>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}