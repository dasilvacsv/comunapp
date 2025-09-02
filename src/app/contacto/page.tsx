import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Heart, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Contacto() {
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
              <Link href="/quienes-somos" className="text-gray-700 hover:text-blue-600">Quiénes Somos</Link>
              <Link href="/contacto" className="text-blue-600 font-medium">Contacto</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Contáctanos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos aquí para ayudarte. No dudes en contactarnos si necesitas apoyo 
              o tienes alguna pregunta sobre nuestros servicios.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Información de Contacto */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Información de Contacto
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">info@fundacionayuda.org</p>
                      <p className="text-gray-600">solicitudes@fundacionayuda.org</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 rounded-full p-3">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Teléfono</h3>
                      <p className="text-gray-600">Principal: (555) 123-4567</p>
                      <p className="text-gray-600">Emergencias: (555) 987-6543</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 rounded-full p-3">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Dirección</h3>
                      <p className="text-gray-600">
                        Calle Principal #123<br />
                        Centro de la Ciudad<br />
                        CP 12345
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 rounded-full p-3">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Horarios de Atención</h3>
                      <p className="text-gray-600">
                        Lunes a Viernes: 8:00 AM - 5:00 PM<br />
                        Sábados: 9:00 AM - 1:00 PM<br />
                        Domingos: Cerrado
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>¿Necesitas Ayuda Urgente?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Si tienes una situación que requiere atención inmediata, 
                    puedes llamarnos a nuestro número de emergencias o enviar 
                    un email marcado como "URGENTE".
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar Ahora
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Urgente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulario de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Envíanos un Mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input id="nombre" type="text" placeholder="Tu nombre completo" />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input id="telefono" type="tel" placeholder="Tu número de teléfono" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="tu@email.com" />
                  </div>

                  <div>
                    <Label htmlFor="asunto">Asunto</Label>
                    <Input id="asunto" type="text" placeholder="¿De qué quieres hablar?" />
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo de Solicitud</Label>
                    <select 
                      id="tipo" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="solicitud">Solicitud de Ayuda</option>
                      <option value="informacion">Información General</option>
                      <option value="voluntario">Quiero Ser Voluntario</option>
                      <option value="donacion">Donaciones</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="mensaje">Mensaje</Label>
                    <Textarea 
                      id="mensaje" 
                      rows={6} 
                      placeholder="Cuéntanos cómo podemos ayudarte o en qué estás interesado..."
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}