'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { createBeneficiary } from '@/lib/actions';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from '@/components/ui/badge';

// Icons
import { ArrowLeft, Save, CalendarIcon, Loader2, User, Info, UserPlus, CheckCircle2 } from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';
import { format, differenceInYears } from "date-fns";
import { es } from 'date-fns/locale';


// --- 1. Esquema de Validación con Zod ---
const beneficiarySchema = z.object({
  fullName: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  birthDate: z.date().optional(),
  disabilityType: z.string().optional(),
  notes: z.string().max(500, { message: "Las notas no deben exceder los 500 caracteres." }).optional(),
});

type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>;


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function NuevoRegistroPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // --- 2. Configuración de React Hook Form ---
  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      fullName: "",
      birthDate: undefined,
      disabilityType: "",
      notes: "",
    },
    mode: "onChange", // Validar al cambiar el valor de un campo
  });

  const { isSubmitting, isValid } = form.formState;

  // --- 3. Manejador de Envío ---
  async function onSubmit(data: BeneficiaryFormValues) {
    setIsSuccess(false);
    setServerError(null);

    // Convertir los datos al formato que espera el Server Action (FormData)
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    if (data.birthDate) {
      formData.append('birthDate', data.birthDate.toISOString());
    }
    if (data.disabilityType) {
      formData.append('disabilityType', data.disabilityType);
    }
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    
    try {
      await createBeneficiary(formData);
      setIsSuccess(true);
      form.reset(); // Limpia el formulario
      
      // Ocultar el mensaje de éxito después de unos segundos
      setTimeout(() => setIsSuccess(false), 4000);

    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    }
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

        {/* Layout de dos columnas */}
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
                  Rellena este formulario para añadir una persona al sistema. La información precisa nos ayuda a ofrecer un mejor servicio.
                </p>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
                <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">El campo de **nombre completo** es el único obligatorio. El resto de la información es opcional pero muy recomendable.</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* --- SECCIÓN DATOS PERSONALES --- */}
                <Card className="shadow-sm overflow-hidden">
                  <CardHeader>
                    <CardTitle>Datos Personales</CardTitle>
                    <CardDescription>Información básica de identificación.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                             <div className="relative">
                               <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="Ej. Ana María García" className="pl-10" {...field} />
                             </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                          <FormLabel>Fecha de Nacimiento</FormLabel>
                           <div className="flex items-center gap-3">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: es })
                                      ) : (
                                        <span>Selecciona una fecha</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                    initialFocus
                                    // ✨ CORRECCIÓN APLICADA AQUÍ ✨
                                    captionLayout="dropdown"
                                    fromYear={1920}
                                    toYear={new Date().getFullYear()}
                                  />
                                </PopoverContent>
                              </Popover>
                              {field.value && (
                                <Badge variant="secondary" className="whitespace-nowrap font-semibold">
                                  {differenceInYears(new Date(), field.value)} años
                                </Badge>
                              )}
                           </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* --- SECCIÓN DETALLES ADICIONALES --- */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Detalles Adicionales</CardTitle>
                    <CardDescription>Información complementaria y notas.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="disabilityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Discapacidad</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo (opcional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Discapacidad Motora">Discapacidad Motora</SelectItem>
                                <SelectItem value="Discapacidad Visual">Discapacidad Visual</SelectItem>
                                <SelectItem value="Discapacidad Auditiva">Discapacidad Auditiva</SelectItem>
                                <SelectItem value="Discapacidad Intelectual">Discapacidad Intelectual</SelectItem>
                                <SelectItem value="Discapacidad Psicosocial">Discapacidad Psicosocial</SelectItem>
                                <SelectItem value="Discapacidad Múltiple">Discapacidad Múltiple</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Este campo ayuda a categorizar el registro.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Añade información relevante: contacto, historial, necesidades específicas..."
                              className="resize-y min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* --- MENSAJE DE ÉXITO --- */}
                {isSuccess && (
                  <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 p-4 rounded-lg border border-green-200">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-semibold">¡Registro guardado con éxito!</p>
                  </div>
                )}
                
                {/* --- BOTONES DE ACCIÓN --- */}
                <div className="flex items-center justify-end gap-4">
                  <Button type="button" variant="ghost" asChild>
                    <Link href="/dashboard/registros">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={!isValid || isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
                    ) : (
                      <><Save className="h-4 w-4 mr-2" /> Guardar Registro</>
                    )}
                  </Button>
                </div>

              </form>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
}