import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Heart, Target, Users, Award } from 'lucide-react';

export default function QuienesSomos() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Fundación Ayuda</h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600">Inicio</Link>
              <Link href="/quienes-somos" className="text-blue-600 font-medium">Quiénes Somos</Link>
              <Link href="/contacto" className="text-gray-700 hover:text-blue-600">Contacto</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Quiénes Somos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Somos una organización dedicada a transformar vidas a través del apoyo 
              integral a personas con discapacidad y sus familias.
            </p>
          </div>

          {/* Misión y Visión */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">Nuestra Misión</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Brindar apoyo integral y personalizado a personas con discapacidad, 
                  facilitando su acceso a recursos, servicios y oportunidades que mejoren 
                  su calidad de vida y promuevan su inclusión social.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Award className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">Nuestra Visión</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Ser reconocidos como la organización líder en apoyo a personas con 
                  discapacidad, construyendo una sociedad más inclusiva, equitativa 
                  y solidaria para todos.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Valores */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Nuestros Valores
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Solidaridad</h4>
                <p className="text-gray-600">
                  Trabajamos unidos para crear impacto positivo en nuestras comunidades.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Inclusión</h4>
                <p className="text-gray-600">
                  Promovemos la participación plena de todas las personas en la sociedad.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Excelencia</h4>
                <p className="text-gray-600">
                  Buscamos la calidad y eficiencia en todos nuestros servicios y programas.
                </p>
              </div>
            </div>
          </div>

          {/* Historia */}
          <Card className="mb-16">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Nuestra Historia
              </h3>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <p className="mb-4">
                  Fundación Ayuda nació en 2020 con el objetivo de crear un puente 
                  entre las necesidades de las personas con discapacidad y los recursos 
                  disponibles en la comunidad. Desde nuestros inicios, hemos trabajado 
                  incansablemente para desarrollar programas innovadores que respondan 
                  a las necesidades reales de nuestros beneficiarios.
                </p>
                <p className="mb-4">
                  A lo largo de estos años, hemos logrado implementar un sistema 
                  integral de gestión que nos permite coordinar eficientemente las 
                  solicitudes de ayuda, hacer seguimiento personalizado de cada caso 
                  y generar reportes que nos ayudan a medir nuestro impacto.
                </p>
                <p>
                  Hoy en día, seguimos creciendo y evolucionando para ofrecer el 
                  mejor servicio posible a quienes más lo necesitan, siempre guiados 
                  por nuestros valores de solidaridad, inclusión y excelencia.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Quieres Ser Parte de Nuestro Equipo?
            </h3>
            <p className="text-gray-600 mb-6">
              Únete a nosotros en la misión de transformar vidas y construir una sociedad más inclusiva.
            </p>
            <Link href="/contacto">
              <Button size="lg">
                Contáctanos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}