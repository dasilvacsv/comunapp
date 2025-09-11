ALTER TABLE "solicitudes" DROP CONSTRAINT "solicitudes_creado_por_usuario_id_usuarios_id_fk";
--> statement-breakpoint
ALTER TABLE "solicitudes" ALTER COLUMN "estado" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "solicitudes" ALTER COLUMN "estado" SET DEFAULT 'Pendiente';--> statement-breakpoint
ALTER TABLE "solicitudes" ALTER COLUMN "prioridad" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "solicitudes" ALTER COLUMN "prioridad" SET DEFAULT 'Media';--> statement-breakpoint
ALTER TABLE "solicitudes" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD COLUMN "creada_por_usuario_id" text;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_creada_por_usuario_id_usuarios_id_fk" FOREIGN KEY ("creada_por_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "solicitudes" DROP COLUMN "creado_por_usuario_id";--> statement-breakpoint
DROP TYPE "public"."prioridad_solicitud";--> statement-breakpoint
DROP TYPE "public"."estado_solicitud";