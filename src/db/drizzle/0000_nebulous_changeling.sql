CREATE TYPE "public"."estado_civil" AS ENUM('Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a');--> statement-breakpoint
CREATE TYPE "public"."rol" AS ENUM('Admin', 'Gestor Adulto Mayor', 'Gestor Discapacidad');--> statement-breakpoint
CREATE TABLE "adultos_mayores" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"fecha_nacimiento" date,
	"etnia_aborigen" text,
	"direccion" text,
	"telefono" text,
	"correo_electronico" text,
	"estado_civil" "estado_civil",
	"descripcion_salud" text,
	"creado_por_usuario_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consejos_comunales" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"parroquia" text NOT NULL,
	"municipio" text NOT NULL,
	"estado" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documentos" (
	"id" text PRIMARY KEY NOT NULL,
	"tipo" text NOT NULL,
	"archivo" text NOT NULL,
	"fecha_emision" date,
	"adulto_mayor_id" text,
	"persona_con_discapacidad_id" text,
	"subido_por_usuario_id" text
);
--> statement-breakpoint
CREATE TABLE "personas_con_discapacidad" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"fecha_nacimiento" date,
	"etnia_aborigen" text,
	"tipo_discapacidad" text,
	"grado_discapacidad" text,
	"certificacion_medica" text,
	"direccion" text,
	"telefono" text,
	"correo_electronico" text,
	"estado_civil" "estado_civil",
	"creado_por_usuario_id" text,
	"representante_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "representantes" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"fecha_nacimiento" date,
	"direccion" text,
	"telefono" text,
	"creado_por_usuario_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre_usuario" text NOT NULL,
	"contrasena_hash" text NOT NULL,
	"rol" "rol" NOT NULL,
	"consejo_comunal_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_nombre_usuario_unique" UNIQUE("nombre_usuario")
);
--> statement-breakpoint
ALTER TABLE "adultos_mayores" ADD CONSTRAINT "adultos_mayores_creado_por_usuario_id_usuarios_id_fk" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_adulto_mayor_id_adultos_mayores_id_fk" FOREIGN KEY ("adulto_mayor_id") REFERENCES "public"."adultos_mayores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_persona_con_discapacidad_id_personas_con_discapacidad_id_fk" FOREIGN KEY ("persona_con_discapacidad_id") REFERENCES "public"."personas_con_discapacidad"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_subido_por_usuario_id_usuarios_id_fk" FOREIGN KEY ("subido_por_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personas_con_discapacidad" ADD CONSTRAINT "personas_con_discapacidad_creado_por_usuario_id_usuarios_id_fk" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personas_con_discapacidad" ADD CONSTRAINT "personas_con_discapacidad_representante_id_representantes_id_fk" FOREIGN KEY ("representante_id") REFERENCES "public"."representantes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "representantes" ADD CONSTRAINT "representantes_creado_por_usuario_id_usuarios_id_fk" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_consejo_comunal_id_consejos_comunales_id_fk" FOREIGN KEY ("consejo_comunal_id") REFERENCES "public"."consejos_comunales"("id") ON DELETE set null ON UPDATE no action;