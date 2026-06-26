export type Prioridad = "low" | "medium" | "high";
export type EstadoTarea = "pending" | "in-progress" | "completed" | "overdue";
export type TipoNotificacion = "urgent" | "warning" | "info" | "success";
export type PlanUsuario = "gratis" | "estudiante" | "premium" | "premium_plus";
export type RolUsuario = "estudiante" | "admin" | "superadmin";
export type TipoPerfilUsuario =
  | "universitario"
  | "instituto"
  | "posgrado"
  | "profesional_estudia"
  | "diplomado_maestria"
  | "segunda_especialidad";
export type ObjetivoAcademico =
  | "aprobar_cursos"
  | "preparar_examenes"
  | "avanzar_tesis"
  | "terminar_proyecto_final"
  | "organizar_trabajo_estudio"
  | "mejorar_productividad";
export type PreferenciaMicroSesion = 15 | 20 | 30 | 45;
export type TipoBloquePlanificador =
  | "class"
  | "study"
  | "exam"
  | "break"
  | "task"
  | "review"
  | "work"
  | "personal"
  | "commute"
  | "project_thesis"
  | "micro_session"
  | "academic_meeting"
  | "research";
export type JornadaPlanificacion = "manana" | "tarde" | "noche" | "flexible";
export type AlcancePlanificacion = "todo" | "tarea" | "curso";
export type ModoPlanificacionTodo =
  | "solo-calendarizado"
  | "agregar-tareas"
  | "agregar-repasos"
  | "agregar-todo";

export type FranjaDisponibilidad = "manana" | "tarde" | "noche";

export type DisponibilidadDia = {
  dia: number;
  manana: boolean;
  tarde: boolean;
  noche: boolean;
};

export type Subtarea = {
  id: string;
  titulo: string;
  completada: boolean;
};

export type PerfilUsuario = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: RolUsuario;
  universidad: string;
  carrera: string;
  semestre: string;
  plan: PlanUsuario;
  tipoPerfil: TipoPerfilUsuario;
  objetivoAcademico: ObjetivoAcademico;
  preferenciaMicroSesion: PreferenciaMicroSesion;
  horarioLaboral: string;
  diasMayorDisponibilidad: string;
  tieneTesisProyecto: boolean;
  tiempoRealDisponibleDia: number;
  emailVerificado: boolean;
  horasDisponibles: string;
  metodoEstudio: string;
  tonoAsistente: "frio" | "amigable" | "responsable";
  metas: string;
  horasEstudioDiarias: number;
  horasSueno: number;
  disponibilidadSemanal: DisponibilidadDia[];
  notificaciones: {
    tareas: boolean;
    examenes: boolean;
    ia: boolean;
    semanal: boolean;
    correo: boolean;
  };
  aplicacion: {
    modoOscuro: boolean;
    googleCalendar: boolean;
    sugerenciasAutomaticas: boolean;
  };
};

export type Curso = {
  id: string;
  nombre: string;
  docente: string;
  horario: string;
  semestre: string;
  color: string;
  descripcion: string;
  materiales: Array<{ id: string; nombre: string; tipo: string }>;
};

export type Tarea = {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  prioridad: Prioridad;
  estado: EstadoTarea;
  horasEstimadas: number;
  progreso: number;
  subtareas: Subtarea[];
};

export type TipoProyectoLargo =
  | "tesis"
  | "proyecto_final"
  | "investigacion"
  | "articulo"
  | "exposicion_grande"
  | "caso_negocio"
  | "otro";

export type FaseProyectoLargo = "investigacion" | "estructura" | "redaccion" | "revision" | "entrega";

export type PasoProyectoLargo = {
  id: string;
  proyectoId: string;
  titulo: string;
  fase: FaseProyectoLargo;
  completado: boolean;
};

export type ProyectoLargo = {
  id: string;
  cursoId?: string;
  titulo: string;
  descripcion: string;
  tipo: TipoProyectoLargo;
  fechaLimite: string;
  faseActual: FaseProyectoLargo;
  progreso: number;
  ultimoAvance: string;
  pasos: PasoProyectoLargo[];
};

export type EstadoTareaGrupal = "pendiente" | "en_proceso" | "en_revision" | "finalizado";
export type RolIntegranteProyecto = "admin" | "editor" | "responsable" | "lector";

export type IntegranteProyecto = {
  id: string;
  proyectoId: string;
  nombre: string;
  correo?: string;
  rol: string;
  rolPermiso: RolIntegranteProyecto;
};

export type ComentarioTareaGrupal = {
  id: string;
  tareaId: string;
  autor: string;
  comentario: string;
  creadoEn: string;
};

export type ChecklistTareaGrupal = {
  id: string;
  tareaId: string;
  titulo: string;
  completado: boolean;
};

export type TareaGrupal = {
  id: string;
  proyectoId: string;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  responsableId?: string | null;
  fechaLimite: string;
  estado: EstadoTareaGrupal;
  progreso: number;
  comentarios: ComentarioTareaGrupal[];
  checklist: ChecklistTareaGrupal[];
};

export type ProyectoGrupal = {
  id: string;
  cursoId?: string;
  nombre: string;
  descripcion: string;
  fechaLimite: string;
  codigoInvitacion: string;
  integrantes: IntegranteProyecto[];
  tareas: TareaGrupal[];
};

export type Examen = {
  id: string;
  cursoId: string;
  titulo: string;
  fecha: string;
  hora: string;
  temas: string[];
  preparacion: number;
};

export type BloquePlanificador = {
  id: string;
  dia: number;
  horaInicio: number;
  duracion: number;
  titulo: string;
  cursoId?: string;
  color: string;
  tipo: TipoBloquePlanificador;
};

export type NotificacionItem = {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  creadaEn: string;
  noLeida: boolean;
};

export type AlertaInteligente = {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: "critica" | "alta" | "media";
  tipo: "tarea" | "examen";
  destino: string;
  tareaId?: string;
  examenId?: string;
  cursoId?: string;
};

export type MensajeChat = {
  id: string;
  tipo: "user" | "ai";
  mensaje: string;
  hora: string;
};

export type ResultadoPlanificacionInteligente = {
  ok: boolean;
  mensaje: string;
  resumen: string[];
  bloquesCreados: number;
  horasProgramadas: number;
  totalHorasSolicitadas?: number;
  bloquesPrevistos?: BloquePlanificador[];
  bloquesFinales?: BloquePlanificador[];
  descripcionAplicacion?: string;
};
