'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Lock, Save, CheckCircle, AlertCircle, Key, Shield, MapPin, Users2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateUserProfile } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db';
import { usuarios, consejosComunales } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Esquema de validación para el formulario
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las nuevas contraseñas no coinciden',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

// Componente para una línea divisoria estilizada
const Divider = () => <hr className="my-10 border-gray-200" />;

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Cargar detalles del usuario y consejo comunal
  useEffect(() => {
    const loadUserDetails = async () => {
      if (session?.user?.id) {
        try {
          // Aquí simularemos la carga de datos del usuario
          // En un caso real, harías una consulta a la base de datos
          setUserDetails({
            nombreUsuario: session.user.name,
            rol: session.user.role || 'Admin',
            consejoComunal: 'Valle Verde I', // Por defecto
            fechaRegistro: new Date(), // Fecha actual como ejemplo
          });
        } catch (error) {
          console.error('Error loading user details:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (status !== 'loading') {
      loadUserDetails();
    }
  }, [session, status]);

  const onSubmit = async (data: PasswordFormData) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (status !== 'authenticated' || !session?.user?.id) {
      setErrorMessage('Error: Usuario no autenticado.');
      return;
    }

    const formData = new FormData();
    formData.append('currentPassword', data.currentPassword);
    formData.append('newPassword', data.newPassword);
    formData.append('confirmPassword', data.confirmPassword);
    formData.append('userId', session.user.id);

    try {
      await updateUserProfile(formData);
      setSuccessMessage('¡Contraseña actualizada exitosamente!');
      reset();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al actualizar la contraseña');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Formateador de fecha para el saludo
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('es-VE', dateOptions);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'Administrador';
      case 'Gestor Adulto Mayor':
        return 'Gestor de Adultos Mayores';
      case 'Gestor Discapacidad':
        return 'Gestor de Discapacidad';
      default:
        return 'Administrador';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'Acceso completo al sistema';
      case 'Gestor Adulto Mayor':
        return 'Gestión de adultos mayores';
      case 'Gestor Discapacidad':
        return 'Gestión de personas con discapacidad';
      default:
        return 'Acceso completo al sistema';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-10"
    >
      <div className="max-w-4xl mx-auto">
        {/* Encabezado Personalizado */}
        <div className="flex items-center gap-4 mb-10">
          <Avatar className="h-16 w-16">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hola, {session?.user?.name || 'Usuario'}!
            </h1>
            <p className="text-gray-500 capitalize">{formattedDate}</p>
          </div>
        </div>

        {/* Sección de Información de la Cuenta */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <User className="text-blue-500" />
            Información de la Cuenta
          </h2>
          <p className="text-gray-500 mt-1">Tus datos personales y de rol en el sistema.</p>
          
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <Label className="w-full sm:w-1/3 text-gray-500 font-medium">Nombre de Usuario</Label>
              <p className="flex-1 mt-1 sm:mt-0 p-3 bg-gray-100 rounded-md text-gray-800 font-medium">
                {userDetails?.nombreUsuario || session?.user?.name || 'No disponible'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center">
              <Label className="w-full sm:w-1/3 text-gray-500 font-medium">Rol Asignado</Label>
              <div className="flex-1 mt-1 sm:mt-0 p-3 bg-gray-100 rounded-md flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium">
                    {getRoleDisplayName(userDetails?.rol || session?.user?.role || 'Admin')}
                  </span>
                  <span className="text-xs text-gray-600">
                    {getRoleDescription(userDetails?.rol || session?.user?.role || 'Admin')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center">
              <Label className="w-full sm:w-1/3 text-gray-500 font-medium">Consejo Comunal</Label>
              <div className="flex-1 mt-1 sm:mt-0 p-3 bg-gray-100 rounded-md flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium">
                    {userDetails?.consejoComunal || 'Valle Verde I'}
                  </span>
                  <span className="text-xs text-gray-600">
                    Organización a la que perteneces
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Sección de Cambio de Contraseña */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <Shield className="text-blue-500" />
            Seguridad de la Cuenta
          </h2>
          <p className="text-gray-500 mt-1">Actualiza tu contraseña para mantener tu cuenta protegida.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
            <AnimatePresence>
              {successMessage && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="flex items-center gap-3 p-4 bg-green-50 text-green-800 border-l-4 border-green-400 rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <p className="font-medium text-sm">{successMessage}</p>
                  </div>
                </motion.div>
              )}

              {errorMessage && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="flex items-center gap-3 p-4 bg-red-50 text-red-800 border-l-4 border-red-400 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="font-medium text-sm">{errorMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    {...register('currentPassword')}
                    className="pl-10"
                  />
                </div>
                {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    disabled={isSubmitting}
                    {...register('newPassword')}
                    className="pl-10"
                  />
                </div>
                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite la contraseña"
                    disabled={isSubmitting}
                    {...register('confirmPassword')}
                    className="pl-10"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="min-w-[180px]">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar Contraseña
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}