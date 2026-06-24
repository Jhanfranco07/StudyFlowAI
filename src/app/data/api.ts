const URL_API =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_URL ??
  "http://localhost:4000";
const TIEMPO_ESPERA_API = 35000;
const TIEMPO_ESPERA_API_LENTO = 70000;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type OpcionesRequest = RequestInit & {
  timeoutMs?: number;
};

function esUuidValido(valor: string | undefined) {
  return typeof valor === "string" && UUID_REGEX.test(valor);
}

function crearUuidCliente() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (caracter) => {
    const random = Math.floor(Math.random() * 16);
    const valor = caracter === "x" ? random : (random & 0x3) | 0x8;
    return valor.toString(16);
  });
}

async function request<T>(ruta: string, init?: OpcionesRequest): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    init?.timeoutMs ?? TIEMPO_ESPERA_API,
  );

  let response: Response;

  try {
    response = await fetch(`${URL_API}${ruta}`, {
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      ...init,
      signal: init?.signal ?? controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La solicitud tardo demasiado. Intenta otra vez en unos segundos.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    const texto = await response.text();
    if (texto) {
      let datos: { mensaje?: string; error?: string } | null = null;
      try {
        datos = JSON.parse(texto) as { mensaje?: string; error?: string };
      } catch {
        datos = null;
      }
      if (datos?.mensaje || datos?.error) {
        throw new Error(datos.mensaje || datos.error);
      }
    }
    throw new Error(texto || `Error HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type UsuarioApi = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: "estudiante" | "admin";
  universidad: string;
  carrera: string;
  semestre: string;
  plan: "gratis" | "estudiante" | "premium" | "premium_plus";
  tipoPerfil:
    | "universitario"
    | "instituto"
    | "posgrado"
    | "profesional_estudia"
    | "diplomado_maestria"
    | "segunda_especialidad";
  objetivoAcademico:
    | "aprobar_cursos"
    | "preparar_examenes"
    | "avanzar_tesis"
    | "terminar_proyecto_final"
    | "organizar_trabajo_estudio"
    | "mejorar_productividad";
  preferenciaMicroSesion: 15 | 20 | 30 | 45;
  horarioLaboral: string | null;
  diasMayorDisponibilidad: string | null;
  tieneTesisProyecto: boolean;
  tiempoRealDisponibleDia: number | null;
  emailVerificado: boolean;
  horasDisponibles: string | null;
  metodoEstudio: string | null;
  tonoAsistente: "frio" | "amigable" | "responsable" | null;
  metas: string | null;
  horasEstudioDiarias: number | null;
  horasSueno: number | null;
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

export type CursoApi = {
  id: string;
  nombre: string;
  docente: string;
  horario: string;
  semestre: string;
  color: string;
  descripcion: string;
};

export type TareaApi = {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  prioridad: "low" | "medium" | "high";
  estado: "pending" | "in-progress" | "completed" | "overdue";
  horasEstimadas: number;
  progreso: number;
  subtareas: Array<{
    id: string;
    tareaId: string;
    titulo: string;
    completada: boolean;
  }>;
};

export type ExamenApi = {
  id: string;
  cursoId: string;
  titulo: string;
  fecha: string;
  hora: string;
  temas: string[];
  preparacion: number;
};

export type BloquePlanificadorApi = {
  id: string;
  dia: number;
  horaInicio: number;
  duracion: number;
  titulo: string;
  cursoId?: string;
  color: string;
  tipo:
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
};

export type NotificacionApi = {
  id: string;
  tipo: "urgent" | "warning" | "info" | "success";
  titulo: string;
  mensaje: string;
  creadaEn: string;
  noLeida: boolean;
};

export type MensajeChatApi = {
  id: string;
  tipo: "user" | "ai";
  mensaje: string;
  hora: string;
  creadaEn?: string;
};

export type RespuestaChatApi = {
  mensajes: MensajeChatApi[];
  fuente: "openai" | "groq" | "sistema";
};

export type ContextoApi = {
  usuario: UsuarioApi | null;
  cursos: CursoApi[];
  tareas: TareaApi[];
  examenes: ExamenApi[];
  bloquesPlanificador: BloquePlanificadorApi[];
  notificaciones: NotificacionApi[];
  mensajesChat: MensajeChatApi[];
  proyectosLargos: ProyectoLargoApi[];
  proyectosGrupales: ProyectoGrupalApi[];
};

export type ProyectoLargoApi = {
  id: string;
  cursoId?: string;
  titulo: string;
  descripcion: string;
  tipo: "tesis" | "proyecto_final" | "investigacion" | "articulo" | "exposicion_grande" | "caso_negocio" | "otro";
  fechaLimite: string;
  faseActual: "investigacion" | "estructura" | "redaccion" | "revision" | "entrega";
  progreso: number;
  ultimoAvance: string;
  pasos: Array<{
    id: string;
    proyectoId: string;
    titulo: string;
    fase: "investigacion" | "estructura" | "redaccion" | "revision" | "entrega";
    completado: boolean;
  }>;
};

export type ProyectoGrupalApi = {
  id: string;
  cursoId?: string;
  nombre: string;
  descripcion: string;
  fechaLimite: string;
  codigoInvitacion: string;
  integrantes: Array<{
    id: string;
    proyectoId: string;
    nombre: string;
    rol: string;
    rolPermiso: "admin" | "editor" | "responsable" | "lector";
  }>;
  tareas: Array<{
    id: string;
    proyectoId: string;
    titulo: string;
    responsableId?: string;
    fechaLimite: string;
    estado: "pendiente" | "en_proceso" | "en_revision" | "finalizado";
    progreso: number;
  }>;
};

export type RespuestaInicioSesionApi = {
  usuario: UsuarioApi | null;
  requiereCompletarPerfilAcademico?: boolean;
};

export type AdminMetricsApi = {
  totalUsuarios: number;
  totalUsuariosVerificados: number;
  totalCursos: number | null;
  totalTareas: number | null;
  totalExamenes: number | null;
  totalProyectosLargos: number | null;
  totalTrabajosGrupales: number | null;
  totalNotificaciones: number | null;
  usuariosPorPlan: Array<{ plan: UsuarioApi["plan"]; total: number }>;
  usuariosPorVerificacion: Array<{ estado: "verificado" | "no_verificado"; total: number }>;
  usuariosPorRol: Array<{ rol: UsuarioApi["rol"]; total: number }>;
  tareasPorEstado: Array<{ estado: "pending" | "in-progress" | "completed" | "overdue"; total: number }>;
  usuariosPorMetodoEstudio: Array<{ metodo: string; total: number }>;
  usuariosPorTonoAsistente: Array<{ tono: "frio" | "amigable" | "responsable" | "sin_definir"; total: number }>;
  usuariosPorObjetivo: Array<{ objetivo: UsuarioApi["objetivoAcademico"]; total: number }>;
  usuariosPorTipoPerfil: Array<{ tipo: UsuarioApi["tipoPerfil"]; total: number }>;
  usuariosPorMicroSesion: Array<{ duracion: number; total: number }>;
  usuariosRecientes: number;
  porcentajeVerificacion: number;
  promedioCursosPorUsuario: number;
  promedioTareasPorUsuario: number;
  promedioExamenesPorUsuario: number;
};

export type AdminUserApi = {
  id: string;
  nombre: string;
  correo: string;
  rol: "estudiante" | "admin";
  emailVerificado: boolean;
  plan: UsuarioApi["plan"];
  creadoEn: string;
  totalCursos?: number;
  totalTareas?: number;
  totalExamenes?: number;
};

export type AdminUserDetailApi = AdminUserApi & {
  universidad: string;
  carrera: string;
  semestre: string;
  tipoPerfil: UsuarioApi["tipoPerfil"];
  objetivoAcademico: UsuarioApi["objetivoAcademico"];
  preferenciaMicroSesion: UsuarioApi["preferenciaMicroSesion"];
  horarioLaboral: string | null;
  diasMayorDisponibilidad: string | null;
  tieneTesisProyecto: boolean;
  tiempoRealDisponibleDia: number | null;
  horasDisponibles: string | null;
  metodoEstudio: string | null;
  tonoAsistente: UsuarioApi["tonoAsistente"];
  metas: string | null;
  horasEstudioDiarias: number | null;
  horasSueno: number | null;
  cursos: Array<{ id: string; nombre: string; docente: string; semestre: string; color: string }>;
  tareas: Array<{
    titulo: string;
    prioridad: "low" | "medium" | "high";
    estado: "pending" | "in-progress" | "completed" | "overdue";
    progreso: number;
    fechaEntrega: string;
  }>;
  examenes: Array<{ titulo: string; fecha: string; preparacion: number }>;
  totalNotificaciones: number;
  totalProyectosLargos: number;
  totalTrabajosGrupales: number;
};

function crearHeadersAdmin(adminId: string) {
  return {
    "x-studyflow-user-id": adminId,
  };
}

export const api = {
  iniciarSesion(payload: { correo: string; contrasena: string }) {
    return request<RespuestaInicioSesionApi>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      timeoutMs: TIEMPO_ESPERA_API_LENTO,
    });
  },
  iniciarSesionConGoogle(payload: { credential: string }) {
    return request<RespuestaInicioSesionApi>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(payload),
      timeoutMs: TIEMPO_ESPERA_API_LENTO,
    });
  },
  registrarUsuario(payload: {
    nombres: string;
    apellidos: string;
    correo: string;
    contrasena: string;
    universidad: string;
    carrera: string;
    semestre: string;
    plan: "gratis" | "estudiante" | "premium" | "premium_plus";
    tipoPerfil?: UsuarioApi["tipoPerfil"];
  }) {
    return request<{ usuario: UsuarioApi; verificacionCorreoEnviada?: boolean }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  verificarCorreo(payload: { token: string }) {
    return request<{ usuario: UsuarioApi }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  reenviarVerificacionCorreo(payload: { estudianteId: string }) {
    return request<{ ok: boolean; yaVerificado?: boolean; omitido?: boolean }>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  obtenerContexto(estudianteId: string) {
    return request<ContextoApi>(`/api/contexto/${estudianteId}`, {
      timeoutMs: TIEMPO_ESPERA_API_LENTO,
    });
  },
  actualizarPerfil(
    estudianteId: string,
    payload: Partial<UsuarioApi>,
  ) {
    return request<{ usuario: UsuarioApi }>(`/api/perfil/${estudianteId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      timeoutMs: TIEMPO_ESPERA_API_LENTO,
    });
  },
  crearCurso(payload: {
    estudianteId: string;
    nombre: string;
    docente: string;
    horario: string;
    semestre: string;
    color: string;
    descripcion: string;
  }) {
    return request<CursoApi>("/api/cursos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  actualizarCurso(
    cursoId: string,
    payload: Partial<{
      nombre: string;
      docente: string;
      horario: string;
      semestre: string;
      color: string;
      descripcion: string;
    }>,
  ) {
    return request<CursoApi>(`/api/cursos/${cursoId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  eliminarCurso(cursoId: string) {
    return request<{ ok: true }>(`/api/cursos/${cursoId}`, {
      method: "DELETE",
    });
  },
  crearTarea(payload: {
    estudianteId: string;
    cursoId: string;
    titulo: string;
    descripcion: string;
    fechaEntrega: string;
    prioridad: "low" | "medium" | "high";
    horasEstimadas: number;
  }) {
    return request<TareaApi>("/api/tareas", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  crearExamen(payload: {
    estudianteId: string;
    cursoId: string;
    titulo: string;
    fecha: string;
    hora: string;
    temas: string[];
    preparacion: number;
  }) {
    return request<ExamenApi>("/api/examenes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  actualizarExamen(
    examenId: string,
    payload: Partial<{
      cursoId: string;
      titulo: string;
      fecha: string;
      hora: string;
      temas: string[];
      preparacion: number;
    }>,
  ) {
    return request<ExamenApi>(`/api/examenes/${examenId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  eliminarExamen(examenId: string) {
    return request<{ ok: true }>(`/api/examenes/${examenId}`, {
      method: "DELETE",
    });
  },
  actualizarTarea(
    tareaId: string,
    payload: Partial<{
      cursoId: string;
      titulo: string;
      descripcion: string;
      fechaEntrega: string;
      prioridad: "low" | "medium" | "high";
      estado: "pending" | "in-progress" | "completed" | "overdue";
      horasEstimadas: number;
      progreso: number;
    }>,
  ) {
    return request<TareaApi>(`/api/tareas/${tareaId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  eliminarTarea(tareaId: string) {
    return request<{ ok: true }>(`/api/tareas/${tareaId}`, {
      method: "DELETE",
    });
  },
  crearSubtarea(tareaId: string, payload: { titulo: string }) {
    return request<TareaApi>(`/api/tareas/${tareaId}/subtareas`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  actualizarSubtarea(subtareaId: string, payload: { titulo?: string; completada?: boolean }) {
    return request<TareaApi>(`/api/subtareas/${subtareaId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  eliminarSubtarea(subtareaId: string) {
    return request<TareaApi>(`/api/subtareas/${subtareaId}`, {
      method: "DELETE",
    });
  },
  guardarPlanificador(estudianteId: string, bloques: BloquePlanificadorApi[]) {
    const bloquesPersistibles = bloques.map((bloque) => ({
      ...bloque,
      id: esUuidValido(bloque.id) ? bloque.id : crearUuidCliente(),
      cursoId: esUuidValido(bloque.cursoId) ? bloque.cursoId : undefined,
    }));

    return request<{ bloques: BloquePlanificadorApi[] }>(`/api/planificador/${estudianteId}`, {
      method: "POST",
      body: JSON.stringify({ bloques: bloquesPersistibles }),
      timeoutMs: TIEMPO_ESPERA_API_LENTO,
    });
  },
  crearNotificacion(payload: {
    estudianteId: string;
    tipo: "urgent" | "warning" | "info" | "success";
    titulo: string;
    mensaje: string;
    noLeida?: boolean;
  }) {
    return request<NotificacionApi>("/api/notificaciones", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  actualizarNotificacion(notificacionId: string, payload: { noLeida: boolean }) {
    return request<NotificacionApi>(`/api/notificaciones/${notificacionId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  marcarTodasLasNotificacionesLeidas(estudianteId: string) {
    return request<{ ok: true }>(`/api/notificaciones/leer-todas/${estudianteId}`, {
      method: "PATCH",
    });
  },
  limpiarNotificacionesLeidas(estudianteId: string) {
    return request<{ ok: true }>(`/api/notificaciones/leidas/${estudianteId}`, {
      method: "DELETE",
    });
  },
  enviarMensajeAsistente(estudianteId: string, mensaje: string) {
    return request<RespuestaChatApi>(`/api/chat/${estudianteId}`, {
      method: "POST",
      body: JSON.stringify({ mensaje }),
    });
  },
  limpiarMensajesAsistente(estudianteId: string) {
    return request<{ ok: true }>(`/api/chat/${estudianteId}`, {
      method: "DELETE",
    });
  },
  obtenerProyectosLargos(estudianteId: string) {
    return request<ProyectoLargoApi[]>(`/api/proyectos-largos/${estudianteId}`);
  },
  crearProyectoLargo(payload: {
    estudianteId: string;
    cursoId?: string;
    titulo: string;
    descripcion: string;
    tipo: ProyectoLargoApi["tipo"];
    fechaLimite: string;
  }) {
    return request<ProyectoLargoApi>("/api/proyectos-largos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  actualizarProyectoLargo(proyectoId: string, payload: Partial<ProyectoLargoApi>) {
    return request<ProyectoLargoApi>(`/api/proyectos-largos/${proyectoId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  eliminarProyectoLargo(proyectoId: string) {
    return request<{ ok: true }>(`/api/proyectos-largos/${proyectoId}`, {
      method: "DELETE",
    });
  },
  crearPasoProyectoLargo(proyectoId: string, payload: { titulo: string; fase: ProyectoLargoApi["faseActual"] }) {
    return request<ProyectoLargoApi>(`/api/proyectos-largos/${proyectoId}/pasos`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  actualizarPasoProyectoLargo(pasoId: string, payload: { completado?: boolean; titulo?: string; fase?: ProyectoLargoApi["faseActual"] }) {
    return request<ProyectoLargoApi>(`/api/proyectos-largos/pasos/${pasoId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  obtenerTrabajosGrupales(estudianteId: string) {
    return request<ProyectoGrupalApi[]>(`/api/trabajos-grupales/${estudianteId}`);
  },
  crearTrabajoGrupal(payload: {
    estudianteId: string;
    cursoId?: string;
    nombre: string;
    descripcion: string;
    fechaLimite: string;
  }) {
    return request<ProyectoGrupalApi>("/api/trabajos-grupales", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  actualizarTrabajoGrupal(proyectoId: string, payload: Partial<ProyectoGrupalApi>) {
    return request<ProyectoGrupalApi>(`/api/trabajos-grupales/${proyectoId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  eliminarTrabajoGrupal(proyectoId: string) {
    return request<{ ok: true }>(`/api/trabajos-grupales/${proyectoId}`, {
      method: "DELETE",
    });
  },
  agregarIntegranteTrabajoGrupal(
    proyectoId: string,
    payload: { nombre: string; rol: string; rolPermiso?: "admin" | "editor" | "responsable" | "lector" },
  ) {
    return request<ProyectoGrupalApi>(`/api/trabajos-grupales/${proyectoId}/integrantes`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  crearTareaTrabajoGrupal(
    proyectoId: string,
    payload: { titulo: string; responsableId?: string; fechaLimite: string },
  ) {
    return request<ProyectoGrupalApi>(`/api/trabajos-grupales/${proyectoId}/tareas`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  actualizarTareaTrabajoGrupal(
    tareaId: string,
    payload: { estado?: ProyectoGrupalApi["tareas"][number]["estado"]; progreso?: number; responsableId?: string },
  ) {
    return request<ProyectoGrupalApi>(`/api/trabajos-grupales/tareas/${tareaId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  sugerirMicroSesion(estudianteId: string) {
    return request<{ duracion: number; mensaje: string; tareaId?: string }>(`/api/micro-sesiones/${estudianteId}/sugerir`, {
      method: "POST",
    });
  },
  agendarMicroSesion(estudianteId: string, payload: { duracion: number; titulo?: string; tareaId?: string }) {
    return request<{ bloque: BloquePlanificadorApi; mensaje: string }>(`/api/micro-sesiones/${estudianteId}/agendar`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  obtenerMetricasAdmin(adminId: string) {
    return request<AdminMetricsApi>("/api/admin/metrics", {
      headers: crearHeadersAdmin(adminId),
      timeoutMs: TIEMPO_ESPERA_API_LENTO,
    });
  },
  obtenerUsuariosAdmin(adminId: string) {
    return request<AdminUserApi[]>("/api/admin/users", {
      headers: crearHeadersAdmin(adminId),
      timeoutMs: TIEMPO_ESPERA_API_LENTO,
    });
  },
  obtenerDetalleUsuarioAdmin(adminId: string, userId: string) {
    return request<AdminUserDetailApi>(`/api/admin/users/${userId}`, {
      headers: crearHeadersAdmin(adminId),
      timeoutMs: TIEMPO_ESPERA_API_LENTO,
    });
  },
  cambiarRolUsuarioAdmin(adminId: string, userId: string, rol: AdminUserApi["rol"]) {
    return request<AdminUserApi>(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: crearHeadersAdmin(adminId),
      body: JSON.stringify({ rol }),
    });
  },
  cambiarPlanUsuarioAdmin(adminId: string, userId: string, plan: UsuarioApi["plan"]) {
    return request<AdminUserApi>(`/api/admin/users/${userId}/plan`, {
      method: "PATCH",
      headers: crearHeadersAdmin(adminId),
      body: JSON.stringify({ plan }),
    });
  },
};
