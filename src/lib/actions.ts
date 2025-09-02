// lib/actions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from './db';
import { beneficiaries, requests, users } from './db/schema';
import { eq, desc, count, sql, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import z from 'zod';

// Actions para beneficiarios
export async function createBeneficiary(formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const disabilityType = formData.get('disabilityType') as string;
  const notes = formData.get('notes') as string;
  // CAMBIO: Obtener la fecha de nacimiento del formulario
  const birthDateValue = formData.get('birthDate') as string; 

  if (!fullName.trim()) {
    throw new Error('El nombre completo es requerido');
  }

  // CAMBIO: Preparar los valores para la inserción
  const valuesToInsert = {
    fullName,
    disabilityType,
    notes,
    // Si hay una fecha, la incluimos. Si no, Drizzle la ignorará (ya que es nullable).
    ...(birthDateValue && { birthDate: birthDateValue }),
  };

  await db.insert(beneficiaries).values(valuesToInsert);

  revalidatePath('/dashboard/registros');
  redirect('/dashboard/registros');
}

// CAMBIO: El 'id' ahora es de tipo string
export async function updateBeneficiary(id: string, formData: FormData) {
  // 1. Obtener los datos del formulario.
  const fullName = formData.get('fullName') as string;
  let disabilityType = formData.get('disabilityType') as string | null;
  const notes = formData.get('notes') as string;
  const birthDateValue = formData.get('birthDate') as string;

  // 2. Realizar validación básica.
  if (!fullName || !fullName.trim()) {
    throw new Error('El nombre completo es requerido');
  }

  // 3. Transformar los datos para la base de datos.
  // Si el valor de disabilityType es "ninguno", lo convertimos a `null`.
  if (disabilityType === 'ninguno') {
    disabilityType = null;
  }

  // 4. Construir el objeto con los valores a actualizar.
  const valuesToUpdate = {
    fullName,
    disabilityType,
    notes,
    updatedAt: new Date(), // Siempre actualizamos la fecha de modificación.
    // Si hay una fecha, la incluimos. Si el campo está vacío, guardamos `null`.
    birthDate: birthDateValue ? birthDateValue : null,
  };

  // 5. Ejecutar la actualización en la base de datos.
  await db.update(beneficiaries)
    .set(valuesToUpdate)
    .where(eq(beneficiaries.id, id));

  // 6. Revalidar el caché de las rutas afectadas para mostrar los datos actualizados.
  revalidatePath('/dashboard/registros'); // La lista principal.
  revalidatePath(`/dashboard/registros/${id}`); // La página de detalles.
  revalidatePath(`/dashboard/registros/${id}/editar`); // La propia página de edición.

  // 7. Redirigir al usuario a la página de detalles para ver los cambios.
  redirect(`/dashboard/registros/${id}`);
}

// CAMBIO: El 'id' ahora es de tipo string
export async function deleteBeneficiary(id: string) {
  await db.delete(beneficiaries).where(eq(beneficiaries.id, id));
  revalidatePath('/dashboard/registros');
  redirect('/dashboard/registros');
}

export async function getBeneficiaries() {
  return await db.select().from(beneficiaries).orderBy(desc(beneficiaries.createdAt));
}

// CAMBIO: El 'id' ahora es de tipo string
export async function getBeneficiaryById(id: string) {
  const result = await db.select().from(beneficiaries).where(eq(beneficiaries.id, id)).limit(1);
  return result[0] || null;
}

// Actions para solicitudes
export async function createRequest(formData: FormData) {
  // CAMBIO: beneficiaryId es un string, no se necesita parseInt
  const beneficiaryId = formData.get('beneficiaryId') as string;
  const description = formData.get('description') as string;
  const priority = formData.get('priority') as 'Baja' | 'Media' | 'Alta' | 'Urgente';

  if (!description.trim()) {
    throw new Error('La descripción es requerida');
  }

  await db.insert(requests).values({
    beneficiaryId,
    description,
    priority,
  });

  revalidatePath('/dashboard/solicitudes');
  redirect('/dashboard/solicitudes');
}

// CAMBIO: El 'id' ahora es de tipo string
export async function updateRequestStatus(id: string, status: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Entregada') {
  await db.update(requests)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(requests.id, id));

  revalidatePath('/dashboard/solicitudes');
  revalidatePath(`/dashboard/solicitudes/${id}`);
}

// CAMBIO: El 'id' ahora es de tipo string
export async function updateRequest(id: string, formData: FormData) {
  const description = formData.get('description') as string;
  const priority = formData.get('priority') as 'Baja' | 'Media' | 'Alta' | 'Urgente';
  const status = formData.get('status') as 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Entregada';

  if (!description.trim()) {
    throw new Error('La descripción es requerida');
  }

  await db.update(requests)
    .set({
      description,
      priority,
      status,
      updatedAt: new Date(),
    })
    .where(eq(requests.id, id));

  revalidatePath('/dashboard/solicitudes');
  revalidatePath(`/dashboard/solicitudes/${id}`);
}

// CAMBIO: El 'id' ahora es de tipo string
export async function deleteRequest(id: string) {
  await db.delete(requests).where(eq(requests.id, id));
  revalidatePath('/dashboard/solicitudes');
  redirect('/dashboard/solicitudes');
}

export async function getRequests() {
  return await db
    .select({
      id: requests.id,
      description: requests.description,
      status: requests.status,
      priority: requests.priority,
      createdAt: requests.createdAt,
      updatedAt: requests.updatedAt,
      beneficiaryName: beneficiaries.fullName,
      beneficiaryId: beneficiaries.id,
    })
    .from(requests)
    .leftJoin(beneficiaries, eq(requests.beneficiaryId, beneficiaries.id))
    .orderBy(desc(requests.createdAt));
}

// CAMBIO: El 'id' ahora es de tipo string
export async function getRequestById(id: string) {
  const result = await db
    .select({
      id: requests.id,
      description: requests.description,
      status: requests.status,
      priority: requests.priority,
      createdAt: requests.createdAt,
      updatedAt: requests.updatedAt,
      beneficiaryId: requests.beneficiaryId,
      beneficiaryName: beneficiaries.fullName,
      beneficiaryDisabilityType: beneficiaries.disabilityType,
      beneficiaryNotes: beneficiaries.notes,
    })
    .from(requests)
    .leftJoin(beneficiaries, eq(requests.beneficiaryId, beneficiaries.id))
    .where(eq(requests.id, id))
    .limit(1);
  
  return result[0] || null;
}

// Actions para reportes (sin cambios necesarios aquí, solo hace conteos)
export async function getReportData(filters?: { status?: string, priority?: string }) {
  const { status, priority } = filters || {};

  const whereClause = and(
    status ? eq(requests.status, status as 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Entregada') : undefined,
    priority ? eq(requests.priority, priority as 'Baja' | 'Media' | 'Alta' | 'Urgente') : undefined
  );
  
  const [
    totalBeneficiaries,
    totalRequests,
    requestsByStatus,
    requestsByPriority,
    recentRequests,
    beneficiariesByDisability,
  ] = await Promise.all([
    // Siempre obtenemos el total de beneficiarios sin importar los filtros de solicitudes
    db.select({ count: count() }).from(beneficiaries),
    
    // El conteo total de solicitudes ahora respeta los filtros
    db.select({ count: count() }).from(requests).where(whereClause),
    
    // Las agrupaciones también se filtran
    db.select({ status: requests.status, count: count() }).from(requests).where(whereClause).groupBy(requests.status),
    
    // Las agrupaciones también se filtran
    db.select({ priority: requests.priority, count: count() }).from(requests).where(whereClause).groupBy(requests.priority),
    
    // Las solicitudes recientes ahora también se filtran
    db.select({
      id: requests.id,
      description: requests.description,
      status: requests.status,
      priority: requests.priority,
      createdAt: requests.createdAt,
      beneficiaryName: beneficiaries.fullName,
    })
    .from(requests)
    .leftJoin(beneficiaries, eq(requests.beneficiaryId, beneficiaries.id))
    .where(whereClause)
    .orderBy(desc(requests.createdAt))
    .limit(10),

    // Los beneficiarios por discapacidad se mantienen sin cambios de filtro
    db.select({
      disabilityType: beneficiaries.disabilityType,
      count: count(),
    })
    .from(beneficiaries)
    .where(sql`${beneficiaries.disabilityType} IS NOT NULL AND ${beneficiaries.disabilityType} != ''`)
    .groupBy(beneficiaries.disabilityType),
  ]);

  return {
    totalBeneficiaries: totalBeneficiaries[0]?.count || 0,
    totalRequests: totalRequests[0]?.count || 0,
    requestsByStatus,
    requestsByPriority,
    recentRequests,
    beneficiariesByDisability,
  };
}
// Actions para perfil de usuario
export async function updateUserProfile(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  
  // CAMBIO: userId es un string, no se necesita parseInt
  const userId = formData.get('userId') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error('Todos los campos son requeridos');
  }

  if (newPassword !== confirmPassword) {
    throw new Error('Las contraseñas no coinciden');
  }

  if (newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) {
    throw new Error('Usuario no encontrado');
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user[0].passwordHash);
  if (!isValidPassword) {
    throw new Error('La contraseña actual es incorrecta');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await db.update(users)
    .set({ passwordHash: newPasswordHash })
    .where(eq(users.id, userId));

  revalidatePath('/dashboard/perfil');
}

// Action para crear usuario (sin cambios)
export async function createUser(username: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  
  await db.insert(users).values({
    username,
    passwordHash,
  });
}

// signUp action (sin cambios)
export async function signUp(formData: FormData) {
  const schema = z.object({
    username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

  const validated = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!validated.success) {
    const errorMessages = validated.error.errors.map(e => e.message).join(', ');
    throw new Error(errorMessages);
  }

  const { username, password } = validated.data;

  try {
    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUser.length > 0) {
      throw new Error("El nombre de usuario ya está en uso.");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      username,
      passwordHash,
    });

    revalidatePath('/login');
    
    return { success: true, message: "¡Usuario registrado exitosamente! Ahora puedes iniciar sesión." };

  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "No se pudo registrar al usuario.");
  }
}