"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users2,
  ClipboardList,
  HeartHandshake,
  MessageCircle,
  Bell,
  Menu,
  X,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

// --- Variantes de Animación Reutilizables ---
const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: 'easeInOut' } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

// --- COMPONENTE DEL DIÁLOGO DE CLAVE SECRETA ---
const AdminKeyDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
  const router = useRouter();
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const SECRET_ADMIN_KEY = '12345678'; // Clave secreta quemada en el código

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (secretKey === SECRET_ADMIN_KEY) {
      setError('');
      // Si la clave es correcta, redirige al panel de administración
      router.push('/login');
    } else {
      setError('Clave secreta incorrecta. Inténtalo de nuevo.');
    }
  };

  // Limpia el error al empezar a escribir
  useEffect(() => {
    if (secretKey) setError('');
  }, [secretKey]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic dentro
          >
            <div className="text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="mt-2 text-xl font-bold text-gray-900">Acceso de Administrador</h2>
              <p className="mt-2 text-sm text-gray-500">
                Introduce la clave secreta para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Clave Secreta"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full pl-10"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-center text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Verificar y Entrar
              </Button>
            </form>

            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// --- COMPONENTE DE HEADER MEJORADO ---
const IncredibleHeader = ({ onLoginClick }: { onLoginClick: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Servicios', href: '#servicios' },
    { name: 'El Proyecto', href: '#proyecto' },
  ];

  const mobileMenuVariants = {
    hidden: { x: '100%', transition: { type: 'tween', duration: 0.3 } },
    visible: { x: 0, transition: { type: 'tween', duration: 0.3 } },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <motion.header
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'py-3 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' : 'py-5 bg-transparent'}`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Users2 className={`h-8 w-8 transition-colors duration-300 ${scrolled ? 'text-blue-600' : 'text-white'}`} />
            <span className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              Valle Verde I
            </span>
          </Link>

          {/* Navegación de Escritorio */}
          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={`relative text-sm font-medium transition-colors duration-300 ${scrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/80 hover:text-white'}`}>
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
             {/* El botón ahora llama a la función onLoginClick para abrir el diálogo */}
            <div className="hidden sm:block">
              <Button
                onClick={onLoginClick}
                className={`rounded-full shadow-lg transition-all duration-300 ${scrolled ? 'bg-blue-600 text-white shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30' : 'bg-white text-blue-700 shadow-black/10 hover:shadow-lg'}`}
              >
                Acceder al Portal
              </Button>
            </div>

            {/* Botón de Menú Móvil */}
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 md:hidden">
              <Menu className={`h-6 w-6 transition-colors duration-300 ${scrolled ? 'text-gray-800' : 'text-white'}`} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Overlay del Menú Móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-lg md:hidden"
          >
            <div className="container mx-auto flex h-full flex-col px-4">
              <div className="flex items-center justify-between pt-5">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <Users2 className="h-8 w-8 text-blue-500" />
                  <span className="text-2xl font-bold text-white">Valle Verde I</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                  <X className="h-7 w-7 text-white" />
                </button>
              </div>
              <motion.nav
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="mt-20 flex flex-col items-center gap-8"
              >
                {navLinks.map((link, i) => (
                  <motion.div variants={linkVariants} transition={{ duration: 0.5, delay: i * 0.1 }} key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-3xl font-semibold text-white/80 hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div variants={linkVariants} transition={{ duration: 0.5, delay: 0.3 }}>
                   <Button onClick={() => { setMobileMenuOpen(false); onLoginClick(); }} size="lg" className="rounded-full bg-blue-600 text-white text-xl px-10 py-6 mt-8">
                     Acceder al Portal
                   </Button>
                </motion.div>
              </motion.nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


// --- Componente para las notificaciones (Visual) ---
type FloatingNotificationProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  position: string;
  delay?: number;
};

const FloatingNotification = ({
  icon,
  title,
  text,
  position,
  delay = 0,
}: FloatingNotificationProps) => {
  const Icon = icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: delay, ease: [0.25, 1, 0.5, 1] }}
      className={`absolute ${position} z-20 hidden md:block`}
    >
      <div className="flex items-center gap-3 bg-white/70 backdrop-blur-lg p-3 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-out">
        <div className="bg-blue-500 text-white p-2 rounded-lg">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-sm text-gray-800">{title}</p>
          <p className="text-xs text-gray-600">{text}</p>
        </div>
      </div>
    </motion.div>
  );
};


// --- Componente Principal de la Página ---
export default function Home() {
  const [isAdminDialogOpen, setAdminDialogOpen] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 antialiased">
      {/* Se pasa la función para abrir el diálogo al header */}
      <IncredibleHeader onLoginClick={() => setAdminDialogOpen(true)} />
      {/* El diálogo se renderiza aquí y se controla con el estado */}
      <AdminKeyDialog isOpen={isAdminDialogOpen} onClose={() => setAdminDialogOpen(false)} />

      <main className="flex-grow">
        {/* Hero Section con ajuste de espaciado superior */}
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden text-white pt-20">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 opacity-90">
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-400 opacity-20 blur-3xl animate-blob"></div>
            <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-indigo-400 opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-4">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-7xl font-extrabold tracking-tighter">
              Conectando Vidas en<span className="block mt-2 text-blue-200">Valle Verde I, Anaco</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-blue-100">
              La plataforma esencial para el registro y apoyo de nuestros adultos mayores y personas con discapacidad.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mt-16 w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-3xl">
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  <CarouselItem><div className="aspect-video w-full overflow-hidden rounded-2xl border-4 border-white shadow-2xl"><Image src="/ejemplo-comunidad-1.jpg" alt="Comunidad de Valle Verde I" width={1280} height={720} className="w-full h-full object-cover" /></div></CarouselItem>
                  <CarouselItem><div className="aspect-video w-full overflow-hidden rounded-2xl border-4 border-white shadow-2xl"><Image src="/ejemplo-jornada-social.jpg" alt="Jornada social en Anaco" width={1280} height={720} className="w-full h-full object-cover" /></div></CarouselItem>
                  <CarouselItem><div className="aspect-video w-full overflow-hidden rounded-2xl border-4 border-white shadow-2xl"><Image src="/ejemplo-voluntarios.jpg" alt="Voluntarios del proyecto" width={1280} height={720} className="w-full h-full object-cover" /></div></CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-[-50px] hidden lg:flex" />
                <CarouselNext className="right-[-50px] hidden lg:flex" />
              </Carousel>
            </motion.div>
          </div>

          <FloatingNotification icon={HeartHandshake} title="Apoyo Comunitario" text="Coordinando nuevas ayudas" position="bottom-[20%] left-[8%] xl:left-[20%]" delay={1.6} />
          <FloatingNotification icon={Bell} title="Anuncio Importante" text="Reunión general del consejo" position="bottom-[15%] right-[5%] xl:right-[18%]" delay={1.8} />
        </section>

        {/* --- SECCIÓN DE SERVICIOS MEJORADA --- */}
        <section id="servicios" className="py-24 sm:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.5 }} variants={fadeInUp} className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">NUESTRA PLATAFORMA</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Todo lo que necesitas para la gestión comunitaria</p>
            </motion.div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {[
                  { name: 'Registro Centralizado', description: 'Mantén una base de datos unificada y segura de todos los beneficiarios. Facilita el acceso a la información y agiliza la toma de decisiones para una atención más rápida y eficaz.', icon: ClipboardList },
                  { name: 'Gestión de Apoyos', description: 'Organiza y haz seguimiento de las solicitudes de ayuda, donativos y jornadas de atención. Asigna recursos de manera transparente y mide el impacto de cada acción.', icon: HeartHandshake },
                  { name: 'Comunicación Directa', description: 'Utiliza un canal oficial para enviar anuncios, noticias y recordatorios importantes. Asegura que la información llegue a todos los miembros de la comunidad de forma instantánea.', icon: MessageCircle },
                ].map((feature) => (
                  <motion.div key={feature.name} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.5 }} variants={fadeInUp} className="flex flex-col p-8 bg-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <dt className="flex items-center gap-x-3 text-2xl font-semibold leading-7 text-gray-900"><feature.icon className="h-10 w-10 flex-none text-blue-600" aria-hidden="true" />{feature.name}</dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600"><p className="flex-auto">{feature.description}</p></dd>
                  </motion.div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN DEL PROYECTO MEJORADA --- */}
        <section id="proyecto" className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
          <div className="absolute -top-80 left-[max(6rem,33%)] -z-10 transform-gpu blur-3xl sm:left-1/2 md:top-20 lg:ml-20 xl:top-3 xl:ml-56" aria-hidden="true">
            <div className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#3b82f6] to-[#6366f1] opacity-30" style={{ clipPath: 'polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)' }} />
          </div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp} className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Nuestro Origen</h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">Esta plataforma es el resultado de un <strong>Proyecto Socio Tecnológico</strong>, desarrollado en el marco de la <strong>Fundación Misión Sucre</strong>. Nace de la necesidad de aplicar la tecnología para fortalecer los lazos y optimizar la gestión en nuestra comunidad.</p>
            </motion.div>
            <motion.div initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp} className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-10 lg:max-w-none lg:grid-cols-12">
              <div className="relative lg:col-span-5">
                <div className="absolute -top-12 -right-4 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl sm:top-[-4rem] sm:-right-12"></div>
                <figure className="inset-0 flex flex-col justify-between rounded-2xl bg-white/5 p-8 text-sm leading-6 ring-1 ring-white/10">
                  <blockquote className="text-white"><p>“Sitio Web para la Gestión de Registro de Adultos Mayores y Personas con Discapacidad del Consejo Comunal 'Valle Verde I', Parroquia Anaco, Municipio Anaco, Estado Anzoátegui.”</p></blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4"><div className="font-semibold text-white">Proyecto de Grado</div><div className="h-px flex-auto bg-white/10" /><div className="text-gray-400">Técnico en Informática</div></figcaption>
                </figure>
              </div>
              <div className="text-base leading-7 text-gray-300 lg:col-span-7">
                <h3 className="text-2xl font-bold text-white mb-4">Misión y Visión</h3>
                <p>Nuestra misión es proporcionar una herramienta digital robusta y fácil de usar que centralice la información vital de los miembros más vulnerables de la comunidad. Buscamos ser un puente entre las necesidades y los recursos disponibles.</p>
                <p className="mt-4">Aspiramos a que esta plataforma se convierta en un modelo de gestión comunitaria, fomentando la transparencia, la eficiencia y, sobre todo, un sentido de cuidado y pertenencia más fuerte entre los vecinos de Valle Verde I.</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 md:px-6 py-12 text-center">
          <div className="flex justify-center items-center gap-2 mb-4"><Users2 className="h-6 w-6 text-blue-400" /><h3 className="text-lg font-semibold text-white">Consejo Comunal "Valle Verde I"</h3></div>
          <p className="text-sm text-gray-400 max-w-md mx-auto">Un proyecto creado con tecnología y corazón para el bienestar de Anaco, Estado Anzoátegui.</p>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-500"><p>&copy; {new Date().getFullYear()} C.C. Valle Verde I. Todos los derechos reservados.</p><p className="mt-1">Sitio web desarrollado como Proyecto Socio Tecnológico.</p></div>
        </div>
      </footer>
    </div>
  );
}