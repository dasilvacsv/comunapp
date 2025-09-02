// types/next-auth.d.ts

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Añade la propiedad 'id' al usuario de la sesión
    } & DefaultSession['user'];
  }

  interface User {
    id: string; // Añade la propiedad 'id' al usuario que devuelve 'authorize'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string; // Añade la propiedad 'id' al token JWT
  }
}