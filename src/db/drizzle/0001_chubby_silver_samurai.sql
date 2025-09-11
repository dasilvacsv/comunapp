CREATE TYPE "public"."prioridad_solicitud" AS ENUM('Baja', 'Media', 'Alta', 'Urgente');--> statement-breakpoint
CREATE TYPE "public"."estado_solicitud" AS ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Entregada');--> statement-breakpoint
CREATE TABLE "solicitudes" (
	"id" text PRIMARY KEY NOT NULL,
	"descripcion" text NOT NULL,
	"estado" "estado_solicitud" DEFAULT 'Pendiente' NOT NULL,
	"prioridad" "prioridad_solicitud" DEFAULT 'Media' NOT NULL,
	"adulto_mayor_id" text,
	"persona_con_discapacidad_id" text,
	"creado_por_usuario_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "documentos" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_adulto_mayor_id_adultos_mayores_id_fk" FOREIGN KEY ("adulto_mayor_id") REFERENCES "public"."adultos_mayores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_persona_con_discapacidad_id_personas_con_discapacidad_id_fk" FOREIGN KEY ("persona_con_discapacidad_id") REFERENCES "public"."personas_con_discapacidad"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_creado_por_usuario_id_usuarios_id_fk" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;