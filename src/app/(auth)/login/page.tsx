'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, User, Users2, MapPin } from 'lucide-react';
import { signUp } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';

// --- Imágenes para el carrusel visual ---
const carouselImages = [
  '/ejemplo-comunidad-1.jpg',
  '/ejemplo-jornada-social.jpg',
  '/ejemplo-voluntarios.jpg',
];

export default function AuthPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Efecto para el carrusel de imágenes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- Manejador del formulario para Login y Registro ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    // --- Lógica de Registro ---
    if (isRegisterMode) {
      try {
        const result = await signUp(formData); // Llama a la server action 'signUp'
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
          setTimeout(() => {
            setIsRegisterMode(false); // Vuelve al formulario de login
            setMessage(null);
          }, 3000);
        }
      } catch (error) {
        setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error desconocido al registrar.' });
      }
    // --- Lógica de Login ---
    } else {
      const nombreUsuario = formData.get('nombreUsuario') as string;
      const password = formData.get('password') as string;
      
      const result = await signIn('credentials', { 
        username: nombreUsuario, 
        password, 
        redirect: false 
      });

      if (result?.error) {
        setMessage({ type: 'error', text: 'Credenciales incorrectas. Verifique sus datos.' });
      } else {
        router.push('/dashboard'); // Redirige al panel de control si el login es exitoso
        router.refresh();
      }
    }
    setIsLoading(false);
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Columna Izquierda: Formulario */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-8 bg-white">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <Users2 className="h-10 w-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Valle Verde I</h1>
            </Link>
            <p className="text-gray-600">Portal de Gestión del Consejo Comunal</p>
          </div>

          <Card className="border-0 shadow-none sm:border sm:shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">
                {isRegisterMode ? 'Crear Cuenta de Administrador' : 'Bienvenido de Vuelta'}
              </CardTitle>
              <CardDescription>
                {isRegisterMode ? 'Regístrate para obtener acceso administrativo' : 'Ingresa a tu cuenta para continuar'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}

                {/* --- Campos Comunes --- */}
                <div className="space-y-2">
                  <Label htmlFor="nombreUsuario">Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="nombreUsuario"
                      name="nombreUsuario"
                      type="text"
                      required
                      className="pl-10"
                      placeholder="usuario.consejo"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="pl-10"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* --- Campos Adicionales solo para Registro --- */}
                <AnimatePresence>
                  {isRegisterMode && (
                    <motion.div
                      key="registerFields"
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="pl-10"
                            placeholder="••••••••"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="consejoComunal">Consejo Comunal (Opcional)</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="consejoComunal"
                            name="consejoComunal"
                            type="text"
                            className="pl-10"
                            placeholder="Valle Verde I"
                            disabled={isLoading}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Si no se especifica, se asignará a "Valle Verde I" por defecto.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Procesando...' : (isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión')}
                </Button>
              </form>

              {/* --- Botón para alternar entre Login y Registro --- */}
              <div className="mt-6 text-center text-sm">
                {isRegisterMode ? '¿Ya tienes una cuenta?' : '¿Necesitas una cuenta de administrador?'}
                <Button
                  variant="link"
                  type="button"
                  onClick={() => { setIsRegisterMode(!isRegisterMode); setMessage(null); }}
                  className="font-semibold text-blue-600"
                >
                  {isRegisterMode ? 'Inicia sesión' : 'Regístrate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Columna Derecha: Carrusel de Imágenes */}
      <div className="hidden lg:block relative">
        <AnimatePresence>
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={carouselImages[currentImageIndex]}
              alt="Imágenes de la comunidad"
              fill
              className="object-cover brightness-50"
            />
          </motion.div>
        </AnimatePresence>
        <div className="relative z-10 flex flex-col justify-end h-full p-10 text-white">
          <div className="bg-black/40 p-6 rounded-lg backdrop-blur-sm">
            <h2 className="text-3xl font-bold">Unidos por un bien común</h2>
            <p className="mt-2 text-gray-300">
              Esta plataforma es el corazón digital de nuestra comunidad, un espacio para conectar, 
              organizar y apoyar a quienes más lo necesitan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}