create extension if not exists "pgcrypto";

create table if not exists estudiantes (
  id uuid primary key default gen_random_uuid(),
  nombres text not null,
  apellidos text not null,
  correo text not null unique,
  google_sub text,
  rol text not null default 'estudiante' check (rol in ('estudiante', 'admin')),
  hash_contrasena text not null,
  universidad text not null,
  carrera text not null,
  semestre text not null,
  plan text not null default 'gratis' check (plan in ('gratis', 'estudiante', 'premium', 'premium_plus')),
  tipo_perfil text not null default 'universitario' check (tipo_perfil in ('universitario', 'instituto', 'posgrado', 'profesional_estudia', 'diplomado_maestria', 'segunda_especialidad')),
  objetivo_academico text not null default 'aprobar_cursos' check (objetivo_academico in ('aprobar_cursos', 'preparar_examenes', 'avanzar_tesis', 'terminar_proyecto_final', 'organizar_trabajo_estudio', 'mejorar_productividad')),
  preferencia_micro_sesion int not null default 20 check (preferencia_micro_sesion in (15, 20, 30, 45)),
  horario_laboral text,
  dias_mayor_disponibilidad text,
  tiene_tesis_proyecto boolean not null default false,
  tiempo_real_disponible_dia numeric(4,1),
  horas_disponibles text,
  metodo_estudio text,
  tono_asistente text not null default 'responsable' check (tono_asistente in ('frio', 'amigable', 'responsable')),
  metas text,
  horas_estudio_diarias int default 4,
  horas_sueno int default 8,
  notif_tareas boolean not null default true,
  notif_examenes boolean not null default true,
  notif_ia boolean not null default true,
  notif_semanal boolean not null default true,
  notif_correo boolean not null default false,
  email_verificado boolean not null default false,
  email_verificacion_token text,
  email_verificacion_expira timestamptz,
  app_modo_oscuro boolean not null default false,
  app_google_calendar boolean not null default false,
  app_sugerencias_automaticas boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table estudiantes add column if not exists plan text not null default 'gratis';
alter table estudiantes drop constraint if exists estudiantes_plan_check;
alter table estudiantes add constraint estudiantes_plan_check check (plan in ('gratis', 'estudiante', 'premium', 'premium_plus'));
alter table estudiantes add column if not exists tipo_perfil text not null default 'universitario';
alter table estudiantes add column if not exists objetivo_academico text not null default 'aprobar_cursos';
alter table estudiantes add column if not exists preferencia_micro_sesion int not null default 20;
alter table estudiantes add column if not exists horario_laboral text;
alter table estudiantes add column if not exists dias_mayor_disponibilidad text;
alter table estudiantes add column if not exists tiene_tesis_proyecto boolean not null default false;
alter table estudiantes add column if not exists tiempo_real_disponible_dia numeric(4,1);
alter table estudiantes add column if not exists tono_asistente text not null default 'responsable';
alter table estudiantes add column if not exists google_sub text;
create unique index if not exists estudiantes_google_sub_unique on estudiantes (google_sub) where google_sub is not null;

alter table estudiantes add column if not exists notif_tareas boolean not null default true;
alter table estudiantes add column if not exists notif_examenes boolean not null default true;
alter table estudiantes add column if not exists notif_ia boolean not null default true;
alter table estudiantes add column if not exists notif_semanal boolean not null default true;
alter table estudiantes add column if not exists notif_correo boolean not null default false;
alter table estudiantes add column if not exists email_verificado boolean not null default false;
alter table estudiantes add column if not exists email_verificacion_token text;
alter table estudiantes add column if not exists email_verificacion_expira timestamptz;
alter table estudiantes add column if not exists app_modo_oscuro boolean not null default false;
alter table estudiantes add column if not exists app_google_calendar boolean not null default false;
alter table estudiantes add column if not exists app_sugerencias_automaticas boolean not null default true;

create table if not exists cursos (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  nombre text not null,
  docente text not null,
  horario_texto text not null,
  semestre text not null,
  color text not null default 'blue',
  descripcion text default '',
  creado_en timestamptz not null default now()
);

create table if not exists tareas (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  curso_id uuid not null references cursos(id) on delete cascade,
  titulo text not null,
  descripcion text default '',
  fecha_entrega date not null,
  prioridad text not null check (prioridad in ('low', 'medium', 'high')),
  estado text not null default 'pending' check (estado in ('pending', 'in-progress', 'completed', 'overdue')),
  horas_estimadas numeric(4,1) not null default 1,
  progreso int not null default 0 check (progreso between 0 and 100),
  creado_en timestamptz not null default now()
);

create table if not exists subtareas (
  id uuid primary key default gen_random_uuid(),
  tarea_id uuid not null references tareas(id) on delete cascade,
  titulo text not null,
  completada boolean not null default false,
  creado_en timestamptz not null default now()
);

create table if not exists examenes (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  curso_id uuid not null references cursos(id) on delete cascade,
  titulo text not null,
  fecha_examen date not null,
  hora_examen time not null,
  temas text[] not null default '{}',
  preparacion int not null default 0 check (preparacion between 0 and 100),
  creado_en timestamptz not null default now()
);

create table if not exists bloques_planificador (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  curso_id uuid references cursos(id) on delete set null,
  dia_semana int not null check (dia_semana between 0 and 6),
  hora_inicio numeric(4,1) not null,
  horas_duracion numeric(4,1) not null,
  titulo text not null,
  tipo_bloque text not null default 'study' check (tipo_bloque in ('class', 'study', 'exam', 'break', 'task', 'review', 'work', 'personal', 'commute', 'project_thesis', 'micro_session', 'academic_meeting', 'research')),
  color text not null default 'blue',
  creado_en timestamptz not null default now()
);

alter table bloques_planificador drop constraint if exists bloques_planificador_tipo_bloque_check;
alter table bloques_planificador add constraint bloques_planificador_tipo_bloque_check check (tipo_bloque in ('class', 'study', 'exam', 'break', 'task', 'review', 'work', 'personal', 'commute', 'project_thesis', 'micro_session', 'academic_meeting', 'research'));

create table if not exists notificaciones (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  tipo text not null check (tipo in ('urgent', 'warning', 'info', 'success')),
  titulo text not null,
  mensaje text not null,
  no_leida boolean not null default true,
  creado_en timestamptz not null default now()
);

create table if not exists mensajes_chat (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  rol text not null check (rol in ('user', 'ai')),
  mensaje text not null,
  creado_en timestamptz not null default now()
);

create table if not exists proyectos_largos (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  curso_id uuid references cursos(id) on delete set null,
  titulo text not null,
  descripcion text default '',
  tipo text not null default 'proyecto_final' check (tipo in ('tesis', 'proyecto_final', 'investigacion', 'articulo', 'exposicion_grande', 'caso_negocio', 'otro')),
  fecha_limite date not null,
  fase_actual text not null default 'investigacion' check (fase_actual in ('investigacion', 'estructura', 'redaccion', 'revision', 'entrega')),
  progreso int not null default 0 check (progreso between 0 and 100),
  ultimo_avance date default current_date,
  creado_en timestamptz not null default now()
);

create table if not exists pasos_proyecto_largo (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos_largos(id) on delete cascade,
  titulo text not null,
  fase text not null default 'investigacion' check (fase in ('investigacion', 'estructura', 'redaccion', 'revision', 'entrega')),
  completado boolean not null default false,
  creado_en timestamptz not null default now()
);

create table if not exists proyectos_grupales (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  curso_id uuid references cursos(id) on delete set null,
  nombre text not null,
  descripcion text default '',
  fecha_limite date not null,
  codigo_invitacion text not null default upper(substr(md5(random()::text), 1, 6)) unique,
  creado_en timestamptz not null default now()
);

alter table proyectos_grupales add column if not exists codigo_invitacion text;
update proyectos_grupales
set codigo_invitacion = upper(substr(md5(id::text), 1, 6))
where codigo_invitacion is null or codigo_invitacion = '';
alter table proyectos_grupales alter column codigo_invitacion set default upper(substr(md5(random()::text), 1, 6));
alter table proyectos_grupales alter column codigo_invitacion set not null;
create unique index if not exists proyectos_grupales_codigo_invitacion_unique on proyectos_grupales (codigo_invitacion);

create table if not exists integrantes_proyecto (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos_grupales(id) on delete cascade,
  nombre text not null,
  rol text default 'Integrante',
  rol_permiso text not null default 'editor' check (rol_permiso in ('admin', 'editor', 'responsable', 'lector')),
  creado_en timestamptz not null default now()
);

alter table integrantes_proyecto add column if not exists rol_permiso text default 'editor';
update integrantes_proyecto
set rol_permiso = 'editor'
where rol_permiso is null or rol_permiso not in ('admin', 'editor', 'responsable', 'lector');
alter table integrantes_proyecto alter column rol_permiso set default 'editor';
alter table integrantes_proyecto alter column rol_permiso set not null;

create table if not exists tareas_grupales (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos_grupales(id) on delete cascade,
  titulo text not null,
  responsable_id uuid references integrantes_proyecto(id) on delete set null,
  fecha_limite date not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_proceso', 'en_revision', 'finalizado')),
  progreso int not null default 0 check (progreso between 0 and 100),
  creado_en timestamptz not null default now()
);

create table if not exists comentarios_tarea_grupal (
  id uuid primary key default gen_random_uuid(),
  tarea_id uuid not null references tareas_grupales(id) on delete cascade,
  autor text not null default 'Equipo',
  comentario text not null,
  creado_en timestamptz not null default now()
);

create table if not exists checklist_tarea_grupal (
  id uuid primary key default gen_random_uuid(),
  tarea_id uuid not null references tareas_grupales(id) on delete cascade,
  titulo text not null,
  completado boolean not null default false,
  creado_en timestamptz not null default now()
);
