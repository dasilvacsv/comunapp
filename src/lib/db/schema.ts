// lib/db/schema.ts

import { pgTable, text, timestamp, pgEnum, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2'; // <-- IMPORTANTE: Importar CUID2

// Enums (sin cambios)
export const requestStatusEnum = pgEnum("request_status", ["Pendiente", "Aprobada", "Rechazada", "Entregada"]);
export const priorityEnum = pgEnum("priority", ["Baja", "Media", "Alta", "Urgente"]);

// Tabla para los usuarios administradores (Vocero)
export const users = pgTable("users", {
  // CAMBIO: de serial("id") a text("id") con CUID2 como valor por defecto
  id: text("id").primaryKey().$defaultFn(() => createId()),
  username: text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para las personas registradas (beneficiarios)
export const beneficiaries = pgTable("beneficiaries", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  fullName: text("full_name").notNull(),
  
  // CAMBIO: Añadido campo para la fecha de nacimiento (opcional)
  birthDate: date("birth_date"), 
  
  disabilityType: text("disability_type"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla para las solicitudes de ayuda
export const requests = pgTable("requests", {
  // CAMBIO: de serial("id") a text("id") con CUID2
  id: text("id").primaryKey().$defaultFn(() => createId()),
  
  // CAMBIO: el tipo de beneficiaryId debe ser text para coincidir con el id de beneficiaries
  beneficiaryId: text("beneficiary_id").references(() => beneficiaries.id, { onDelete: 'cascade' }).notNull(),
  
  description: text("description").notNull(),
  status: requestStatusEnum("status").default("Pendiente").notNull(),
  priority: priorityEnum("priority").default("Media").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relaciones (sin cambios en la lógica)
export const beneficiariesRelations = relations(beneficiaries, ({ many }) => ({
  requests: many(requests),
}));

export const requestsRelations = relations(requests, ({ one }) => ({
  beneficiary: one(beneficiaries, {
    fields: [requests.beneficiaryId],
    references: [beneficiaries.id],
  }),
}));