export function mapearUsuario(row) {
  if (!row) return null;

  return {
    id: row.id,
    nombres: row.nombres,
    apellidos: row.apellidos,
    correo: row.correo,
    universidad: row.universidad,
    carrera: row.carrera,
    semestre: row.semestre,
    plan: row.plan ?? "gratis",
    tipoPerfil: row.tipoPerfil ?? "universitario",
    objetivoAcademico: row.objetivoAcademico ?? "aprobar_cursos",
    preferenciaMicroSesion: row.preferenciaMicroSesion ?? 20,
    horarioLaboral: row.horarioLaboral ?? null,
    diasMayorDisponibilidad: row.diasMayorDisponibilidad ?? null,
    tieneTesisProyecto: row.tieneTesisProyecto ?? false,
    tiempoRealDisponibleDia: row.tiempoRealDisponibleDia ?? null,
    emailVerificado: row.emailVerificado ?? false,
    horasDisponibles: row.horasDisponibles ?? null,
    metodoEstudio: row.metodoEstudio ?? null,
    tonoAsistente: row.tonoAsistente ?? "responsable",
    metas: row.metas ?? null,
    horasEstudioDiarias: row.horasEstudioDiarias ?? null,
    horasSueno: row.horasSueno ?? null,
    notificaciones: {
      tareas: row.notificacionesTareas ?? true,
      examenes: row.notificacionesExamenes ?? true,
      ia: row.notificacionesIa ?? true,
      semanal: row.notificacionesSemanal ?? true,
      correo: row.notificacionesCorreo ?? false,
    },
    aplicacion: {
      modoOscuro: row.aplicacionModoOscuro ?? false,
      googleCalendar: row.aplicacionGoogleCalendar ?? false,
      sugerenciasAutomaticas: row.aplicacionSugerenciasAutomaticas ?? true,
    },
  };
}

export function mapearCurso(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    docente: row.docente,
    horario: row.horario,
    semestre: row.semestre,
    color: row.color,
    descripcion: row.descripcion,
  };
}

export function mapearTarea(row) {
  return {
    id: row.id,
    cursoId: row.cursoId,
    titulo: row.titulo,
    descripcion: row.descripcion,
    fechaEntrega: row.fechaEntrega,
    prioridad: row.prioridad,
    estado: row.estado,
    horasEstimadas: Number(row.horasEstimadas),
    progreso: row.progreso,
  };
}

export function mapearExamen(row) {
  return {
    id: row.id,
    cursoId: row.cursoId,
    titulo: row.titulo,
    fecha: row.fecha,
    hora: typeof row.hora === "string" ? row.hora.slice(0, 5) : row.hora,
    temas: row.temas ?? [],
    preparacion: row.preparacion,
  };
}

export function mapearBloque(row) {
  return {
    id: row.id,
    dia: row.dia,
    horaInicio: Number(row.horaInicio),
    duracion: Number(row.duracion),
    titulo: row.titulo,
    cursoId: row.cursoId ?? undefined,
    color: row.color,
    tipo: row.tipo,
  };
}

export function mapearNotificacion(row) {
  return {
    id: row.id,
    tipo: row.tipo,
    titulo: row.titulo,
    mensaje: row.mensaje,
    creadaEn: row.creadaEn,
    noLeida: row.noLeida,
  };
}

export function mapearMensajeChat(row) {
  return {
    id: row.id,
    tipo: row.tipo,
    mensaje: row.mensaje,
    hora: row.hora,
    creadaEn: row.creadaEn,
  };
}

export function mapearPasoProyectoLargo(row) {
  return {
    id: row.id,
    proyectoId: row.proyectoId,
    titulo: row.titulo,
    fase: row.fase,
    completado: row.completado,
  };
}

export function mapearProyectoLargo(row, pasos = []) {
  return {
    id: row.id,
    cursoId: row.cursoId ?? undefined,
    titulo: row.titulo,
    descripcion: row.descripcion ?? "",
    tipo: row.tipo,
    fechaLimite: row.fechaLimite,
    faseActual: row.faseActual,
    progreso: row.progreso,
    ultimoAvance: row.ultimoAvance,
    pasos,
  };
}

export function mapearIntegranteProyecto(row) {
  return {
    id: row.id,
    proyectoId: row.proyectoId,
    nombre: row.nombre,
    rol: row.rol ?? "Integrante",
  };
}

export function mapearTareaGrupal(row) {
  return {
    id: row.id,
    proyectoId: row.proyectoId,
    titulo: row.titulo,
    responsableId: row.responsableId ?? undefined,
    fechaLimite: row.fechaLimite,
    estado: row.estado,
    progreso: row.progreso,
  };
}

export function mapearProyectoGrupal(row, integrantes = [], tareas = []) {
  return {
    id: row.id,
    cursoId: row.cursoId ?? undefined,
    nombre: row.nombre,
    descripcion: row.descripcion ?? "",
    fechaLimite: row.fechaLimite,
    integrantes,
    tareas,
  };
}
