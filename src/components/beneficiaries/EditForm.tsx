// components/beneficiaries/EditForm.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateBeneficiary } from '@/lib/actions'; // Asegúrate de tener esta server action


// --- UI Components ---
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from '@/components/ui/badge';

// --- Icons ---
import { Save, CalendarIcon, Loader2, User, CheckCircle2, X, AlertTriangle } from 'lucide-react';

// --- Utils ---
import { cn } from '@/lib/utils';
import { format, differenceInYears } from "date-fns";
import { es } from 'date-fns/locale';

// --- 1. Esquema de Validación con Zod ---
const beneficiarySchema = z.object({
  fullName: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  birthDate: z.date().optional().nullable(),
  disabilityType: z.string().optional().nullable(),
  notes: z.string().max(500, "Las notas no deben exceder los 500 caracteres.").optional().nullable(),
});

type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>;

// --- 2. Propiedades del Componente ---
interface EditFormProps {
  beneficiary: Beneficiary;
}

// --- 3. Componente Principal del Formulario ---
export function EditForm({ beneficiary }: EditFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      fullName: beneficiary.fullName,
      // Parsea la fecha de forma segura para evitar problemas de zona horaria
      birthDate: beneficiary.birthDate ? new Date(`${beneficiary.birthDate}T00:00:00`) : undefined,
      disabilityType: beneficiary.disabilityType,
      notes: beneficiary.notes,
    },
    mode: 'onChange',
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(data: BeneficiaryFormValues) {
    setIsSuccess(false);
    setServerError(null);
    
    // Transforma el valor 'ninguno' a null antes de enviar
    const processedData = {
      ...data,
      disabilityType: data.disabilityType === 'ninguno' ? null : data.disabilityType,
    };
    
    try {
      await updateBeneficiary(beneficiary.id, processedData);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Error al actualizar el registro.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* --- Tarjeta de Datos Personales --- */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Datos Personales</CardTitle>
            <CardDescription>Información básica de identificación del beneficiario.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Escribe el nombre completo" className="pl-10" {...field} />
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
                <FormItem>
                  <FormLabel>Fecha de Nacimiento</FormLabel>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          captionLayout="dropdown"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    {field.value && (
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => field.onChange(null)} aria-label="Limpiar fecha">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {field.value && <FormDescription>Edad calculada: {differenceInYears(new Date(), field.value)} años.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* --- Tarjeta de Detalles Adicionales --- */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Detalles Adicionales</CardTitle>
            <CardDescription>Información complementaria y notas relevantes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="disabilityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Discapacidad</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? "ninguno"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ninguno">Ninguno</SelectItem>
                      <SelectItem value="Discapacidad Motora">Discapacidad Motora</SelectItem>
                      <SelectItem value="Discapacidad Visual">Discapacidad Visual</SelectItem>
                      <SelectItem value="Discapacidad Auditiva">Discapacidad Auditiva</SelectItem>
                      <SelectItem value="Discapacidad Intelectual">Discapacidad Intelectual</SelectItem>
                      <SelectItem value="Discapacidad Psicosocial">Discapacidad Psicosocial</SelectItem>
                      <SelectItem value="Discapacidad Múltiple">Discapacidad Múltiple</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Textarea placeholder="Añade información relevante: contacto, historial, etc." className="resize-y min-h-[100px]" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* --- Mensajes y Botones de Acción --- */}
        <div className="space-y-4">
            {isSuccess && (
                <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-semibold">¡Cambios guardados con éxito!</p>
                </div>
            )}
            {serverError && (
                <div className="flex items-center gap-3 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <p>{serverError}</p>
                </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" asChild>
                    <a href={`/dashboard/registros/${beneficiary.id}`}>Cancelar</a>
                </Button>
                <Button type="submit" disabled={!isValid || isSubmitting}>
                    {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Actualizando...</>
                    ) : (
                        <><Save className="h-4 w-4 mr-2" /> Guardar Cambios</>
                    )}
                </Button>
            </div>
        </div>
      </form>
    </Form>
  );
}