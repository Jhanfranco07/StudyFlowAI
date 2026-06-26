import "dotenv/config";
import cors from "cors";
import express from "express";
import { OAuth2Client } from "google-auth-library";
import pkg from "pg";
import {
  crearHashContrasena,
  crearHashTemporalGoogle,
  crearHashToken,
  crearTokenSeguro,
  esHashSeguroContrasena,
  obtenerNombreYApellidosGoogle,
  requiereCompletarPerfilAcademico,
  verificarContrasena,
} from "./auth-utils.js";
import {
  construirCorreoBienvenida,
  construirCorreoNotificacion,
  construirCorreoVerificacion,
  enviarCorreo,
} from "./email-service.js";
import {
  generarRespuestaProveedorIA,
  hayClienteIAConfigurado,
  obtenerModeloIAActivo,
  obtenerProveedorIAActivo,
} from "./ai-service.js";
import {
  mapearBloque,
  mapearChecklistTareaGrupal,
  mapearComentarioTareaGrupal,
  mapearCurso,
  mapearExamen,
  mapearMensajeChat,
  mapearNotificacion,
  mapearSubtarea,
  mapearIntegranteProyecto,
  mapearPasoProyectoLargo,
  mapearProyectoGrupal,
  mapearProyectoLargo,
  mapearTarea,
  mapearTareaGrupal,
  mapearUsuario,
} from "./mappers.js";

const { Pool } = pkg;

const app = express();
const puerto = Number(process.env.PORT || 4000);
const urlBaseDeDatos = process.env.DATABASE_URL;
const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;

app.use(cors());
app.use(express.json());

const pool = urlBaseDeDatos ? new Pool({ connectionString: urlBaseDeDatos }) : null;
const clienteGoogle = googleClientId ? new OAuth2Client(googleClientId) : null;

async function enviarVerificacionCorreo({ estudianteId, nombres, correo, tipo = "registro" }) {
  if (!pool) return { ok: false, omitido: true };

  const token = crearTokenSeguro();
  const tokenHash = crearHashToken(token);
  const expira = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await pool.query(
    `
    update estudiantes
    set email_verificacion_token = $1,
        email_verificacion_expira = $2
    where id = $3
    `,
    [tokenHash, expira, estudianteId],
  );

  const correoVerificacion = construirCorreoVerificacion({ nombres, token, tipo });
  return enviarCorreo({
    para: correo,
    asunto: correoVerificacion.asunto,
    html: correoVerificacion.html,
    texto: correoVerificacion.texto,
  });
}

async function enviarBienvenidaCorreo({ nombres, correo }) {
  const correoBienvenida = construirCorreoBienvenida({ nombres });
  return enviarCorreo({
    para: correo,
    asunto: correoBienvenida.asunto,
    html: correoBienvenida.html,
    texto: correoBienvenida.texto,
  });
}

async function enviarNotificacionCorreoSiCorresponde(estudianteId, notificacion) {
  if (!pool) return;

  try {
    const resultado = await pool.query(
      `
      select
        nombres,
        correo,
        notif_correo as "notificacionesCorreo",
        email_verificado as "emailVerificado"
      from estudiantes
      where id = $1
      limit 1
      `,
      [estudianteId],
    );

    const usuario = resultado.rows[0];
    if (!usuario?.notificacionesCorreo || !usuario?.emailVerificado) {
      return;
    }

    const correoNotificacion = construirCorreoNotificacion(notificacion);
    await enviarCorreo({
      para: usuario.correo,
      asunto: correoNotificacion.asunto,
      html: correoNotificacion.html,
      texto: correoNotificacion.texto,
    });
  } catch (error) {
    console.warn("[email] No se pudo enviar notificacion por correo:", error.message);
  }
}

function responderSinBase(response) {
  response.status(500).json({ mensaje: "DATABASE_URL no configurada." });
}

function construirInstruccionTono(tonoAsistente) {
  if (tonoAsistente === "amigable") {
    return "Adopta un tono amigable, cercano y alentador desde la primera respuesta. Usa al menos 1 emoji en casi todas las respuestas casuales, de saludo o de apoyo, y puedes llegar a 2 si suma calidez o claridad, sin exagerar ni sonar infantil. Habla como un asistente cercano para un estudiante peruano: usa de forma natural giros ligeros como 'bacan', 'tranqui', 'de una', 'todo bien', 'pilas', 'ojo' o 'chevere'. En saludos o respuestas breves, evita sonar neutro o demasiado formal; entra en confianza desde el arranque.";
  }

  if (tonoAsistente === "frio") {
    return "Adopta un tono frio, sobrio y directo. Ve al punto, evita emojis y reduce al minimo el lenguaje emocional.";
  }

  return "Adopta un tono responsable, claro y sereno. Organiza bien las ideas, prioriza utilidad practica y evita el exceso de emojis o informalidad.";
}

function convertirFechaAOrdenable(valor) {
  if (!valor) return "";
  if (typeof valor === "string") return valor;
  if (valor instanceof Date) return valor.toISOString();
  return String(valor);
}

function formatearFechaRespuesta(valor) {
  if (!valor) return "sin fecha";
  const fecha = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha);
}

function normalizarTexto(valor) {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function obtenerInicioDelDiaActual() {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

function obtenerEstadoVisualTarea(tarea) {
  if (!tarea) return "pending";
  if (tarea.estado === "completed") {
    return "completed";
  }

  const fechaEntrega = tarea.fechaEntrega ? new Date(tarea.fechaEntrega) : null;
  if (fechaEntrega && !Number.isNaN(fechaEntrega.getTime()) && fechaEntrega < obtenerInicioDelDiaActual()) {
    return "overdue";
  }

  return tarea.estado ?? "pending";
}

function describirEstadoTarea(estado) {
  const mapaEstados = {
    pending: "pendiente",
    "in-progress": "en progreso",
    completed: "completada",
    overdue: "atrasada (ya vencio)",
  };

  return mapaEstados[estado] ?? String(estado || "pendiente");
}

function ordenarTareasPorUrgencia(a, b) {
  const prioridadEstado = {
    overdue: 0,
    "in-progress": 1,
    pending: 2,
    completed: 3,
  };
  const estadoA = a.estadoVisual ?? obtenerEstadoVisualTarea(a);
  const estadoB = b.estadoVisual ?? obtenerEstadoVisualTarea(b);
  const diferenciaEstado = (prioridadEstado[estadoA] ?? 9) - (prioridadEstado[estadoB] ?? 9);

  if (diferenciaEstado !== 0) {
    return diferenciaEstado;
  }

  return convertirFechaAOrdenable(a.fechaEntrega).localeCompare(convertirFechaAOrdenable(b.fechaEntrega));
}

function limpiarMarcadoresHerramientas(texto) {
  return String(texto || "")
    .replace(/<function(?:=|:)\s*[a-z_][a-z0-9_:-]*[^>]*>/gi, "")
    .replace(/<\/function>/gi, "")
    .replace(/<tool(?:=|:)\s*[a-z_][a-z0-9_:-]*[^>]*>/gi, "")
    .replace(/<\/tool>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extraerHerramientasSolicitadasEnTexto(texto, herramientasLocales) {
  const herramientas = new Set();
  const patronFuncion = /<function(?:=|:)\s*([a-z_][a-z0-9_]*)[^>]*>/gi;
  let coincidencia = patronFuncion.exec(texto || "");

  while (coincidencia) {
    const nombre = coincidencia[1];
    if (nombre && typeof herramientasLocales[nombre] === "function") {
      herramientas.add(nombre);
    }
    coincidencia = patronFuncion.exec(texto || "");
  }

  return [...herramientas];
}

function detectarSolicitudPreguntasPractica(mensaje) {
  const texto = normalizarTexto(mensaje || "");
  return (
    texto.includes("preguntas de práctica") ||
    texto.includes("pregunta de practica") ||
    texto.includes("practiquemos") ||
    (texto.includes("hazme preguntas") && texto.includes("practica"))
  );
}

function encontrarCursoMencionado(mensaje, cursos) {
  const texto = normalizarTexto(mensaje || "");
  return cursos.find((curso) => texto.includes(normalizarTexto(curso.nombre))) ?? null;
}

function detectarSolicitudPreguntasPracticaAmbigua(mensaje, cursos) {
  const pidePractica = detectarSolicitudPreguntasPractica(mensaje);

  if (!pidePractica) {
    return false;
  }

  return !encontrarCursoMencionado(mensaje, cursos);
}

function construirRespuestaAclaratoriaPractica(contexto) {
  const cursos = deduplicarPorClave(contexto.cursos, (curso) => `${curso.nombre}-${curso.docente}-${curso.horario}`).slice(0, 4);

  if (!cursos.length) {
    return "Claro. Puedo hacerte preguntas de práctica, pero primero dime de que curso o tema quieres que sean.";
  }

  return `Claro. Te hago preguntas de práctica, pero primero dime de que curso quieres que sean.\n\nPuedes elegir uno de estos: ${cursos.map((curso) => curso.nombre).join(", ")}.`;
}

function textoIncluyeAlguno(texto, terminos) {
  return terminos.some((termino) => texto.includes(termino));
}

function detectarConsultaDirectaCursos(mensaje) {
  const texto = normalizarTexto(mensaje || "");
  return textoIncluyeAlguno(texto, [
    "cuantos cursos",
    "cuantos curso",
    "que cursos tengo",
    "cuales son mis cursos",
    "que materias tengo",
    "cuales son mis materias",
  ]);
}

function detectarConsultaDirectaTareas(mensaje) {
  const texto = normalizarTexto(mensaje || "");
  return textoIncluyeAlguno(texto, [
    "cuantas tareas",
    "cuantas tarea",
    "cuantos pendientes tengo",
    "que tareas tengo",
    "cuales son mis tareas",
    "que pendientes tengo",
    "cuantas tareas tengo",
    "cuantos pendientes",
  ]);
}

function detectarConsultaDirectaExamenes(mensaje) {
  const texto = normalizarTexto(mensaje || "");
  return textoIncluyeAlguno(texto, [
    "cuantos examenes",
    "cuantos examenes tengo",
    "que examenes tengo",
    "cuales son mis examenes",
    "que evaluaciones tengo",
  ]);
}

function unirListaNatural(elementos) {
  const lista = elementos.filter(Boolean);
  if (!lista.length) return "";
  if (lista.length === 1) return lista[0];
  if (lista.length === 2) return `${lista[0]} y ${lista[1]}`;
  return `${lista.slice(0, -1).join(", ")} y ${lista[lista.length - 1]}`;
}

function obtenerCursosUnicos(contexto) {
  return deduplicarPorClave(contexto.cursos, (curso) => `${curso.nombre}-${curso.docente}-${curso.horario}`);
}

function obtenerCursoPrioritario(contexto) {
  const { tareasAtrasadas, tareasPendientes, examenesProximos } = construirDatosHerramientas(contexto);
  const cursoIdPrioritario =
    tareasAtrasadas[0]?.cursoId ??
    tareasPendientes[0]?.cursoId ??
    examenesProximos[0]?.cursoId ??
    contexto.cursos[0]?.id;

  return contexto.cursos.find((curso) => curso.id === cursoIdPrioritario) ?? null;
}

function obtenerCursoRelevante(mensaje, contexto) {
  return encontrarCursoMencionado(mensaje, contexto.cursos) ?? obtenerCursoPrioritario(contexto);
}

function obtenerTemasCurso(contexto, curso) {
  if (!curso) return [];

  return deduplicarPorClave(
    [
      ...contexto.examenes
        .filter((examen) => examen.cursoId === curso.id)
        .flatMap((examen) => examen.temas ?? []),
      ...contexto.tareas
        .filter((tarea) => tarea.cursoId === curso.id)
        .map((tarea) => tarea.titulo),
    ].filter(Boolean),
    (tema) => normalizarTexto(tema),
  ).slice(0, 4);
}

function construirPrioridadesSistema(contexto, limite = 3) {
  const { cursosPorId, tareasPendientes, tareasAtrasadas, examenesProximos } = construirDatosHerramientas(contexto);

  return [
    ...tareasAtrasadas.map(
      (tarea) =>
        `${tarea.titulo} en ${cursosPorId.get(tarea.cursoId)?.nombre ?? "Curso no identificado"} (atrasada)`,
    ),
    ...tareasPendientes.map(
      (tarea) =>
        `${tarea.titulo} en ${cursosPorId.get(tarea.cursoId)?.nombre ?? "Curso no identificado"} para ${formatearFechaRespuesta(tarea.fechaEntrega)}`,
    ),
    ...examenesProximos.map(
      (examen) =>
        `${examen.titulo} de ${cursosPorId.get(examen.cursoId)?.nombre ?? "Curso no identificado"} el ${formatearFechaRespuesta(examen.fecha)}`,
    ),
  ].slice(0, limite);
}

function construirPlanEstudioSistema(contexto) {
  const prioridades = construirPrioridadesSistema(contexto, 3);
  const bloquesEstudio = contexto.bloquesPlanificador.filter((bloque) => bloque.tipo === "study");

  if (!prioridades.length) {
    return "Tu panel no muestra urgencias inmediatas. Puedes dedicar hoy un bloque corto a repasar apuntes, ordenar pendientes y dejar lista la siguiente sesión de estudio.";
  }

  const recomendaciones = [
    `1. Empieza por ${prioridades[0]}.`,
    prioridades[1] ? `2. Luego avanza con ${prioridades[1]}.` : "2. Usa el segundo bloque para repaso activo o ejercicios cortos.",
    bloquesEstudio.length
      ? `3. Ya tienes ${bloquesEstudio.length} bloque${bloquesEstudio.length === 1 ? "" : "s"} de estudio guardado${bloquesEstudio.length === 1 ? "" : "s"}; aprovecha esos bloques para cerrar el día con repaso breve.`
      : "3. Si puedes, reserva hoy un bloque de 45 a 60 minutos para consolidar lo más urgente.",
  ];

  return recomendaciones.join("\n");
}

function construirResumenSistema({ mensaje, contexto }) {
  const curso = obtenerCursoRelevante(mensaje, contexto);
  const temas = obtenerTemasCurso(contexto, curso);

  if (!curso) {
    const prioridades = construirPrioridadesSistema(contexto, 3);
    return (
      "Puedo darte un resumen rápido aunque el proveedor de IA se esté demorando. Ahora mismo tu mejor enfoque es este: " +
      `${prioridades.length ? unirListaNatural(prioridades) : "ordenar tus temas y pendientes principales"}.`
    );
  }

  if (!temas.length) {
    return (
      `Resumen rápido para ${curso.nombre}: enfócate en conceptos base, aplicaciones prácticas y repaso activo. ` +
      "Haz una pasada corta de teoría, luego un ejemplo resuelto y cierra explicando el tema con tus propias palabras."
    );
  }

  return (
    `Resumen rápido para ${curso.nombre}: ahora mismo conviene enfocarte en ${unirListaNatural(temas)}. ` +
    "Para estudiarlo bien, define cada tema en una frase, compáralo con los otros, resuelve un ejemplo por tema y termina con una autoexplicación sin mirar tus apuntes."
  );
}

function construirExplicacionSistema({ mensaje, contexto }) {
  const curso = obtenerCursoRelevante(mensaje, contexto);
  const temas = obtenerTemasCurso(contexto, curso);
  const temaPrincipal = temas[0];

  if (curso && temaPrincipal) {
    return (
      `Te doy una explicación corta y segura mientras vuelve el proveedor de IA: en ${curso.nombre}, un buen modo de entender ${temaPrincipal} es dividirlo en cuatro partes: qué es, para qué sirve, cuál es el procedimiento o lógica principal y qué error suele cometerse al aplicarlo. ` +
      `Si estudias ${temaPrincipal} con ese esquema y luego lo conectas con ${temas[1] ?? "un ejemplo práctico"}, ya tendrás una base bastante sólida.`
    );
  }

  return (
    "Te doy una explicación útil mientras el proveedor de IA se demora: para entender cualquier tema rápido, sepáralo en definición, objetivo, pasos clave, ejemplo y errores comunes. " +
    "Si me dices el curso o el tema exacto, te lo bajo a un formato mucho más concreto."
  );
}

function construirRespuestaGeneralSistema({ contexto, detalleError }) {
  const prioridades = construirPrioridadesSistema(contexto, 3);
  const cursos = obtenerCursosUnicos(contexto).slice(0, 3).map((curso) => curso.nombre);

  return (
    `El proveedor de IA se está demorando más de lo normal${detalleError ? ` (${detalleError})` : ""}, pero no te dejo sin respuesta. ` +
    `${prioridades.length ? `Ahora mismo tus focos más claros son ${unirListaNatural(prioridades)}. ` : ""}` +
    `${cursos.length ? `También puedo ayudarte con ${unirListaNatural(cursos)}. ` : ""}` +
    "Si quieres, te organizo la semana, te resumo un tema, te doy prioridades o te hago preguntas de práctica."
  );
}

function construirRespuestaDirectaPanel({ mensaje, contexto }) {
  const cursos = obtenerCursosUnicos(contexto);
  const { cursosPorId, tareasActivas, tareasPendientes, tareasAtrasadas, examenesProximos } =
    construirDatosHerramientas(contexto);

  if (detectarConsultaDirectaCursos(mensaje)) {
    if (!cursos.length) {
      return "Ahora mismo no veo cursos registrados en tu panel.";
    }

    return `Ahora mismo tienes ${cursos.length} curso${cursos.length === 1 ? "" : "s"}: ${unirListaNatural(
      cursos.slice(0, 6).map((curso) => curso.nombre),
    )}.`;
  }

  if (detectarConsultaDirectaTareas(mensaje)) {
    if (!tareasActivas.length) {
      return "Ahora mismo no tienes tareas activas registradas.";
    }

    const muestra = tareasActivas
      .slice(0, 3)
      .map(
        (tarea) =>
          `${tarea.titulo} en ${cursosPorId.get(tarea.cursoId)?.nombre ?? "Curso no identificado"}, para ${formatearFechaRespuesta(tarea.fechaEntrega)}`,
      )
      .join("; ");

    return `Ahora mismo tienes ${tareasActivas.length} tareas activas: ${tareasPendientes.length} pendientes vigentes y ${tareasAtrasadas.length} atrasadas. Las más cercanas son: ${muestra}.`;
  }

  if (detectarConsultaDirectaExamenes(mensaje)) {
    if (!examenesProximos.length) {
      return "Ahora mismo no veo exámenes próximos registrados.";
    }

    return `Tienes ${examenesProximos.length} examen${examenesProximos.length === 1 ? "" : "es"} próximo${examenesProximos.length === 1 ? "" : "s"}: ${unirListaNatural(
      examenesProximos.map(
        (examen) =>
          `${examen.titulo} de ${cursosPorId.get(examen.cursoId)?.nombre ?? "Curso no identificado"} el ${formatearFechaRespuesta(examen.fecha)}`,
      ),
    )}.`;
  }

  return null;
}

function construirRespuestaSistemaRapida({ mensaje, contexto, detalleError }) {
  const texto = normalizarTexto(mensaje || "");
  const cursoRelevante = obtenerCursoRelevante(mensaje, contexto);
  const { cursosPorId, tareasActivas, tareasPendientes, tareasAtrasadas, examenesProximos } =
    construirDatosHerramientas(contexto);

  if (textoIncluyeAlguno(texto, ["hola", "buenas", "buen dia", "buenas tardes", "buenas noches", "que tal"])) {
    return (
      `Hola. Mientras el proveedor de IA se demora, sigo viendo tu panel real: ${tareasActivas.length} tareas activas y ${examenesProximos.length} exámenes próximos. ` +
      `${cursoRelevante ? `Tu curso más prioritario ahora parece ser ${cursoRelevante.nombre}. ` : ""}` +
      "Si quieres, te organizo el día o te preparo práctica."
    );
  }

  if (textoIncluyeAlguno(texto, ["gracias", "muchas gracias", "thanks"])) {
    return "De nada. Aunque el proveedor de IA se demore, igual puedo seguir apoyándote con tareas, prioridades, planes de estudio y preguntas de práctica.";
  }

  if (textoIncluyeAlguno(texto, ["quien eres", "que puedes hacer", "en que me puedes ayudar", "ayudame"])) {
    const cursos = obtenerCursosUnicos(contexto).slice(0, 4).map((curso) => curso.nombre);
    return (
      "Soy StudyFlow AI. Incluso sin el proveedor de IA en este momento puedo ayudarte a revisar tareas, exámenes, prioridades, organizar tu semana, proponerte preguntas de práctica y darte resúmenes rápidos de enfoque. " +
      `${cursos.length ? `Ahora mismo tengo contexto de ${unirListaNatural(cursos)}.` : ""}`
    );
  }

  if (detectarSolicitudPreguntasPractica(mensaje)) {
    const curso =
      cursoRelevante ??
      obtenerCursosUnicos(contexto)[0];

    if (!curso) {
      return "El proveedor de IA se está demorando un poco. Mientras tanto, dime de qué curso o tema quieres las preguntas de práctica y te las preparo al toque.";
    }

    const temas = deduplicarPorClave(
      [
        ...contexto.examenes
          .filter((examen) => examen.cursoId === curso.id)
          .flatMap((examen) => examen.temas ?? []),
        ...contexto.tareas
          .filter((tarea) => tarea.cursoId === curso.id)
          .map((tarea) => tarea.titulo),
      ].filter(Boolean),
      (tema) => normalizarTexto(tema),
    ).slice(0, 3);

    const preguntas =
      temas.length > 0
        ? temas.map(
            (tema, indice) =>
              `${indice + 1}. Explícame ${tema} con tus palabras y dame un ejemplo aplicado a ${curso.nombre}.`,
          )
        : [
            `1. ¿Cuál dirías que es el concepto más importante de ${curso.nombre} y por qué?`,
            `2. ¿Cómo aplicarías un tema clave de ${curso.nombre} en un caso práctico o ejercicio real?`,
            `3. ¿Qué parte de ${curso.nombre} te cuesta más y cómo la explicarías paso a paso?`,
          ];

    return (
      `El proveedor de IA se está demorando más de lo normal, pero avancemos igual. Aquí van preguntas de práctica de ${curso.nombre}:\n\n` +
      `${preguntas.join("\n")}\n\n` +
      "Si quieres, en el siguiente mensaje te corrijo tus respuestas o te subo la dificultad."
    );
  }

  if (textoIncluyeAlguno(texto, ["organiza", "organizar", "plan", "planifica", "planificar", "semana", "hoy", "horario"])) {
    return (
      "El proveedor de IA se está demorando un poco, así que te dejo un plan rápido basado en tu contexto real:\n\n" +
      construirPlanEstudioSistema(contexto)
    );
  }

  if (texto.includes("tarea") || texto.includes("pendiente") || texto.includes("prioridad")) {
    if (!tareasActivas.length) {
      return "Ahora mismo no veo tareas activas registradas. Si quieres, puedo ayudarte a planificar la semana o revisar tus exámenes próximos.";
    }

    const resumen = tareasActivas
      .slice(0, 3)
      .map(
        (tarea) =>
          `${tarea.titulo} en ${cursosPorId.get(tarea.cursoId)?.nombre ?? "Curso no identificado"} (${describirEstadoTarea(tarea.estadoVisual)})`,
      )
      .join("; ");

    return `El proveedor de IA se está demorando un poco. Mientras tanto, tu panel muestra ${tareasActivas.length} tareas activas: ${tareasPendientes.length} pendientes vigentes y ${tareasAtrasadas.length} atrasadas. Lo más cercano ahora es: ${resumen}.`;
  }

  if (texto.includes("examen")) {
    if (!examenesProximos.length) {
      return "No veo exámenes próximos registrados por ahora. Si quieres, revisamos tus tareas activas o armamos un mini plan de estudio.";
    }

    const resumen = examenesProximos
      .slice(0, 2)
      .map(
        (examen) =>
          `${examen.titulo} de ${cursosPorId.get(examen.cursoId)?.nombre ?? "Curso no identificado"} el ${formatearFechaRespuesta(examen.fecha)}`,
      )
      .join("; ");

    return `El proveedor de IA se está demorando un poco. Mientras tanto, tus exámenes más cercanos son: ${resumen}.`;
  }

  if (textoIncluyeAlguno(texto, ["curso", "cursos", "materia", "materias"])) {
    const cursos = obtenerCursosUnicos(contexto);
    if (!cursos.length) {
      return "Todavía no veo cursos registrados en tu panel. Si quieres, primero podemos crear uno y luego conectarlo con tareas y exámenes.";
    }

    return `Tus cursos actuales son ${unirListaNatural(cursos.slice(0, 5).map((curso) => curso.nombre))}. Si quieres, te digo cuál conviene priorizar y por qué.`;
  }

  if (textoIncluyeAlguno(texto, ["resume", "resumen", "resumeme", "resumir"])) {
    return construirResumenSistema({ mensaje, contexto });
  }

  if (
    textoIncluyeAlguno(texto, [
      "explicame",
      "explica",
      "que es",
      "como funciona",
      "como se hace",
      "entiendo",
      "ayudame a entender",
    ])
  ) {
    return construirExplicacionSistema({ mensaje, contexto });
  }

  return construirRespuestaGeneralSistema({ contexto, detalleError });
}

function crearPromesaTimeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${obtenerProveedorIAActivo()} tardo demasiado en responder.`)), ms);
  });
}

async function registrarIntercambioChat(estudianteId, mensajeUsuarioTexto, respuestaAsistenteTexto) {
  const cliente = await pool.connect();
  try {
    await cliente.query("begin");

    const mensajeUsuario = await cliente.query(
      `
      insert into mensajes_chat (estudiante_id, rol, mensaje)
      values ($1, 'user', $2)
      returning
        id,
        rol as tipo,
        mensaje,
        to_char(creado_en, 'HH24:MI') as hora,
        creado_en as "creadaEn"
      `,
      [estudianteId, mensajeUsuarioTexto],
    );

    const mensajeAsistente = await cliente.query(
      `
      insert into mensajes_chat (estudiante_id, rol, mensaje)
      values ($1, 'ai', $2)
      returning
        id,
        rol as tipo,
        mensaje,
        to_char(creado_en, 'HH24:MI') as hora,
        creado_en as "creadaEn"
      `,
      [estudianteId, respuestaAsistenteTexto],
    );

    await cliente.query("commit");

    return [
      mapearMensajeChat(mensajeUsuario.rows[0]),
      mapearMensajeChat(mensajeAsistente.rows[0]),
    ];
  } catch (error) {
    await cliente.query("rollback");
    throw error;
  } finally {
    cliente.release();
  }
}

async function generarRespuestaAsistente({ mensaje, contexto, timeoutMs = 18000 }) {
  try {
    return await Promise.race([
      generarRespuestaConIA({ mensaje, contexto }),
      crearPromesaTimeout(timeoutMs),
    ]);
  } catch (error) {
    console.error(`Fallback StudyFlow por demora o error de ${obtenerProveedorIAActivo()}:`, error);
    return {
      mensaje: construirRespuestaSistemaRapida({
        mensaje,
        contexto,
        detalleError: error instanceof Error ? error.message : null,
      }),
      fuente: "sistema",
    };
  }
}

function deduplicarPorClave(elementos, obtenerClave) {
  const vistos = new Set();
  return elementos.filter((elemento) => {
    const clave = obtenerClave(elemento);
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}

function construirHistorialConversacion(mensajesChat, limite = 4) {
  return mensajesChat
    .slice(-limite)
    .map((mensaje) => `${mensaje.tipo === "user" ? "Usuario" : "Asistente"}: ${String(mensaje.mensaje).slice(0, 220)}`)
    .join("\n");
}

function construirResumenContextualTexto(contextoCompacto) {
  const secciones = [];

  if (contextoCompacto.usuario) {
    secciones.push(
      `Estudiante: ${contextoCompacto.usuario.nombres}, carrera ${contextoCompacto.usuario.carrera}, semestre ${contextoCompacto.usuario.semestre}.`,
    );
  }

  if (contextoCompacto.cursos.length) {
    secciones.push(
      `Cursos actuales: ${contextoCompacto.cursos
        .map((curso) => `${curso.nombre} (${curso.horario})`)
        .join("; ")}.`,
    );
  }

  secciones.push(
    `Resumen de tareas: ${contextoCompacto.resumenContextual.totalTareasActivas} activas en total; ${contextoCompacto.resumenContextual.totalTareasPendientes} pendientes vigentes y ${contextoCompacto.resumenContextual.totalTareasAtrasadas} atrasadas.`,
  );

  if (contextoCompacto.resumenContextual.tareasPendientes.length) {
    secciones.push(
      `Tareas pendientes vigentes: ${contextoCompacto.resumenContextual.tareasPendientes
        .map(
          (tarea) =>
            `${tarea.titulo} en ${tarea.curso}, vence ${convertirFechaAOrdenable(tarea.fechaEntrega)}, prioridad ${tarea.prioridad}, estado ${tarea.estadoDescripcion}, progreso ${tarea.progreso}%`,
        )
        .join("; ")}.`,
    );
  } else {
    secciones.push("No hay tareas pendientes vigentes registradas.");
  }

  if (contextoCompacto.resumenContextual.tareasAtrasadas.length) {
    secciones.push(
      `Tareas atrasadas o ya vencidas: ${contextoCompacto.resumenContextual.tareasAtrasadas
        .map(
          (tarea) =>
            `${tarea.titulo} en ${tarea.curso}, vencio ${convertirFechaAOrdenable(tarea.fechaEntrega)}, prioridad ${tarea.prioridad}, estado ${tarea.estadoDescripcion}, progreso ${tarea.progreso}%`,
        )
        .join("; ")}.`,
    );
  } else {
    secciones.push("No hay tareas atrasadas registradas.");
  }

  if (contextoCompacto.resumenContextual.examenesProximos.length) {
    secciones.push(
      `Exámenes próximos reales: ${contextoCompacto.resumenContextual.examenesProximos
        .map(
          (examen) =>
            `${examen.titulo} de ${examen.curso} el ${convertirFechaAOrdenable(examen.fecha)} a las ${examen.hora}, preparacion ${examen.preparacion}%`,
        )
        .join("; ")}.`,
    );
  } else {
    secciones.push("No hay exámenes próximos registrados.");
  }

  return secciones.join("\n");
}

function ajustarRespuestaAsistente(mensaje) {
  const texto = limpiarMarcadoresHerramientas(mensaje);
  if (!texto) {
    return "No pude darte una respuesta clara esta vez. Intenta preguntarme de nuevo con otras palabras o dime si quieres que te ayude con tareas, cursos, exámenes o estudio.";
  }

  const textoNormalizado = normalizarTexto(texto);
  const patronesConfusion = [
    "no entendi",
    "no entiendo",
    "no comprendo",
    "no me quedo claro",
    "no tengo claro",
  ];

  if (patronesConfusion.some((patron) => textoNormalizado.includes(patron))) {
    return "No lo capté del todo. Puedes preguntármelo de nuevo con otras palabras o decirme si quieres ayuda con tus tareas, cursos, exámenes o con una explicación académica.";
  }

  return texto;
}

function construirDatosHerramientas(contexto) {
  const cursos = deduplicarPorClave(contexto.cursos, (curso) => `${curso.nombre}-${curso.docente}-${curso.horario}`);
  const cursosPorId = new Map(cursos.map((curso) => [curso.id, curso]));
  const tareasActivas = deduplicarPorClave(
    contexto.tareas
      .map((tarea) => ({
        ...tarea,
        estadoVisual: obtenerEstadoVisualTarea(tarea),
      }))
      .filter((tarea) => tarea.estadoVisual !== "completed"),
    (tarea) => `${tarea.titulo}-${tarea.cursoId}-${convertirFechaAOrdenable(tarea.fechaEntrega)}`,
  )
    .sort(ordenarTareasPorUrgencia);
  const tareasPendientes = tareasActivas.filter((tarea) => tarea.estadoVisual !== "overdue");
  const tareasAtrasadas = tareasActivas.filter((tarea) => tarea.estadoVisual === "overdue");
  const examenesProximos = deduplicarPorClave(
    contexto.examenes,
    (examen) => `${examen.titulo}-${examen.cursoId}-${convertirFechaAOrdenable(examen.fecha)}-${examen.hora}`,
  )
    .sort((a, b) => convertirFechaAOrdenable(a.fecha).localeCompare(convertirFechaAOrdenable(b.fecha)))
    .slice(0, 2);

  return { cursos, cursosPorId, tareasActivas, tareasPendientes, tareasAtrasadas, examenesProximos };
}

function construirHerramientasLocales(contexto) {
  const { cursos, cursosPorId, tareasActivas, tareasPendientes, tareasAtrasadas, examenesProximos } =
    construirDatosHerramientas(contexto);
  const mapearTareaHerramienta = (tarea) => ({
    titulo: tarea.titulo,
    curso: cursosPorId.get(tarea.cursoId)?.nombre ?? "Curso no identificado",
    fechaEntrega: formatearFechaRespuesta(tarea.fechaEntrega),
    prioridad: tarea.prioridad,
    estado: tarea.estadoVisual,
    estadoDescripcion: describirEstadoTarea(tarea.estadoVisual),
    vencida: tarea.estadoVisual === "overdue",
    progreso: tarea.progreso,
  });

  return {
    obtener_cursos_actuales: () => ({
      total: cursos.length,
      cursos: cursos.slice(0, 4).map((curso) => ({
        nombre: curso.nombre,
        docente: curso.docente,
        horario: curso.horario,
        semestre: curso.semestre,
      })),
    }),
    listar_tareas_pendientes: () => ({
      total: tareasActivas.length,
      totalActivas: tareasActivas.length,
      totalPendientes: tareasPendientes.length,
      totalPendientesVigentes: tareasPendientes.length,
      totalAtrasadas: tareasAtrasadas.length,
      notaEstados:
        "Si una tarea aparece con estado overdue, significa que esta atrasada y su fecha de entrega ya vencio.",
      notaConteo:
        "Las listas incluidas aqui son una muestra corta. Para responder cantidades usa totalActivas, totalPendientesVigentes y totalAtrasadas.",
      tareasMuestra: tareasActivas.slice(0, 4).map(mapearTareaHerramienta),
      tareasAtrasadasMuestra: tareasAtrasadas.slice(0, 3).map(mapearTareaHerramienta),
    }),
    listar_examenes_proximos: () => ({
      total: examenesProximos.length,
      examenes: examenesProximos.map((examen) => ({
        titulo: examen.titulo,
        curso: cursosPorId.get(examen.cursoId)?.nombre ?? "Curso no identificado",
        fecha: formatearFechaRespuesta(examen.fecha),
        hora: examen.hora,
        preparacion: examen.preparacion,
      })),
    }),
    obtener_prioridades_hoy: () => ({
      prioridades: [
        ...tareasAtrasadas.slice(0, 2).map((tarea) => ({
          tipo: "tarea_atrasada",
          texto: `${tarea.titulo} en ${cursosPorId.get(tarea.cursoId)?.nombre ?? "Curso no identificado"}`,
          fecha: formatearFechaRespuesta(tarea.fechaEntrega),
          prioridad: tarea.prioridad,
          estado: tarea.estadoVisual,
          estadoDescripcion: describirEstadoTarea(tarea.estadoVisual),
          progreso: tarea.progreso,
        })),
        ...tareasPendientes.slice(0, 2).map((tarea) => ({
          tipo: "tarea",
          texto: `${tarea.titulo} en ${cursosPorId.get(tarea.cursoId)?.nombre ?? "Curso no identificado"}`,
          fecha: formatearFechaRespuesta(tarea.fechaEntrega),
          prioridad: tarea.prioridad,
          estado: tarea.estadoVisual,
          estadoDescripcion: describirEstadoTarea(tarea.estadoVisual),
          progreso: tarea.progreso,
        })),
        ...examenesProximos.slice(0, 2).map((examen) => ({
          tipo: "examen",
          texto: `${examen.titulo} de ${cursosPorId.get(examen.cursoId)?.nombre ?? "Curso no identificado"}`,
          fecha: formatearFechaRespuesta(examen.fecha),
          preparacion: examen.preparacion,
        })),
      ],
    }),
    obtener_contexto_general: () => ({
      estudiante: contexto.usuario
        ? {
            nombres: contexto.usuario.nombres,
            carrera: contexto.usuario.carrera,
            semestre: contexto.usuario.semestre,
          }
        : null,
      cursos: cursos.length,
      tareasActivas: tareasActivas.length,
      tareasPendientes: tareasPendientes.length,
      tareasPendientesVigentes: tareasPendientes.length,
      tareasAtrasadas: tareasAtrasadas.length,
      examenesProximos: examenesProximos.length,
      bloquesEstudio: contexto.bloquesPlanificador.filter((bloque) => bloque.tipo === "study").length,
    }),
  };
}

function ejecutarHerramientasBase(herramientasLocales) {
  return {
    obtener_contexto_general: herramientasLocales.obtener_contexto_general(),
    obtener_cursos_actuales: herramientasLocales.obtener_cursos_actuales(),
    listar_tareas_pendientes: herramientasLocales.listar_tareas_pendientes(),
    listar_examenes_proximos: herramientasLocales.listar_examenes_proximos(),
    obtener_prioridades_hoy: herramientasLocales.obtener_prioridades_hoy(),
  };
}

function obtenerDefinicionesHerramientas() {
  return [
    {
      type: "function",
      function: {
        name: "obtener_cursos_actuales",
        description: "Obtiene la lista de cursos actuales del estudiante con docente y horario.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "listar_tareas_pendientes",
        description: "Obtiene las tareas pendientes reales del estudiante.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "listar_examenes_proximos",
        description: "Obtiene los exámenes próximos reales del estudiante.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "obtener_prioridades_hoy",
        description: "Obtiene las prioridades académicas actuales del estudiante usando tareas y exámenes cercanos.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "obtener_contexto_general",
        description: "Obtiene un resumen general del estado académico del estudiante.",
        parameters: { type: "object", properties: {} },
      },
    },
  ];
}

function construirContextoIA(contexto) {
  const { cursos, cursosPorId, tareasActivas, tareasPendientes, tareasAtrasadas, examenesProximos } =
    construirDatosHerramientas(contexto);
  const mapearTareaContexto = (tarea) => ({
    titulo: tarea.titulo,
    curso: cursosPorId.get(tarea.cursoId)?.nombre ?? "Curso no identificado",
    fechaEntrega: formatearFechaRespuesta(tarea.fechaEntrega),
    prioridad: tarea.prioridad,
    estado: tarea.estadoVisual,
    estadoDescripcion: describirEstadoTarea(tarea.estadoVisual),
    progreso: tarea.progreso,
  });

  return {
    usuario: contexto.usuario
      ? {
          nombres: contexto.usuario.nombres,
          carrera: contexto.usuario.carrera,
          semestre: contexto.usuario.semestre,
          horasDisponibles: contexto.usuario.horasDisponibles,
          metodoEstudio: contexto.usuario.metodoEstudio,
          tonoAsistente: contexto.usuario.tonoAsistente,
          horasEstudioDiarias: contexto.usuario.horasEstudioDiarias,
          horasSueno: contexto.usuario.horasSueno,
          plan: contexto.usuario.plan,
          tipoPerfil: contexto.usuario.tipoPerfil,
          objetivoAcademico: contexto.usuario.objetivoAcademico,
          preferenciaMicroSesion: contexto.usuario.preferenciaMicroSesion,
          horarioLaboral: contexto.usuario.horarioLaboral,
          diasMayorDisponibilidad: contexto.usuario.diasMayorDisponibilidad,
          tieneTesisProyecto: contexto.usuario.tieneTesisProyecto,
          tiempoRealDisponibleDia: contexto.usuario.tiempoRealDisponibleDia,
        }
      : null,
    cursos: cursos.slice(0, 4).map((curso) => ({
      id: curso.id,
      nombre: curso.nombre,
      docente: curso.docente,
      horario: curso.horario,
      color: curso.color,
    })),
    tareasMuestra: tareasActivas.slice(0, 4).map((tarea) => ({
      id: tarea.id,
      cursoId: tarea.cursoId,
      cursoNombre: cursosPorId.get(tarea.cursoId)?.nombre ?? "Curso no identificado",
      titulo: tarea.titulo,
      fechaEntrega: formatearFechaRespuesta(tarea.fechaEntrega),
      prioridad: tarea.prioridad,
      estado: tarea.estadoVisual,
      estadoDescripcion: describirEstadoTarea(tarea.estadoVisual),
      progreso: tarea.progreso,
      horasEstimadas: tarea.horasEstimadas,
    })),
    examenes: contexto.examenes.slice(0, 3).map((examen) => ({
      id: examen.id,
      cursoId: examen.cursoId,
      cursoNombre: cursosPorId.get(examen.cursoId)?.nombre ?? "Curso no identificado",
      titulo: examen.titulo,
      fecha: formatearFechaRespuesta(examen.fecha),
      hora: examen.hora,
      temas: examen.temas,
      preparacion: examen.preparacion,
    })),
    bloquesPlanificador: contexto.bloquesPlanificador.slice(0, 4).map((bloque) => ({
      dia: bloque.dia,
      horaInicio: bloque.horaInicio,
      duracion: bloque.duracion,
      titulo: bloque.titulo,
      cursoId: bloque.cursoId,
      cursoNombre: bloque.cursoId ? cursosPorId.get(bloque.cursoId)?.nombre ?? "Curso no identificado" : null,
      tipo: bloque.tipo,
    })),
    proyectosLargos: (contexto.proyectosLargos ?? []).slice(0, 4).map((proyecto) => ({
      id: proyecto.id,
      titulo: proyecto.titulo,
      tipo: proyecto.tipo,
      fechaLimite: formatearFechaRespuesta(proyecto.fechaLimite),
      faseActual: proyecto.faseActual,
      progreso: proyecto.progreso,
      pasosPendientes: proyecto.pasos?.filter((paso) => !paso.completado).slice(0, 3).map((paso) => paso.titulo) ?? [],
    })),
    proyectosGrupales: (contexto.proyectosGrupales ?? []).slice(0, 3).map((proyecto) => ({
      id: proyecto.id,
      nombre: proyecto.nombre,
      fechaLimite: formatearFechaRespuesta(proyecto.fechaLimite),
      integrantes: proyecto.integrantes?.map((integrante) => integrante.nombre) ?? [],
      tareasPendientes: proyecto.tareas?.filter((tarea) => tarea.estado !== "finalizado").slice(0, 4).map((tarea) => ({
        titulo: tarea.titulo,
        estado: tarea.estado,
        progreso: tarea.progreso,
      })) ?? [],
    })),
    resumenContextual: {
      totalCursos: cursos.length,
      totalTareas: contexto.tareas.length,
      totalTareasActivas: tareasActivas.length,
      totalTareasPendientes: tareasPendientes.length,
      totalTareasPendientesVigentes: tareasPendientes.length,
      totalTareasAtrasadas: tareasAtrasadas.length,
      notaConteo:
        "Para responder cantidades usa estos totales. Las listas de tareas del contexto son solo una muestra corta.",
      tareasPendientes: tareasPendientes.slice(0, 3).map(mapearTareaContexto),
      tareasAtrasadas: tareasAtrasadas.slice(0, 3).map(mapearTareaContexto),
      examenesProximos: examenesProximos.slice(0, 2).map((examen) => ({
        titulo: examen.titulo,
        curso: cursosPorId.get(examen.cursoId)?.nombre ?? "Curso no identificado",
        fecha: formatearFechaRespuesta(examen.fecha),
        hora: examen.hora,
        preparacion: examen.preparacion,
      })),
    },
  };
}

async function generarRespuestaConIA({ mensaje, contexto }) {
  if (!hayClienteIAConfigurado()) {
    throw new Error(`${obtenerProveedorIAActivo().toUpperCase()} no configurado en el backend.`);
  }

  const contextoCompacto = construirContextoIA(contexto);
  const resumenContextualTexto = construirResumenContextualTexto(contextoCompacto);
  const historialConversacion = construirHistorialConversacion(contexto.mensajesChat);
  const herramientasLocales = construirHerramientasLocales(contexto);
  const herramientasBase = ejecutarHerramientasBase(herramientasLocales);
  const instruccionTono = construirInstruccionTono(contextoCompacto.usuario?.tonoAsistente);
  const perfil = contextoCompacto.usuario;
  const esPerfilProfesional =
    perfil?.tipoPerfil === "posgrado" ||
    perfil?.tipoPerfil === "profesional_estudia" ||
    perfil?.tipoPerfil === "diplomado_maestria" ||
    perfil?.tipoPerfil === "segunda_especialidad";
  const instrucciones =
    `Eres StudyFlow AI, un asistente academico y de productividad en espanol. Responde con tono claro, util, conversacional, humano y profesional. ${instruccionTono} ` +
    `Debes basarte en los datos reales del sistema y no inventar datos. Usa los totales explicitos del contexto para cantidades. ` +
    `No afirmes que creaste, modificaste o eliminaste datos salvo que el sistema ya haya ejecutado esa accion. ` +
    `Adapta la respuesta al tipo_perfil y plan. Si el usuario es universitario o instituto, prioriza cursos, tareas, examenes y estudio regular. ` +
    `Si el usuario es posgrado, profesional que trabaja y estudia, diplomado, maestria o segunda especialidad, considera horario laboral, cansancio, poco tiempo, micro-sesiones, tesis/proyectos largos, trabajo colaborativo y balance personal. ` +
    `No propongas horarios poco realistas. Sugiere pasos pequenos para retomar el ritmo. Premium Plus es una recomendacion suave, nunca una obligacion. ` +
    `Si una funcion avanzada no esta en el plan actual, muestra una vista previa o recomendacion elegante sin bloquear agresivamente.`;

  const messages = [
    {
      role: "system",
      content:
        `Contexto compacto del estudiante:\n${JSON.stringify(contextoCompacto)}\n\n` +
        `Resumen humano del contexto:\n${resumenContextualTexto}\n\n` +
        `Historial reciente de la conversacion:\n${historialConversacion || "Sin mensajes previos relevantes."}\n\n` +
        `Resultados de herramientas base ya consultadas para este turno:\n${JSON.stringify(herramientasBase)}\n\n` +
        `Orientacion de perfil: ${esPerfilProfesional ? "trabajo + estudio + vida personal; prioriza micro-sesiones y proyectos largos." : "academico regular; prioriza cursos, examenes y tareas."}`,
    },
    ...contexto.mensajesChat.slice(-2).map((item) => ({
      role: item.tipo === "user" ? "user" : "assistant",
      content: String(item.mensaje).slice(0, 500),
    })),
    {
      role: "user",
      content: mensaje,
    },
  ];

  const respuesta = await generarRespuestaProveedorIA({
    instrucciones,
    mensajes: messages,
    timeoutMs: 18000,
  });

  return {
    mensaje: ajustarRespuestaAsistente(respuesta.texto),
    fuente: respuesta.fuente,
  };
}

function construirCamposPerfil(body) {
  const campos = [];
  const valores = [];
  const mapa = {
    nombres: "nombres",
    apellidos: "apellidos",
    correo: "correo",
    universidad: "universidad",
    carrera: "carrera",
    semestre: "semestre",
    plan: "plan",
    tipoPerfil: "tipo_perfil",
    objetivoAcademico: "objetivo_academico",
    preferenciaMicroSesion: "preferencia_micro_sesion",
    horarioLaboral: "horario_laboral",
    diasMayorDisponibilidad: "dias_mayor_disponibilidad",
    tieneTesisProyecto: "tiene_tesis_proyecto",
    tiempoRealDisponibleDia: "tiempo_real_disponible_dia",
    horasDisponibles: "horas_disponibles",
    metodoEstudio: "metodo_estudio",
    tonoAsistente: "tono_asistente",
    metas: "metas",
    horasEstudioDiarias: "horas_estudio_diarias",
    horasSueno: "horas_sueno",
  };

  Object.entries(mapa).forEach(([clave, columna]) => {
    if (body[clave] === undefined) return;
    valores.push(body[clave]);
    campos.push(`${columna} = $${valores.length}`);
  });

  if (body.notificaciones) {
    const notificaciones = {
      tareas: "notif_tareas",
      examenes: "notif_examenes",
      ia: "notif_ia",
      semanal: "notif_semanal",
      correo: "notif_correo",
    };

    Object.entries(notificaciones).forEach(([clave, columna]) => {
      if (body.notificaciones[clave] === undefined) return;
      valores.push(body.notificaciones[clave]);
      campos.push(`${columna} = $${valores.length}`);
    });
  }

  if (body.aplicacion) {
    const aplicacion = {
      modoOscuro: "app_modo_oscuro",
      googleCalendar: "app_google_calendar",
      sugerenciasAutomaticas: "app_sugerencias_automaticas",
    };

    Object.entries(aplicacion).forEach(([clave, columna]) => {
      if (body.aplicacion[clave] === undefined) return;
      valores.push(body.aplicacion[clave]);
      campos.push(`${columna} = $${valores.length}`);
    });
  }

  return { campos, valores };
}

function construirCamposActualizacion(body, mapa) {
  const valores = [];
  const sets = [];

  Object.entries(mapa).forEach(([clave, columna]) => {
    if (body[clave] === undefined) return;
    valores.push(body[clave]);
    sets.push(`${columna} = $${valores.length}`);
  });

  return { sets, valores };
}

async function obtenerSubtareasPorTareas(tareaIds) {
  if (!tareaIds.length) return new Map();

  const resultado = await pool.query(
    `
    select
      id,
      tarea_id as "tareaId",
      titulo,
      completada
    from subtareas
    where tarea_id = any($1::uuid[])
    order by creado_en asc
    `,
    [tareaIds],
  );

  const subtareasPorTarea = new Map();
  resultado.rows.forEach((row) => {
    const lista = subtareasPorTarea.get(row.tareaId) ?? [];
    lista.push(mapearSubtarea(row));
    subtareasPorTarea.set(row.tareaId, lista);
  });

  return subtareasPorTarea;
}

async function mapearTareasConSubtareas(rows) {
  const subtareasPorTarea = await obtenerSubtareasPorTareas(rows.map((row) => row.id));
  return rows.map((row) => ({
    ...mapearTarea(row),
    subtareas: subtareasPorTarea.get(row.id) ?? [],
  }));
}

async function obtenerTareaPorId(tareaId) {
  const resultado = await pool.query(
    `
    select
      id,
      curso_id as "cursoId",
      titulo,
      descripcion,
      fecha_entrega as "fechaEntrega",
      prioridad,
      estado,
      horas_estimadas as "horasEstimadas",
      progreso
    from tareas
    where id = $1
    limit 1
    `,
    [tareaId],
  );

  const tareas = await mapearTareasConSubtareas(resultado.rows);
  return tareas[0] ?? null;
}

async function sincronizarResumenChecklistTarea(tareaId) {
  const resultado = await pool.query(
    `
    select
      count(*)::int as total,
      count(*) filter (where completada)::int as completadas
    from subtareas
    where tarea_id = $1
    `,
    [tareaId],
  );

  const total = Number(resultado.rows[0]?.total ?? 0);
  const completadas = Number(resultado.rows[0]?.completadas ?? 0);
  const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0;
  const estado = progreso >= 100 ? "completed" : progreso > 0 ? "in-progress" : "pending";

  await pool.query(
    "update tareas set progreso = $1, estado = $2 where id = $3",
    [progreso, estado, tareaId],
  );
}

function crearCodigoInvitacion() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function normalizarRolPermiso(valor) {
  return ["admin", "editor", "responsable", "lector"].includes(valor) ? valor : "editor";
}

function obtenerIdSolicitanteAdmin(request) {
  return String(request.get("x-studyflow-user-id") || request.query.adminId || request.body?.adminId || "").trim();
}

async function obtenerAdministradorSolicitante(request, response) {
  const adminId = obtenerIdSolicitanteAdmin(request);
  if (!adminId) {
    response.status(401).json({ mensaje: "Usuario no autenticado." });
    return null;
  }

  const resultado = await pool.query("select id, rol from estudiantes where id = $1 limit 1", [adminId]);
  const usuario = resultado.rows[0];

  if (!usuario) {
    response.status(401).json({ mensaje: "Usuario no encontrado." });
    return null;
  }

  if (!["admin", "superadmin"].includes(usuario.rol)) {
    response.status(403).json({ mensaje: "Acceso denegado. Se requiere rol administrador." });
    return null;
  }

  return usuario;
}

const ROLES_ADMIN_PERMITIDOS = ["estudiante", "admin", "superadmin"];
const PLANES_ADMIN_PERMITIDOS = ["gratis", "estudiante", "premium", "premium_plus"];

function normalizarRolAdmin(valor) {
  const rol = String(valor || "").trim().toLowerCase();
  const equivalencias = {
    estudiante: "estudiante",
    usuario: "estudiante",
    admin: "admin",
    administrador: "admin",
    superadmin: "superadmin",
    super_administrador: "superadmin",
  };
  return equivalencias[rol] || rol;
}

function normalizarPlanAdmin(valor) {
  const plan = String(valor || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  const equivalencias = {
    gratis: "gratis",
    free: "gratis",
    estudiante: "estudiante",
    premium: "premium",
    premium_plus: "premium_plus",
    plus: "premium_plus",
  };
  return equivalencias[plan] || plan;
}

async function registrarAuditoriaAdmin(cliente, { adminId, targetUserId, action, oldValue, newValue }) {
  await cliente.query(
    `
    insert into admin_audit_logs (admin_id, target_user_id, action, old_value, new_value)
    values ($1, $2, $3, $4, $5)
    `,
    [adminId, targetUserId, action, oldValue, newValue],
  );
}

async function contarTabla(nombreTabla) {
  try {
    const resultado = await pool.query(`select count(*)::int as total from ${nombreTabla}`);
    return resultado.rows[0]?.total ?? 0;
  } catch (error) {
    // MVP admin: si una tabla opcional no existe en una BD local antigua, se omite sin romper el panel.
    if (error.code === "42P01") return null;
    throw error;
  }
}

async function obtenerContextoEstudiante(estudianteId) {
  const [usuario, cursos, tareas, examenes, bloquesPlanificador, notificaciones, mensajesChat] =
    await Promise.all([
      pool.query(
        `
        select
          id,
          nombres,
          apellidos,
          correo,
          rol,
          universidad,
          carrera,
          semestre,
          plan,
          tipo_perfil as "tipoPerfil",
          objetivo_academico as "objetivoAcademico",
          preferencia_micro_sesion as "preferenciaMicroSesion",
          horario_laboral as "horarioLaboral",
          dias_mayor_disponibilidad as "diasMayorDisponibilidad",
          tiene_tesis_proyecto as "tieneTesisProyecto",
          tiempo_real_disponible_dia as "tiempoRealDisponibleDia",
          horas_disponibles as "horasDisponibles",
          metodo_estudio as "metodoEstudio",
          tono_asistente as "tonoAsistente",
          metas,
          horas_estudio_diarias as "horasEstudioDiarias",
          horas_sueno as "horasSueno",
          notif_tareas as "notificacionesTareas",
          notif_examenes as "notificacionesExamenes",
          notif_ia as "notificacionesIa",
          notif_semanal as "notificacionesSemanal",
          notif_correo as "notificacionesCorreo",
          email_verificado as "emailVerificado",
          app_modo_oscuro as "aplicacionModoOscuro",
          app_google_calendar as "aplicacionGoogleCalendar",
          app_sugerencias_automaticas as "aplicacionSugerenciasAutomaticas"
        from estudiantes
        where id = $1
        `,
        [estudianteId],
      ),
      pool.query(
        `
        select
          id,
          nombre,
          docente,
          horario_texto as horario,
          semestre,
          color,
          descripcion
        from cursos
        where estudiante_id = $1
        order by nombre asc
        `,
        [estudianteId],
      ),
      pool.query(
        `
        select
          id,
          curso_id as "cursoId",
          titulo,
          descripcion,
          fecha_entrega as "fechaEntrega",
          prioridad,
          estado,
          horas_estimadas as "horasEstimadas",
          progreso
        from tareas
        where estudiante_id = $1
        order by fecha_entrega asc
        `,
        [estudianteId],
      ),
      pool.query(
        `
        select
          id,
          curso_id as "cursoId",
          titulo,
          fecha_examen as fecha,
          hora_examen as hora,
          temas,
          preparacion
        from examenes
        where estudiante_id = $1
        order by fecha_examen asc
        `,
        [estudianteId],
      ),
      pool.query(
        `
        select
          id,
          curso_id as "cursoId",
          dia_semana as dia,
          hora_inicio as "horaInicio",
          horas_duracion as duracion,
          titulo,
          color,
          tipo_bloque as tipo
        from bloques_planificador
        where estudiante_id = $1
        order by dia_semana asc, hora_inicio asc
        `,
        [estudianteId],
      ),
      pool.query(
        `
        select
          id,
          tipo,
          titulo,
          mensaje,
          no_leida as "noLeida",
          creado_en as "creadaEn"
        from notificaciones
        where estudiante_id = $1
        order by creado_en desc
        `,
        [estudianteId],
      ),
      pool.query(
        `
        select
          id,
          rol as tipo,
          mensaje,
          to_char(creado_en, 'HH24:MI') as hora,
          creado_en as "creadaEn"
        from mensajes_chat
        where estudiante_id = $1
        order by creado_en asc
        `,
        [estudianteId],
      ),
    ]);

  const [proyectosLargos, proyectosGrupales] = await Promise.all([
    obtenerProyectosLargosEstudiante(estudianteId),
    obtenerProyectosGrupalesEstudiante(estudianteId),
  ]);

  const tareasConSubtareas = await mapearTareasConSubtareas(tareas.rows);

  return {
    usuario: mapearUsuario(usuario.rows[0] ?? null),
    cursos: cursos.rows.map(mapearCurso),
    tareas: tareasConSubtareas,
    examenes: examenes.rows.map(mapearExamen),
    bloquesPlanificador: bloquesPlanificador.rows.map(mapearBloque),
    notificaciones: notificaciones.rows.map(mapearNotificacion),
    mensajesChat: mensajesChat.rows.map(mapearMensajeChat),
    proyectosLargos,
    proyectosGrupales,
  };
}

async function obtenerProyectosLargosEstudiante(estudianteId) {
  const proyectos = await pool.query(
    `
    select
      id,
      curso_id as "cursoId",
      titulo,
      descripcion,
      tipo,
      fecha_limite as "fechaLimite",
      fase_actual as "faseActual",
      progreso,
      ultimo_avance as "ultimoAvance"
    from proyectos_largos
    where estudiante_id = $1
    order by fecha_limite asc
    `,
    [estudianteId],
  );
  const pasos = await pool.query(
    `
    select
      id,
      proyecto_id as "proyectoId",
      titulo,
      fase,
      completado
    from pasos_proyecto_largo
    where proyecto_id = any($1::uuid[])
    order by creado_en asc
    `,
    [proyectos.rows.map((proyecto) => proyecto.id)],
  );
  const pasosPorProyecto = new Map();
  pasos.rows.forEach((paso) => {
    const lista = pasosPorProyecto.get(paso.proyectoId) ?? [];
    lista.push(mapearPasoProyectoLargo(paso));
    pasosPorProyecto.set(paso.proyectoId, lista);
  });

  return proyectos.rows.map((proyecto) => mapearProyectoLargo(proyecto, pasosPorProyecto.get(proyecto.id) ?? []));
}

async function obtenerProyectoLargoPorId(proyectoId) {
  const proyecto = await pool.query(
    `
    select
      id,
      estudiante_id as "estudianteId",
      curso_id as "cursoId",
      titulo,
      descripcion,
      tipo,
      fecha_limite as "fechaLimite",
      fase_actual as "faseActual",
      progreso,
      ultimo_avance as "ultimoAvance"
    from proyectos_largos
    where id = $1
    limit 1
    `,
    [proyectoId],
  );
  const row = proyecto.rows[0];
  if (!row) return null;
  const pasos = await pool.query(
    `
    select id, proyecto_id as "proyectoId", titulo, fase, completado
    from pasos_proyecto_largo
    where proyecto_id = $1
    order by creado_en asc
    `,
    [proyectoId],
  );
  return mapearProyectoLargo(row, pasos.rows.map(mapearPasoProyectoLargo));
}

async function obtenerDetallesTareasGrupales(tareaIds) {
  if (!tareaIds.length) {
    return { comentariosPorTarea: new Map(), checklistPorTarea: new Map() };
  }

  const [comentarios, checklist] = await Promise.all([
    pool.query(
      `
      select id, tarea_id as "tareaId", autor, comentario, creado_en as "creadoEn"
      from comentarios_tarea_grupal
      where tarea_id = any($1::uuid[])
      order by creado_en asc
      `,
      [tareaIds],
    ),
    pool.query(
      `
      select id, tarea_id as "tareaId", titulo, completado
      from checklist_tarea_grupal
      where tarea_id = any($1::uuid[])
      order by creado_en asc
      `,
      [tareaIds],
    ),
  ]);

  const comentariosPorTarea = new Map();
  comentarios.rows.forEach((comentario) => {
    const lista = comentariosPorTarea.get(comentario.tareaId) ?? [];
    lista.push(mapearComentarioTareaGrupal(comentario));
    comentariosPorTarea.set(comentario.tareaId, lista);
  });

  const checklistPorTarea = new Map();
  checklist.rows.forEach((item) => {
    const lista = checklistPorTarea.get(item.tareaId) ?? [];
    lista.push(mapearChecklistTareaGrupal(item));
    checklistPorTarea.set(item.tareaId, lista);
  });

  return { comentariosPorTarea, checklistPorTarea };
}

async function obtenerProyectosGrupalesEstudiante(estudianteId) {
  const proyectos = await pool.query(
    `
    select
      id,
      curso_id as "cursoId",
      nombre,
      descripcion,
      fecha_limite as "fechaLimite",
      codigo_invitacion as "codigoInvitacion"
    from proyectos_grupales
    where estudiante_id = $1
    order by fecha_limite asc
    `,
    [estudianteId],
  );
  const ids = proyectos.rows.map((proyecto) => proyecto.id);
  const integrantes = await pool.query(
    `
    select id, proyecto_id as "proyectoId", nombre, correo, rol, rol_permiso as "rolPermiso"
    from integrantes_proyecto
    where proyecto_id = any($1::uuid[])
    order by creado_en asc
    `,
    [ids],
  );
  const tareas = await pool.query(
    `
    select
      id,
      proyecto_id as "proyectoId",
      titulo,
      descripcion,
      prioridad,
      responsable_id as "responsableId",
      fecha_limite as "fechaLimite",
      estado,
      progreso
    from tareas_grupales
    where proyecto_id = any($1::uuid[])
    order by fecha_limite asc
    `,
    [ids],
  );
  const integrantesPorProyecto = new Map();
  integrantes.rows.forEach((integrante) => {
    const lista = integrantesPorProyecto.get(integrante.proyectoId) ?? [];
    lista.push(mapearIntegranteProyecto(integrante));
    integrantesPorProyecto.set(integrante.proyectoId, lista);
  });
  const tareasPorProyecto = new Map();
  tareas.rows.forEach((tarea) => {
    const lista = tareasPorProyecto.get(tarea.proyectoId) ?? [];
    lista.push(tarea);
    tareasPorProyecto.set(tarea.proyectoId, lista);
  });
  const { comentariosPorTarea, checklistPorTarea } = await obtenerDetallesTareasGrupales(tareas.rows.map((tarea) => tarea.id));

  return proyectos.rows.map((proyecto) =>
    mapearProyectoGrupal(
      proyecto,
      integrantesPorProyecto.get(proyecto.id) ?? [],
      (tareasPorProyecto.get(proyecto.id) ?? []).map((tarea) =>
        mapearTareaGrupal(tarea, comentariosPorTarea.get(tarea.id) ?? [], checklistPorTarea.get(tarea.id) ?? []),
      ),
    ),
  );
}

async function obtenerProyectoGrupalPorId(proyectoId) {
  const proyecto = await pool.query(
    `
    select id, estudiante_id as "estudianteId", curso_id as "cursoId", nombre, descripcion, fecha_limite as "fechaLimite", codigo_invitacion as "codigoInvitacion"
    from proyectos_grupales
    where id = $1
    limit 1
    `,
    [proyectoId],
  );
  const row = proyecto.rows[0];
  if (!row) return null;
  const [integrantes, tareas] = await Promise.all([
    pool.query("select id, proyecto_id as \"proyectoId\", nombre, correo, rol, rol_permiso as \"rolPermiso\" from integrantes_proyecto where proyecto_id = $1 order by creado_en asc", [proyectoId]),
    pool.query(
      `
      select id, proyecto_id as "proyectoId", titulo, descripcion, prioridad, responsable_id as "responsableId", fecha_limite as "fechaLimite", estado, progreso
      from tareas_grupales
      where proyecto_id = $1
      order by fecha_limite asc
      `,
      [proyectoId],
    ),
  ]);
  const { comentariosPorTarea, checklistPorTarea } = await obtenerDetallesTareasGrupales(tareas.rows.map((tarea) => tarea.id));
  return mapearProyectoGrupal(
    row,
    integrantes.rows.map(mapearIntegranteProyecto),
    tareas.rows.map((tarea) =>
      mapearTareaGrupal(tarea, comentariosPorTarea.get(tarea.id) ?? [], checklistPorTarea.get(tarea.id) ?? []),
    ),
  );
}

async function asegurarColumnasCompatibilidad() {
  if (!pool) return;

  await pool.query("alter table estudiantes add column if not exists rol text not null default 'estudiante'");
  await pool.query("update estudiantes set rol = 'estudiante' where rol is null or rol not in ('estudiante', 'admin', 'superadmin')");
  await pool.query("alter table estudiantes drop constraint if exists estudiantes_rol_check");
  await pool.query("alter table estudiantes add constraint estudiantes_rol_check check (rol in ('estudiante', 'admin', 'superadmin'))");
  await pool.query("alter table estudiantes add column if not exists google_sub text");
  await pool.query("alter table estudiantes add column if not exists tipo_perfil text not null default 'universitario'");
  await pool.query("alter table estudiantes drop constraint if exists estudiantes_tipo_perfil_check");
  await pool.query(
    "alter table estudiantes add constraint estudiantes_tipo_perfil_check check (tipo_perfil in ('universitario', 'instituto', 'posgrado', 'profesional_estudia', 'diplomado_maestria', 'segunda_especialidad'))",
  );
  await pool.query("alter table estudiantes add column if not exists objetivo_academico text not null default 'aprobar_cursos'");
  await pool.query("alter table estudiantes add column if not exists preferencia_micro_sesion int not null default 20");
  await pool.query("alter table estudiantes add column if not exists horario_laboral text");
  await pool.query("alter table estudiantes add column if not exists dias_mayor_disponibilidad text");
  await pool.query("alter table estudiantes add column if not exists tiene_tesis_proyecto boolean not null default false");
  await pool.query("alter table estudiantes add column if not exists tiempo_real_disponible_dia numeric(4,1)");
  await pool.query("alter table estudiantes drop constraint if exists estudiantes_plan_check");
  await pool.query(
    "alter table estudiantes add constraint estudiantes_plan_check check (plan in ('gratis', 'estudiante', 'premium', 'premium_plus'))",
  );
  await pool.query("alter table estudiantes add column if not exists email_verificado boolean not null default false");
  await pool.query("alter table estudiantes add column if not exists email_verificacion_token text");
  await pool.query("alter table estudiantes add column if not exists email_verificacion_expira timestamptz");
  await pool.query(
    "create unique index if not exists estudiantes_google_sub_unique on estudiantes (google_sub) where google_sub is not null",
  );
  await pool.query(`
    create table if not exists admin_audit_logs (
      id uuid primary key default gen_random_uuid(),
      admin_id uuid references estudiantes(id) on delete set null,
      target_user_id uuid references estudiantes(id) on delete set null,
      action text not null,
      old_value text,
      new_value text,
      created_at timestamptz not null default now()
    )
  `);
  await pool.query(
    "alter table bloques_planificador drop constraint if exists bloques_planificador_tipo_bloque_check",
  );
  await pool.query(
    "alter table bloques_planificador add constraint bloques_planificador_tipo_bloque_check check (tipo_bloque in ('class', 'study', 'exam', 'break', 'task', 'review', 'work', 'personal', 'commute', 'project_thesis', 'micro_session', 'academic_meeting', 'research'))",
  );
  await pool.query(`
    create table if not exists proyectos_largos (
      id uuid primary key default gen_random_uuid(),
      estudiante_id uuid not null references estudiantes(id) on delete cascade,
      curso_id uuid references cursos(id) on delete set null,
      titulo text not null,
      descripcion text default '',
      tipo text not null default 'proyecto_final',
      fecha_limite date not null,
      fase_actual text not null default 'investigacion',
      progreso int not null default 0,
      ultimo_avance date default current_date,
      creado_en timestamptz not null default now()
    )
  `);
  await pool.query(`
    create table if not exists pasos_proyecto_largo (
      id uuid primary key default gen_random_uuid(),
      proyecto_id uuid not null references proyectos_largos(id) on delete cascade,
      titulo text not null,
      fase text not null default 'investigacion',
      completado boolean not null default false,
      creado_en timestamptz not null default now()
    )
  `);
  await pool.query(`
    create table if not exists proyectos_grupales (
      id uuid primary key default gen_random_uuid(),
      estudiante_id uuid not null references estudiantes(id) on delete cascade,
      curso_id uuid references cursos(id) on delete set null,
      nombre text not null,
      descripcion text default '',
      fecha_limite date not null,
      codigo_invitacion text not null default upper(substr(md5(random()::text), 1, 6)),
      creado_en timestamptz not null default now()
    )
  `);
  await pool.query("alter table proyectos_grupales add column if not exists codigo_invitacion text");
  await pool.query("update proyectos_grupales set codigo_invitacion = upper(substr(md5(id::text), 1, 6)) where codigo_invitacion is null or codigo_invitacion = ''");
  await pool.query("alter table proyectos_grupales alter column codigo_invitacion set default upper(substr(md5(random()::text), 1, 6))");
  await pool.query("alter table proyectos_grupales alter column codigo_invitacion set not null");
  await pool.query("create unique index if not exists proyectos_grupales_codigo_invitacion_unique on proyectos_grupales (codigo_invitacion)");
  await pool.query(`
    create table if not exists integrantes_proyecto (
      id uuid primary key default gen_random_uuid(),
      proyecto_id uuid not null references proyectos_grupales(id) on delete cascade,
      nombre text not null,
      rol text default 'Integrante',
      rol_permiso text not null default 'editor',
      creado_en timestamptz not null default now()
    )
  `);
  await pool.query("alter table integrantes_proyecto add column if not exists rol_permiso text default 'editor'");
  await pool.query("alter table integrantes_proyecto add column if not exists correo text default ''");
  await pool.query("update integrantes_proyecto set rol_permiso = 'editor' where rol_permiso is null or rol_permiso not in ('admin', 'editor', 'responsable', 'lector')");
  await pool.query("alter table integrantes_proyecto alter column rol_permiso set default 'editor'");
  await pool.query("alter table integrantes_proyecto alter column rol_permiso set not null");
  await pool.query(`
    create table if not exists tareas_grupales (
      id uuid primary key default gen_random_uuid(),
      proyecto_id uuid not null references proyectos_grupales(id) on delete cascade,
      titulo text not null,
      responsable_id uuid references integrantes_proyecto(id) on delete set null,
      fecha_limite date not null,
      estado text not null default 'pendiente',
      progreso int not null default 0,
      creado_en timestamptz not null default now()
    )
  `);
  await pool.query("alter table tareas_grupales add column if not exists descripcion text default ''");
  await pool.query("alter table tareas_grupales add column if not exists prioridad text default 'medium'");
  await pool.query("update tareas_grupales set prioridad = 'medium' where prioridad is null or prioridad not in ('low', 'medium', 'high')");
  await pool.query("alter table tareas_grupales alter column prioridad set default 'medium'");
  await pool.query(`
    create table if not exists comentarios_tarea_grupal (
      id uuid primary key default gen_random_uuid(),
      tarea_id uuid not null references tareas_grupales(id) on delete cascade,
      autor text not null default 'Equipo',
      comentario text not null,
      creado_en timestamptz not null default now()
    )
  `);
  await pool.query(`
    create table if not exists checklist_tarea_grupal (
      id uuid primary key default gen_random_uuid(),
      tarea_id uuid not null references tareas_grupales(id) on delete cascade,
      titulo text not null,
      completado boolean not null default false,
      creado_en timestamptz not null default now()
    )
  `);
  await pool.query(`
    create table if not exists subtareas (
      id uuid primary key default gen_random_uuid(),
      tarea_id uuid not null references tareas(id) on delete cascade,
      titulo text not null,
      completada boolean not null default false,
      creado_en timestamptz not null default now()
    )
  `);
}

app.post("/api/auth/login", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { correo, contrasena } = request.body;

  try {
    const resultado = await pool.query(
      `
      select
        id,
        nombres,
        apellidos,
        correo,
        rol,
        universidad,
        carrera,
        semestre,
        plan,
        tipo_perfil as "tipoPerfil",
        objetivo_academico as "objetivoAcademico",
        preferencia_micro_sesion as "preferenciaMicroSesion",
        horario_laboral as "horarioLaboral",
        dias_mayor_disponibilidad as "diasMayorDisponibilidad",
        tiene_tesis_proyecto as "tieneTesisProyecto",
        tiempo_real_disponible_dia as "tiempoRealDisponibleDia",
        horas_disponibles as "horasDisponibles",
        metodo_estudio as "metodoEstudio",
        tono_asistente as "tonoAsistente",
        metas,
        horas_estudio_diarias as "horasEstudioDiarias",
        horas_sueno as "horasSueno",
        notif_tareas as "notificacionesTareas",
        notif_examenes as "notificacionesExamenes",
        notif_ia as "notificacionesIa",
        notif_semanal as "notificacionesSemanal",
        notif_correo as "notificacionesCorreo",
        email_verificado as "emailVerificado",
        app_modo_oscuro as "aplicacionModoOscuro",
        app_google_calendar as "aplicacionGoogleCalendar",
        app_sugerencias_automaticas as "aplicacionSugerenciasAutomaticas",
        hash_contrasena
      from estudiantes
      where lower(correo) = lower($1)
      limit 1
      `,
      [correo],
    );

    const usuario = resultado.rows[0];
    if (!usuario) {
      response.json({ usuario: null });
      return;
    }

    const autenticado = esHashSeguroContrasena(usuario.hash_contrasena)
      ? verificarContrasena(contrasena, usuario.hash_contrasena)
      : usuario.hash_contrasena === contrasena;

    if (!autenticado) {
      response.json({ usuario: null });
      return;
    }

    if (!esHashSeguroContrasena(usuario.hash_contrasena)) {
      const nuevoHash = crearHashContrasena(contrasena);
      await pool.query("update estudiantes set hash_contrasena = $1 where id = $2", [nuevoHash, usuario.id]);
    }

    response.json({
      usuario: mapearUsuario(usuario),
      requiereCompletarPerfilAcademico: requiereCompletarPerfilAcademico(usuario),
    });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo iniciar sesión.", error: error.message });
  }
});

app.post("/api/auth/google", async (request, response) => {
  if (!pool) return responderSinBase(response);

  if (!clienteGoogle || !googleClientId) {
    response.status(500).json({ mensaje: "GOOGLE_CLIENT_ID no configurado en el backend." });
    return;
  }

  const { credential } = request.body;
  if (!credential) {
    response.status(400).json({ mensaje: "No se recibió el token de Google." });
    return;
  }

  try {
    const ticket = await clienteGoogle.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email) {
      response.status(400).json({ mensaje: "No se pudo validar la cuenta de Google." });
      return;
    }

    if (payload.email_verified === false) {
      response.status(403).json({ mensaje: "La cuenta de Google no tiene el correo verificado." });
      return;
    }

    const { nombres, apellidos } = obtenerNombreYApellidosGoogle(payload);
    const correo = String(payload.email).trim();
    const googleSub = String(payload.sub).trim();

    const existente = await pool.query(
      `
      select
        id,
        nombres,
        apellidos,
        correo,
        rol,
        universidad,
        carrera,
        semestre,
        plan,
        tipo_perfil as "tipoPerfil",
        objetivo_academico as "objetivoAcademico",
        preferencia_micro_sesion as "preferenciaMicroSesion",
        horario_laboral as "horarioLaboral",
        dias_mayor_disponibilidad as "diasMayorDisponibilidad",
        tiene_tesis_proyecto as "tieneTesisProyecto",
        tiempo_real_disponible_dia as "tiempoRealDisponibleDia",
        horas_disponibles as "horasDisponibles",
        metodo_estudio as "metodoEstudio",
        tono_asistente as "tonoAsistente",
        metas,
        horas_estudio_diarias as "horasEstudioDiarias",
        horas_sueno as "horasSueno",
        notif_tareas as "notificacionesTareas",
        notif_examenes as "notificacionesExamenes",
        notif_ia as "notificacionesIa",
        notif_semanal as "notificacionesSemanal",
        notif_correo as "notificacionesCorreo",
        email_verificado as "emailVerificado",
        app_modo_oscuro as "aplicacionModoOscuro",
        app_google_calendar as "aplicacionGoogleCalendar",
        app_sugerencias_automaticas as "aplicacionSugerenciasAutomaticas",
        google_sub as "googleSub"
      from estudiantes
      where google_sub = $1 or lower(correo) = lower($2)
      order by case when google_sub = $1 then 0 else 1 end
      limit 1
      `,
      [googleSub, correo],
    );

    const usuarioExistente = existente.rows[0];

    if (usuarioExistente) {
      if (usuarioExistente.googleSub && usuarioExistente.googleSub !== googleSub) {
        response.status(409).json({ mensaje: "Ese correo ya está vinculado a otra cuenta de Google." });
        return;
      }

      if (!usuarioExistente.googleSub) {
        await pool.query(
          "update estudiantes set google_sub = $1, email_verificado = true, email_verificacion_token = null, email_verificacion_expira = null where id = $2",
          [googleSub, usuarioExistente.id],
        );
        usuarioExistente.googleSub = googleSub;
      }
      usuarioExistente.emailVerificado = true;

      response.json({
        usuario: mapearUsuario(usuarioExistente),
        requiereCompletarPerfilAcademico: requiereCompletarPerfilAcademico(usuarioExistente),
      });
      return;
    }

    const resultado = await pool.query(
      `
      insert into estudiantes (
        nombres,
        apellidos,
        correo,
        google_sub,
        hash_contrasena,
        universidad,
        carrera,
        semestre,
        plan,
        horas_disponibles,
        metodo_estudio,
        tono_asistente,
        metas,
        horas_estudio_diarias,
        horas_sueno,
        notif_tareas,
        notif_examenes,
        notif_ia,
        notif_semanal,
        notif_correo,
        email_verificado,
        app_modo_oscuro,
        app_google_calendar,
        app_sugerencias_automaticas
      )
      values ($1, $2, $3, $4, $5, '', '', '', 'gratis', '4-6', 'pomodoro', 'responsable', '', 4, 8, true, true, true, true, false, true, false, false, true)
      returning
        id,
        nombres,
        apellidos,
        correo,
        rol,
        universidad,
        carrera,
        semestre,
        plan,
        tipo_perfil as "tipoPerfil",
        objetivo_academico as "objetivoAcademico",
        preferencia_micro_sesion as "preferenciaMicroSesion",
        horario_laboral as "horarioLaboral",
        dias_mayor_disponibilidad as "diasMayorDisponibilidad",
        tiene_tesis_proyecto as "tieneTesisProyecto",
        tiempo_real_disponible_dia as "tiempoRealDisponibleDia",
        horas_disponibles as "horasDisponibles",
        metodo_estudio as "metodoEstudio",
        tono_asistente as "tonoAsistente",
        metas,
        horas_estudio_diarias as "horasEstudioDiarias",
        horas_sueno as "horasSueno",
        notif_tareas as "notificacionesTareas",
        notif_examenes as "notificacionesExamenes",
        notif_ia as "notificacionesIa",
        notif_semanal as "notificacionesSemanal",
        notif_correo as "notificacionesCorreo",
        email_verificado as "emailVerificado",
        app_modo_oscuro as "aplicacionModoOscuro",
        app_google_calendar as "aplicacionGoogleCalendar",
        app_sugerencias_automaticas as "aplicacionSugerenciasAutomaticas"
      `,
      [nombres, apellidos, correo, googleSub, crearHashTemporalGoogle()],
    );

    try {
      await enviarBienvenidaCorreo({ nombres, correo });
    } catch (error) {
      console.warn("[email] No se pudo enviar bienvenida de Google:", error.message);
    }

    response.status(201).json({
      usuario: mapearUsuario(resultado.rows[0]),
      requiereCompletarPerfilAcademico: true,
    });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo iniciar sesión con Google.", error: error.message });
  }
});

app.post("/api/auth/register", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const {
    nombres,
    apellidos,
    correo,
    contrasena,
    universidad = "Por definir",
    carrera = "Por definir",
    semestre = "Por definir",
    plan = "gratis",
    tipoPerfil = "universitario",
  } = request.body;

  try {
    const existeUsuario = await pool.query(
      "select id from estudiantes where lower(correo) = lower($1) limit 1",
      [correo],
    );

    if (existeUsuario.rows[0]) {
      response.status(409).json({ mensaje: "Ya existe una cuenta registrada con ese correo." });
      return;
    }

    const hashContrasena = crearHashContrasena(contrasena);
    const resultado = await pool.query(
      `
      insert into estudiantes (
        nombres,
        apellidos,
        correo,
        hash_contrasena,
        universidad,
        carrera,
        semestre,
        plan,
        tipo_perfil,
        horas_disponibles,
        metodo_estudio,
        tono_asistente,
        metas,
        horas_estudio_diarias,
        horas_sueno,
        notif_tareas,
        notif_examenes,
        notif_ia,
        notif_semanal,
        notif_correo,
        app_modo_oscuro,
        app_google_calendar,
        app_sugerencias_automaticas
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, '4-6', 'pomodoro', 'responsable', '', 4, 8, true, true, true, true, false, false, false, true)
      returning
        id,
        nombres,
        apellidos,
        correo,
        rol,
        universidad,
        carrera,
        semestre,
        plan,
        tipo_perfil as "tipoPerfil",
        objetivo_academico as "objetivoAcademico",
        preferencia_micro_sesion as "preferenciaMicroSesion",
        horario_laboral as "horarioLaboral",
        dias_mayor_disponibilidad as "diasMayorDisponibilidad",
        tiene_tesis_proyecto as "tieneTesisProyecto",
        tiempo_real_disponible_dia as "tiempoRealDisponibleDia",
        horas_disponibles as "horasDisponibles",
        metodo_estudio as "metodoEstudio",
        tono_asistente as "tonoAsistente",
        metas,
        horas_estudio_diarias as "horasEstudioDiarias",
        horas_sueno as "horasSueno",
        notif_tareas as "notificacionesTareas",
        notif_examenes as "notificacionesExamenes",
        notif_ia as "notificacionesIa",
        notif_semanal as "notificacionesSemanal",
        notif_correo as "notificacionesCorreo",
        email_verificado as "emailVerificado",
        app_modo_oscuro as "aplicacionModoOscuro",
        app_google_calendar as "aplicacionGoogleCalendar",
        app_sugerencias_automaticas as "aplicacionSugerenciasAutomaticas"
      `,
      [nombres, apellidos, correo, hashContrasena, universidad, carrera, semestre, plan, tipoPerfil],
    );

    let verificacionCorreoEnviada = false;
    try {
      const envio = await enviarVerificacionCorreo({
        estudianteId: resultado.rows[0].id,
        nombres,
        correo,
      });
      verificacionCorreoEnviada = Boolean(envio.ok);
    } catch (error) {
      console.warn("[email] No se pudo enviar verificacion de correo:", error.message);
    }

    response.status(201).json({
      usuario: mapearUsuario(resultado.rows[0]),
      verificacionCorreoEnviada,
    });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo registrar el usuario.", error: error.message });
  }
});

app.post("/api/auth/verify-email", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const token = String(request.body?.token || "").trim();
  if (!token) {
    response.status(400).json({ mensaje: "Token de verificacion requerido." });
    return;
  }

  try {
    const tokenHash = crearHashToken(token);
    const resultado = await pool.query(
      `
      update estudiantes
      set email_verificado = true,
          email_verificacion_token = null,
          email_verificacion_expira = null,
          notif_correo = true
      where email_verificacion_token = $1
        and email_verificacion_expira > now()
      returning
        id,
        nombres,
        apellidos,
        correo,
        rol,
        universidad,
        carrera,
        semestre,
        plan,
        tipo_perfil as "tipoPerfil",
        objetivo_academico as "objetivoAcademico",
        preferencia_micro_sesion as "preferenciaMicroSesion",
        horario_laboral as "horarioLaboral",
        dias_mayor_disponibilidad as "diasMayorDisponibilidad",
        tiene_tesis_proyecto as "tieneTesisProyecto",
        tiempo_real_disponible_dia as "tiempoRealDisponibleDia",
        horas_disponibles as "horasDisponibles",
        metodo_estudio as "metodoEstudio",
        tono_asistente as "tonoAsistente",
        metas,
        horas_estudio_diarias as "horasEstudioDiarias",
        horas_sueno as "horasSueno",
        notif_tareas as "notificacionesTareas",
        notif_examenes as "notificacionesExamenes",
        notif_ia as "notificacionesIa",
        notif_semanal as "notificacionesSemanal",
        notif_correo as "notificacionesCorreo",
        email_verificado as "emailVerificado",
        app_modo_oscuro as "aplicacionModoOscuro",
        app_google_calendar as "aplicacionGoogleCalendar",
        app_sugerencias_automaticas as "aplicacionSugerenciasAutomaticas"
      `,
      [tokenHash],
    );

    if (!resultado.rows[0]) {
      response.status(400).json({ mensaje: "El enlace de verificacion no es valido o ya expiro." });
      return;
    }

    const usuarioActualizado = resultado.rows[0];
    try {
      await enviarBienvenidaCorreo({
        nombres: usuarioActualizado.nombres,
        correo: usuarioActualizado.correo,
      });
    } catch (error) {
      console.warn("[email] No se pudo enviar bienvenida:", error.message);
    }

    if (request.body?.notificaciones?.correo === true && !usuarioActualizado.emailVerificado) {
      try {
        await enviarVerificacionCorreo({
          estudianteId: usuarioActualizado.id,
          nombres: usuarioActualizado.nombres,
          correo: usuarioActualizado.correo,
        });
      } catch (error) {
        console.warn("[email] No se pudo enviar verificacion al activar correo:", error.message);
      }
    }

    response.json({ usuario: mapearUsuario(usuarioActualizado) });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo verificar el correo.", error: error.message });
  }
});

app.post("/api/auth/resend-verification", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const estudianteId = String(request.body?.estudianteId || "").trim();
  if (!estudianteId) {
    response.status(400).json({ mensaje: "estudianteId requerido." });
    return;
  }

  try {
    const resultado = await pool.query(
      "select id, nombres, correo, email_verificado as \"emailVerificado\" from estudiantes where id = $1 limit 1",
      [estudianteId],
    );
    const usuario = resultado.rows[0];

    if (!usuario) {
      response.status(404).json({ mensaje: "Usuario no encontrado." });
      return;
    }

    if (usuario.emailVerificado) {
      response.json({ ok: true, yaVerificado: true });
      return;
    }

    const envio = await enviarVerificacionCorreo({
      estudianteId: usuario.id,
      nombres: usuario.nombres,
      correo: usuario.correo,
      tipo: "reenvio",
    });

    response.json({ ok: Boolean(envio.ok), omitido: Boolean(envio.omitido) });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo reenviar la verificacion.", error: error.message });
  }
});

app.get("/api/admin/metrics", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    const admin = await obtenerAdministradorSolicitante(request, response);
    if (!admin) return;

    const [
      totalUsuarios,
      totalUsuariosVerificados,
      totalCursos,
      totalTareas,
      totalExamenes,
      totalProyectosLargos,
      totalTrabajosGrupales,
      totalNotificaciones,
      usuariosPorPlan,
      usuariosPorVerificacion,
      usuariosPorRol,
      tareasPorEstado,
      usuariosRecientes,
      usuariosPorMetodoEstudio,
      usuariosPorTonoAsistente,
      usuariosPorObjetivo,
      usuariosPorTipoPerfil,
      usuariosPorMicroSesion,
    ] = await Promise.all([
      contarTabla("estudiantes"),
      pool.query("select count(*)::int as total from estudiantes where email_verificado = true"),
      contarTabla("cursos"),
      contarTabla("tareas"),
      contarTabla("examenes"),
      contarTabla("proyectos_largos"),
      contarTabla("proyectos_grupales"),
      contarTabla("notificaciones"),
      pool.query("select plan, count(*)::int as total from estudiantes group by plan order by plan asc"),
      pool.query(
        "select case when email_verificado then 'verificado' else 'no_verificado' end as estado, count(*)::int as total from estudiantes group by email_verificado order by estado asc",
      ),
      pool.query("select rol, count(*)::int as total from estudiantes group by rol order by rol asc"),
      pool.query("select estado, count(*)::int as total from tareas group by estado order by estado asc"),
      pool.query("select count(*)::int as total from estudiantes where creado_en >= now() - interval '30 days'"),
      pool.query("select coalesce(nullif(metodo_estudio, ''), 'sin_definir') as metodo, count(*)::int as total from estudiantes group by metodo order by total desc, metodo asc"),
      pool.query("select coalesce(nullif(tono_asistente, ''), 'responsable') as tono, count(*)::int as total from estudiantes group by tono order by total desc, tono asc"),
      pool.query("select objetivo_academico as objetivo, count(*)::int as total from estudiantes group by objetivo_academico order by total desc, objetivo_academico asc"),
      pool.query("select tipo_perfil as tipo, count(*)::int as total from estudiantes group by tipo_perfil order by total desc, tipo_perfil asc"),
      pool.query("select preferencia_micro_sesion as duracion, count(*)::int as total from estudiantes group by preferencia_micro_sesion order by duracion asc"),
    ]);

    const totalUsuariosSeguro = totalUsuarios ?? 0;
    const totalTareasSeguro = totalTareas ?? 0;
    const totalCursosSeguro = totalCursos ?? 0;
    const totalExamenesSeguro = totalExamenes ?? 0;
    const verificados = totalUsuariosVerificados.rows[0]?.total ?? 0;
    const calcularPromedio = (total) => (totalUsuariosSeguro > 0 ? Number((total / totalUsuariosSeguro).toFixed(2)) : 0);

    response.json({
      totalUsuarios,
      totalUsuariosVerificados: verificados,
      totalCursos,
      totalTareas,
      totalExamenes,
      totalProyectosLargos,
      totalTrabajosGrupales,
      totalNotificaciones,
      usuariosPorPlan: usuariosPorPlan.rows,
      usuariosPorVerificacion: usuariosPorVerificacion.rows,
      usuariosPorRol: usuariosPorRol.rows,
      tareasPorEstado: tareasPorEstado.rows,
      usuariosRecientes: usuariosRecientes.rows[0]?.total ?? 0,
      usuariosPorMetodoEstudio: usuariosPorMetodoEstudio.rows,
      usuariosPorTonoAsistente: usuariosPorTonoAsistente.rows,
      usuariosPorObjetivo: usuariosPorObjetivo.rows,
      usuariosPorTipoPerfil: usuariosPorTipoPerfil.rows,
      usuariosPorMicroSesion: usuariosPorMicroSesion.rows,
      porcentajeVerificacion: totalUsuariosSeguro > 0 ? Math.round((verificados / totalUsuariosSeguro) * 100) : 0,
      promedioCursosPorUsuario: calcularPromedio(totalCursosSeguro),
      promedioTareasPorUsuario: calcularPromedio(totalTareasSeguro),
      promedioExamenesPorUsuario: calcularPromedio(totalExamenesSeguro),
    });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudieron cargar las metricas admin.", error: error.message });
  }
});

app.get("/api/admin/users", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    const admin = await obtenerAdministradorSolicitante(request, response);
    if (!admin) return;

    const resultado = await pool.query(
      `
      select
        e.id,
        e.nombres,
        e.apellidos,
        e.correo,
        e.rol,
        e.email_verificado as "emailVerificado",
        e.plan,
        e.creado_en as "creadoEn",
        count(distinct c.id)::int as "totalCursos",
        count(distinct t.id)::int as "totalTareas",
        count(distinct ex.id)::int as "totalExamenes"
      from estudiantes e
      left join cursos c on c.estudiante_id = e.id
      left join tareas t on t.estudiante_id = e.id
      left join examenes ex on ex.estudiante_id = e.id
      group by e.id
      order by e.creado_en desc
      `,
    );

    response.json(
      resultado.rows.map((usuario) => ({
        id: usuario.id,
        nombre: `${usuario.nombres} ${usuario.apellidos}`.trim(),
        correo: usuario.correo,
        rol: usuario.rol ?? "estudiante",
        emailVerificado: Boolean(usuario.emailVerificado),
        plan: usuario.plan,
        creadoEn: usuario.creadoEn,
        totalCursos: usuario.totalCursos,
        totalTareas: usuario.totalTareas,
        totalExamenes: usuario.totalExamenes,
      })),
    );
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudieron cargar los usuarios admin.", error: error.message });
  }
});

app.get("/api/admin/users/:userId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    const admin = await obtenerAdministradorSolicitante(request, response);
    if (!admin) return;

    const [usuario, cursos, tareas, examenes, notificaciones, proyectosLargos, trabajosGrupales] = await Promise.all([
      pool.query(
        `
        select
          id,
          nombres,
          apellidos,
          correo,
          rol,
          universidad,
          carrera,
          semestre,
          plan,
          tipo_perfil as "tipoPerfil",
          objetivo_academico as "objetivoAcademico",
          preferencia_micro_sesion as "preferenciaMicroSesion",
          horario_laboral as "horarioLaboral",
          dias_mayor_disponibilidad as "diasMayorDisponibilidad",
          tiene_tesis_proyecto as "tieneTesisProyecto",
          tiempo_real_disponible_dia as "tiempoRealDisponibleDia",
          horas_disponibles as "horasDisponibles",
          metodo_estudio as "metodoEstudio",
          tono_asistente as "tonoAsistente",
          metas,
          horas_estudio_diarias as "horasEstudioDiarias",
          horas_sueno as "horasSueno",
          email_verificado as "emailVerificado",
          creado_en as "creadoEn"
        from estudiantes
        where id = $1
        limit 1
        `,
        [request.params.userId],
      ),
      pool.query(
        `
        select id, nombre, docente, semestre, color
        from cursos
        where estudiante_id = $1
        order by nombre asc
        limit 6
        `,
        [request.params.userId],
      ),
      pool.query(
        `
        select titulo, prioridad, estado, progreso, fecha_entrega as "fechaEntrega"
        from tareas
        where estudiante_id = $1
        order by fecha_entrega asc
        limit 6
        `,
        [request.params.userId],
      ),
      pool.query(
        `
        select titulo, fecha_examen as fecha, preparacion
        from examenes
        where estudiante_id = $1
        order by fecha_examen asc
        limit 5
        `,
        [request.params.userId],
      ),
      pool.query("select count(*)::int as total from notificaciones where estudiante_id = $1", [request.params.userId]),
      pool.query("select count(*)::int as total from proyectos_largos where estudiante_id = $1", [request.params.userId]),
      pool.query("select count(*)::int as total from proyectos_grupales where estudiante_id = $1", [request.params.userId]),
    ]);

    const row = usuario.rows[0];
    if (!row) {
      response.status(404).json({ mensaje: "Usuario no encontrado." });
      return;
    }

    response.json({
      id: row.id,
      nombre: `${row.nombres} ${row.apellidos}`.trim(),
      correo: row.correo,
      rol: row.rol,
      plan: row.plan,
      emailVerificado: Boolean(row.emailVerificado),
      creadoEn: row.creadoEn,
      universidad: row.universidad,
      carrera: row.carrera,
      semestre: row.semestre,
      tipoPerfil: row.tipoPerfil,
      objetivoAcademico: row.objetivoAcademico,
      preferenciaMicroSesion: row.preferenciaMicroSesion,
      horarioLaboral: row.horarioLaboral,
      diasMayorDisponibilidad: row.diasMayorDisponibilidad,
      tieneTesisProyecto: Boolean(row.tieneTesisProyecto),
      tiempoRealDisponibleDia: row.tiempoRealDisponibleDia,
      horasDisponibles: row.horasDisponibles,
      metodoEstudio: row.metodoEstudio,
      tonoAsistente: row.tonoAsistente,
      metas: row.metas,
      horasEstudioDiarias: row.horasEstudioDiarias,
      horasSueno: row.horasSueno,
      cursos: cursos.rows,
      tareas: tareas.rows,
      examenes: examenes.rows,
      totalNotificaciones: notificaciones.rows[0]?.total ?? 0,
      totalProyectosLargos: proyectosLargos.rows[0]?.total ?? 0,
      totalTrabajosGrupales: trabajosGrupales.rows[0]?.total ?? 0,
    });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo cargar el detalle del usuario.", error: error.message });
  }
});

app.patch("/api/admin/users/:userId/role", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const rol = normalizarRolAdmin(request.body?.rol);
  if (!ROLES_ADMIN_PERMITIDOS.includes(rol)) {
    response.status(400).json({ mensaje: "Rol no valido." });
    return;
  }

  try {
    const admin = await obtenerAdministradorSolicitante(request, response);
    if (!admin) return;

    if (admin.rol !== "superadmin") {
      response.status(403).json({ mensaje: "Solo un superadmin puede cambiar roles." });
      return;
    }

    const cliente = await pool.connect();

    try {
      await cliente.query("begin");

      const usuarioObjetivo = await cliente.query(
        "select id, rol from estudiantes where id = $1 limit 1",
        [request.params.userId],
      );

      if (!usuarioObjetivo.rows[0]) {
        await cliente.query("rollback");
        response.status(404).json({ mensaje: "Usuario no encontrado." });
        return;
      }

      const rolActual = usuarioObjetivo.rows[0].rol;

      if (admin.id === request.params.userId && rolActual === "superadmin" && rol !== "superadmin") {
        await cliente.query("rollback");
        response.status(403).json({ mensaje: "No puedes quitarte tu propio rol de superadmin." });
        return;
      }

      if (rolActual === "superadmin" && rol !== "superadmin") {
        const totalSuperadmins = await cliente.query("select count(*)::int as total from estudiantes where rol = 'superadmin'");
        if ((totalSuperadmins.rows[0]?.total ?? 0) <= 1) {
          await cliente.query("rollback");
          response.status(400).json({ mensaje: "Debe existir al menos un superadmin en el sistema." });
          return;
        }
      }

      const resultado = await cliente.query(
        `
        update estudiantes
        set rol = $1
        where id = $2
        returning id, nombres, apellidos, correo, rol, email_verificado as "emailVerificado", plan, creado_en as "creadoEn"
        `,
        [rol, request.params.userId],
      );

      if (!resultado.rows[0]) {
        await cliente.query("rollback");
        response.status(404).json({ mensaje: "Usuario no encontrado." });
        return;
      }

      await registrarAuditoriaAdmin(cliente, {
        adminId: admin.id,
        targetUserId: request.params.userId,
        action: "change_role",
        oldValue: rolActual,
        newValue: rol,
      });
      await cliente.query("commit");

      const usuario = resultado.rows[0];
      response.json({
        id: usuario.id,
        nombre: `${usuario.nombres} ${usuario.apellidos}`.trim(),
        correo: usuario.correo,
        rol: usuario.rol,
        emailVerificado: Boolean(usuario.emailVerificado),
        plan: usuario.plan,
        creadoEn: usuario.creadoEn,
      });
    } catch (error) {
      await cliente.query("rollback");
      throw error;
    } finally {
      cliente.release();
    }

  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo cambiar el rol.", error: error.message });
  }
});

app.patch("/api/admin/users/:userId/plan", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const plan = normalizarPlanAdmin(request.body?.plan);
  if (!PLANES_ADMIN_PERMITIDOS.includes(plan)) {
    response.status(400).json({ mensaje: "Plan no valido." });
    return;
  }

  try {
    const admin = await obtenerAdministradorSolicitante(request, response);
    if (!admin) return;

    const cliente = await pool.connect();

    try {
      await cliente.query("begin");

      const usuarioObjetivo = await cliente.query(
        "select id, rol, plan from estudiantes where id = $1 limit 1",
        [request.params.userId],
      );

      const objetivo = usuarioObjetivo.rows[0];
      if (!objetivo) {
        await cliente.query("rollback");
        response.status(404).json({ mensaje: "Usuario no encontrado." });
        return;
      }

      if (objetivo.rol === "superadmin" || (admin.rol === "admin" && objetivo.rol !== "estudiante")) {
        await cliente.query("rollback");
        response.status(403).json({ mensaje: "No tienes permisos para modificar este usuario." });
        return;
      }

      const resultado = await cliente.query(
        `
        update estudiantes
        set plan = $1
        where id = $2
        returning id, nombres, apellidos, correo, rol, email_verificado as "emailVerificado", plan, creado_en as "creadoEn"
        `,
        [plan, request.params.userId],
      );

      if (!resultado.rows[0]) {
        await cliente.query("rollback");
        response.status(404).json({ mensaje: "Usuario no encontrado." });
        return;
      }

      await registrarAuditoriaAdmin(cliente, {
        adminId: admin.id,
        targetUserId: request.params.userId,
        action: "change_plan",
        oldValue: objetivo.plan,
        newValue: plan,
      });
      await cliente.query("commit");

      const usuario = resultado.rows[0];
      response.json({
        id: usuario.id,
        nombre: `${usuario.nombres} ${usuario.apellidos}`.trim(),
        correo: usuario.correo,
        rol: usuario.rol,
        emailVerificado: Boolean(usuario.emailVerificado),
        plan: usuario.plan,
        creadoEn: usuario.creadoEn,
      });
    } catch (error) {
      await cliente.query("rollback");
      throw error;
    } finally {
      cliente.release();
    }
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo cambiar el plan.", error: error.message });
  }
});

app.get("/api/salud", async (_request, response) => {
  const ia = {
    proveedor: obtenerProveedorIAActivo(),
    modelo: obtenerModeloIAActivo(),
    configurada: hayClienteIAConfigurado(),
  };

  if (!pool) {
    response.json({ ok: true, baseDeDatos: "no-configurada", ia });
    return;
  }

  try {
    await pool.query("select 1");
    response.json({ ok: true, baseDeDatos: "conectada", ia });
  } catch (error) {
    response.status(500).json({ ok: false, baseDeDatos: "error", ia, mensaje: error.message });
  }
});

app.get("/api/resumen-panel/:estudianteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { estudianteId } = request.params;

  try {
    const [tareas, examenes, horasEstudio] = await Promise.all([
      pool.query(
        "select count(*)::int as total from tareas where estudiante_id = $1 and estado <> 'completed'",
        [estudianteId],
      ),
      pool.query(
        "select count(*)::int as total from examenes where estudiante_id = $1 and fecha_examen >= current_date",
        [estudianteId],
      ),
      pool.query(
        "select coalesce(sum(horas_duracion), 0)::float as total from bloques_planificador where estudiante_id = $1 and tipo_bloque = 'study'",
        [estudianteId],
      ),
    ]);

    response.json({
      tareasPendientes: tareas.rows[0]?.total ?? 0,
      examenesProximos: examenes.rows[0]?.total ?? 0,
      horasEstudioSugeridas: horasEstudio.rows[0]?.total ?? 0,
    });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo obtener el resumen.", error: error.message });
  }
});

app.get("/api/contexto/:estudianteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    const contexto = await obtenerContextoEstudiante(request.params.estudianteId);
    response.json(contexto);
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo cargar el contexto.", error: error.message });
  }
});

app.patch("/api/perfil/:estudianteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { estudianteId } = request.params;
  const { campos, valores } = construirCamposPerfil(request.body);

  if (!campos.length) {
    response.status(400).json({ mensaje: "No se enviaron cambios validos." });
    return;
  }

  valores.push(estudianteId);

  try {
    const resultado = await pool.query(
      `
      update estudiantes
      set ${campos.join(", ")}
      where id = $${valores.length}
      returning
        id,
        nombres,
        apellidos,
        correo,
        rol,
        universidad,
        carrera,
        semestre,
        plan,
        tipo_perfil as "tipoPerfil",
        objetivo_academico as "objetivoAcademico",
        preferencia_micro_sesion as "preferenciaMicroSesion",
        horario_laboral as "horarioLaboral",
        dias_mayor_disponibilidad as "diasMayorDisponibilidad",
        tiene_tesis_proyecto as "tieneTesisProyecto",
        tiempo_real_disponible_dia as "tiempoRealDisponibleDia",
        horas_disponibles as "horasDisponibles",
        metodo_estudio as "metodoEstudio",
        tono_asistente as "tonoAsistente",
        metas,
        horas_estudio_diarias as "horasEstudioDiarias",
        horas_sueno as "horasSueno",
        notif_tareas as "notificacionesTareas",
        notif_examenes as "notificacionesExamenes",
        notif_ia as "notificacionesIa",
        notif_semanal as "notificacionesSemanal",
        notif_correo as "notificacionesCorreo",
        email_verificado as "emailVerificado",
        app_modo_oscuro as "aplicacionModoOscuro",
        app_google_calendar as "aplicacionGoogleCalendar",
        app_sugerencias_automaticas as "aplicacionSugerenciasAutomaticas"
      `,
      valores,
    );

    response.json({ usuario: mapearUsuario(resultado.rows[0]) });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar el perfil.", error: error.message });
  }
});

app.post("/api/cursos", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { estudianteId, nombre, docente, horario, semestre, color, descripcion } = request.body;

  try {
    const resultado = await pool.query(
      `
      insert into cursos (
        estudiante_id,
        nombre,
        docente,
        horario_texto,
        semestre,
        color,
        descripcion
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning
        id,
        nombre,
        docente,
        horario_texto as horario,
        semestre,
        color,
        descripcion
      `,
      [estudianteId, nombre, docente, horario, semestre, color, descripcion],
    );

    response.status(201).json(mapearCurso(resultado.rows[0]));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo crear el curso.", error: error.message });
  }
});

app.patch("/api/cursos/:cursoId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { cursoId } = request.params;
  const campos = [];
  const valores = [];
  const mapa = {
    nombre: "nombre",
    docente: "docente",
    horario: "horario_texto",
    semestre: "semestre",
    color: "color",
    descripcion: "descripcion",
  };

  Object.entries(request.body).forEach(([clave, valor]) => {
    const columna = mapa[clave];
    if (!columna) return;
    valores.push(valor);
    campos.push(`${columna} = $${valores.length}`);
  });

  if (!campos.length) {
    response.status(400).json({ mensaje: "No se enviaron cambios validos." });
    return;
  }

  valores.push(cursoId);

  try {
    const resultado = await pool.query(
      `
      update cursos
      set ${campos.join(", ")}
      where id = $${valores.length}
      returning
        id,
        nombre,
        docente,
        horario_texto as horario,
        semestre,
        color,
        descripcion
      `,
      valores,
    );

    if (!resultado.rows[0]) {
      response.status(404).json({ mensaje: "Curso no encontrado." });
      return;
    }

    response.json(mapearCurso(resultado.rows[0]));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar el curso.", error: error.message });
  }
});

app.delete("/api/cursos/:cursoId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    await pool.query("delete from cursos where id = $1", [request.params.cursoId]);
    response.json({ ok: true });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo eliminar el curso.", error: error.message });
  }
});

app.get("/api/tareas/:estudianteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    const resultado = await pool.query(
      `
      select
        t.id,
        t.titulo,
        t.descripcion,
        t.estado,
        t.prioridad,
        t.progreso,
        t.horas_estimadas as "horasEstimadas",
        t.fecha_entrega as "fechaEntrega",
        c.id as "cursoId",
        c.nombre as "cursoNombre"
      from tareas t
      join cursos c on c.id = t.curso_id
      where t.estudiante_id = $1
      order by t.fecha_entrega asc
      `,
      [request.params.estudianteId],
    );

    const tareasConSubtareas = await mapearTareasConSubtareas(resultado.rows);
    response.json(
      tareasConSubtareas.map((tarea, indice) => ({
        ...tarea,
        cursoNombre: resultado.rows[indice].cursoNombre,
      })),
    );
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudieron listar las tareas.", error: error.message });
  }
});

app.post("/api/tareas", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const {
    estudianteId,
    cursoId,
    titulo,
    descripcion,
    fechaEntrega,
    prioridad,
    horasEstimadas,
  } = request.body;

  try {
    const resultado = await pool.query(
      `
      insert into tareas (
        estudiante_id,
        curso_id,
        titulo,
        descripcion,
        fecha_entrega,
        prioridad,
        horas_estimadas
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning
        id,
        curso_id as "cursoId",
        titulo,
        descripcion,
        fecha_entrega as "fechaEntrega",
        prioridad,
        estado,
        horas_estimadas as "horasEstimadas",
        progreso
      `,
      [estudianteId, cursoId, titulo, descripcion, fechaEntrega, prioridad, horasEstimadas],
    );

    response.status(201).json(await obtenerTareaPorId(resultado.rows[0].id));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo crear la tarea.", error: error.message });
  }
});

app.patch("/api/tareas/:tareaId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { tareaId } = request.params;
  const campos = [];
  const valores = [];
  const mapa = {
    cursoId: "curso_id",
    titulo: "titulo",
    descripcion: "descripcion",
    fechaEntrega: "fecha_entrega",
    prioridad: "prioridad",
    estado: "estado",
    horasEstimadas: "horas_estimadas",
    progreso: "progreso",
  };

  Object.entries(request.body).forEach(([clave, valor]) => {
    const columna = mapa[clave];
    if (!columna) return;
    valores.push(valor);
    campos.push(`${columna} = $${valores.length}`);
  });

  if (!campos.length) {
    response.status(400).json({ mensaje: "No se enviaron cambios validos." });
    return;
  }

  valores.push(tareaId);

  try {
    const resultado = await pool.query(
      `
      update tareas
      set ${campos.join(", ")}
      where id = $${valores.length}
      returning
        id,
        curso_id as "cursoId",
        titulo,
        descripcion,
        fecha_entrega as "fechaEntrega",
        prioridad,
        estado,
        horas_estimadas as "horasEstimadas",
        progreso
      `,
      valores,
    );

    if (!resultado.rows[0]) {
      response.status(404).json({ mensaje: "Tarea no encontrada." });
      return;
    }

    response.json(await obtenerTareaPorId(resultado.rows[0].id));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar la tarea.", error: error.message });
  }
});

app.delete("/api/tareas/:tareaId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    const resultado = await pool.query("delete from tareas where id = $1 returning id", [request.params.tareaId]);
    if (!resultado.rows[0]) {
      response.status(404).json({ mensaje: "Tarea no encontrada." });
      return;
    }
    response.json({ ok: true });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo eliminar la tarea.", error: error.message });
  }
});

app.post("/api/tareas/:tareaId/subtareas", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const titulo = String(request.body?.titulo || "").trim();
  if (!titulo) {
    response.status(400).json({ mensaje: "Titulo de subtarea requerido." });
    return;
  }

  try {
    const tarea = await pool.query("select id from tareas where id = $1 limit 1", [request.params.tareaId]);
    if (!tarea.rows[0]) {
      response.status(404).json({ mensaje: "Tarea no encontrada." });
      return;
    }

    await pool.query("insert into subtareas (tarea_id, titulo) values ($1, $2)", [request.params.tareaId, titulo]);
    await sincronizarResumenChecklistTarea(request.params.tareaId);
    response.status(201).json(await obtenerTareaPorId(request.params.tareaId));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo crear la subtarea.", error: error.message });
  }
});

app.patch("/api/subtareas/:subtareaId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const campos = construirCamposActualizacion(request.body, {
    titulo: "titulo",
    completada: "completada",
  });

  if (!campos.sets.length) {
    response.status(400).json({ mensaje: "No se enviaron cambios validos." });
    return;
  }

  try {
    const resultado = await pool.query(
      `
      update subtareas
      set ${campos.sets.join(", ")}
      where id = $${campos.valores.length + 1}
      returning tarea_id as "tareaId"
      `,
      [...campos.valores, request.params.subtareaId],
    );

    if (!resultado.rows[0]) {
      response.status(404).json({ mensaje: "Subtarea no encontrada." });
      return;
    }

    await sincronizarResumenChecklistTarea(resultado.rows[0].tareaId);
    response.json(await obtenerTareaPorId(resultado.rows[0].tareaId));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar la subtarea.", error: error.message });
  }
});

app.delete("/api/subtareas/:subtareaId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    const resultado = await pool.query(
      "delete from subtareas where id = $1 returning tarea_id as \"tareaId\"",
      [request.params.subtareaId],
    );

    if (!resultado.rows[0]) {
      response.status(404).json({ mensaje: "Subtarea no encontrada." });
      return;
    }

    await sincronizarResumenChecklistTarea(resultado.rows[0].tareaId);
    response.json(await obtenerTareaPorId(resultado.rows[0].tareaId));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo eliminar la subtarea.", error: error.message });
  }
});

app.post("/api/examenes", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { estudianteId, cursoId, titulo, fecha, hora, temas, preparacion } = request.body;

  try {
    const resultado = await pool.query(
      `
      insert into examenes (
        estudiante_id,
        curso_id,
        titulo,
        fecha_examen,
        hora_examen,
        temas,
        preparacion
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning
        id,
        curso_id as "cursoId",
        titulo,
        fecha_examen as fecha,
        hora_examen as hora,
        temas,
        preparacion
      `,
      [estudianteId, cursoId, titulo, fecha, hora, temas, preparacion],
    );

    response.status(201).json(mapearExamen(resultado.rows[0]));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo crear el examen.", error: error.message });
  }
});

app.patch("/api/examenes/:examenId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { examenId } = request.params;
  const campos = [];
  const valores = [];
  const mapa = {
    cursoId: "curso_id",
    titulo: "titulo",
    fecha: "fecha_examen",
    hora: "hora_examen",
    temas: "temas",
    preparacion: "preparacion",
  };

  Object.entries(request.body).forEach(([clave, valor]) => {
    const columna = mapa[clave];
    if (!columna) return;
    valores.push(valor);
    campos.push(`${columna} = $${valores.length}`);
  });

  if (!campos.length) {
    response.status(400).json({ mensaje: "No se enviaron cambios validos." });
    return;
  }

  valores.push(examenId);

  try {
    const resultado = await pool.query(
      `
      update examenes
      set ${campos.join(", ")}
      where id = $${valores.length}
      returning
        id,
        curso_id as "cursoId",
        titulo,
        fecha_examen as fecha,
        hora_examen as hora,
        temas,
        preparacion
      `,
      valores,
    );

    if (!resultado.rows[0]) {
      response.status(404).json({ mensaje: "Examen no encontrado." });
      return;
    }

    response.json(mapearExamen(resultado.rows[0]));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar el examen.", error: error.message });
  }
});

app.delete("/api/examenes/:examenId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    await pool.query("delete from examenes where id = $1", [request.params.examenId]);
    response.json({ ok: true });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo eliminar el examen.", error: error.message });
  }
});

app.get("/api/proyectos-largos/:estudianteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    response.json(await obtenerProyectosLargosEstudiante(request.params.estudianteId));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudieron obtener los proyectos largos.", error: error.message });
  }
});

app.post("/api/proyectos-largos", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { estudianteId, cursoId, titulo, descripcion = "", tipo = "proyecto_final", fechaLimite } = request.body;
  try {
    const resultado = await pool.query(
      `
      insert into proyectos_largos (estudiante_id, curso_id, titulo, descripcion, tipo, fecha_limite)
      values ($1, $2, $3, $4, $5, $6)
      returning id
      `,
      [estudianteId, cursoId || null, titulo, descripcion, tipo, fechaLimite],
    );
    response.status(201).json(await obtenerProyectoLargoPorId(resultado.rows[0].id));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo crear el proyecto largo.", error: error.message });
  }
});

app.patch("/api/proyectos-largos/:proyectoId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const campos = construirCamposActualizacion(
    request.body,
    {
      cursoId: "curso_id",
      titulo: "titulo",
      descripcion: "descripcion",
      tipo: "tipo",
      fechaLimite: "fecha_limite",
      faseActual: "fase_actual",
      progreso: "progreso",
      ultimoAvance: "ultimo_avance",
    },
  );
  if (!campos.sets.length) {
    response.json(await obtenerProyectoLargoPorId(request.params.proyectoId));
    return;
  }
  try {
    await pool.query(
      `update proyectos_largos set ${campos.sets.join(", ")} where id = $${campos.valores.length + 1}`,
      [...campos.valores, request.params.proyectoId],
    );
    response.json(await obtenerProyectoLargoPorId(request.params.proyectoId));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar el proyecto largo.", error: error.message });
  }
});

app.delete("/api/proyectos-largos/:proyectoId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    await pool.query("delete from proyectos_largos where id = $1", [request.params.proyectoId]);
    response.json({ ok: true });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo eliminar el proyecto largo.", error: error.message });
  }
});

app.post("/api/proyectos-largos/:proyectoId/pasos", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { titulo, fase = "investigacion" } = request.body;
  try {
    await pool.query(
      "insert into pasos_proyecto_largo (proyecto_id, titulo, fase) values ($1, $2, $3)",
      [request.params.proyectoId, titulo, fase],
    );
    response.status(201).json(await obtenerProyectoLargoPorId(request.params.proyectoId));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo crear el paso del proyecto.", error: error.message });
  }
});

app.patch("/api/proyectos-largos/pasos/:pasoId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const campos = construirCamposActualizacion(
    request.body,
    { titulo: "titulo", fase: "fase", completado: "completado" },
  );
  try {
    const paso = await pool.query("select proyecto_id from pasos_proyecto_largo where id = $1", [request.params.pasoId]);
    if (!paso.rows[0]) {
      response.status(404).json({ mensaje: "Paso no encontrado." });
      return;
    }
    if (campos.sets.length) {
      await pool.query(
        `update pasos_proyecto_largo set ${campos.sets.join(", ")} where id = $${campos.valores.length + 1}`,
        [...campos.valores, request.params.pasoId],
      );
    }
    response.json(await obtenerProyectoLargoPorId(paso.rows[0].proyecto_id));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar el paso del proyecto.", error: error.message });
  }
});

app.get("/api/trabajos-grupales/:estudianteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    response.json(await obtenerProyectosGrupalesEstudiante(request.params.estudianteId));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudieron obtener los trabajos grupales.", error: error.message });
  }
});

app.post("/api/trabajos-grupales", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { estudianteId, cursoId, nombre, descripcion = "", fechaLimite } = request.body;
  try {
    const codigoInvitacion = crearCodigoInvitacion();
    const resultado = await pool.query(
      `
      insert into proyectos_grupales (estudiante_id, curso_id, nombre, descripcion, fecha_limite, codigo_invitacion)
      values ($1, $2, $3, $4, $5, $6)
      returning id
      `,
      [estudianteId, cursoId || null, nombre, descripcion, fechaLimite, codigoInvitacion],
    );
    response.status(201).json(await obtenerProyectoGrupalPorId(resultado.rows[0].id));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo crear el trabajo grupal.", error: error.message });
  }
});

app.patch("/api/trabajos-grupales/:proyectoId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const campos = construirCamposActualizacion(
    request.body,
    { cursoId: "curso_id", nombre: "nombre", descripcion: "descripcion", fechaLimite: "fecha_limite" },
  );
  try {
    if (campos.sets.length) {
      await pool.query(
        `update proyectos_grupales set ${campos.sets.join(", ")} where id = $${campos.valores.length + 1}`,
        [...campos.valores, request.params.proyectoId],
      );
    }
    response.json(await obtenerProyectoGrupalPorId(request.params.proyectoId));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar el trabajo grupal.", error: error.message });
  }
});

app.delete("/api/trabajos-grupales/:proyectoId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    await pool.query("delete from proyectos_grupales where id = $1", [request.params.proyectoId]);
    response.json({ ok: true });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo eliminar el trabajo grupal.", error: error.message });
  }
});

app.post("/api/trabajos-grupales/:proyectoId/integrantes", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { nombre, correo = "", rol = "Integrante", rolPermiso = "editor" } = request.body;
  const rolPermisoNormalizado = normalizarRolPermiso(rolPermiso);
  try {
    await pool.query(
      "insert into integrantes_proyecto (proyecto_id, nombre, correo, rol, rol_permiso) values ($1, $2, $3, $4, $5)",
      [request.params.proyectoId, nombre, correo, rol, rolPermisoNormalizado],
    );
    response.status(201).json(await obtenerProyectoGrupalPorId(request.params.proyectoId));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo agregar el integrante.", error: error.message });
  }
});

app.patch("/api/trabajos-grupales/integrantes/:integranteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const integrante = await pool.query("select proyecto_id from integrantes_proyecto where id = $1", [request.params.integranteId]);
  if (!integrante.rows.length) {
    return response.status(404).json({ mensaje: "Integrante no encontrado." });
  }

  const body = {
    ...request.body,
    rolPermiso: request.body.rolPermiso ? normalizarRolPermiso(request.body.rolPermiso) : undefined,
  };
  const campos = construirCamposActualizacion(
    body,
    { nombre: "nombre", correo: "correo", rol: "rol", rolPermiso: "rol_permiso" },
  );
  try {
    if (campos.sets.length) {
      await pool.query(
        `update integrantes_proyecto set ${campos.sets.join(", ")} where id = $${campos.valores.length + 1}`,
        [...campos.valores, request.params.integranteId],
      );
    }
    response.json(await obtenerProyectoGrupalPorId(integrante.rows[0].proyecto_id));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar el integrante.", error: error.message });
  }
});

app.delete("/api/trabajos-grupales/integrantes/:integranteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    const integrante = await pool.query(
      "select proyecto_id from integrantes_proyecto where id = $1",
      [request.params.integranteId],
    );

    if (!integrante.rows.length) {
      return response.status(404).json({ mensaje: "Integrante no encontrado." });
    }

    const proyectoId = integrante.rows[0].proyecto_id;
    await pool.query("delete from integrantes_proyecto where id = $1", [request.params.integranteId]);
    response.json(await obtenerProyectoGrupalPorId(proyectoId));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo quitar el integrante.", error: error.message });
  }
});

app.post("/api/trabajos-grupales/:proyectoId/tareas", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { titulo, descripcion = "", responsableId, fechaLimite, prioridad = "medium" } = request.body;
  try {
    await pool.query(
      `
      insert into tareas_grupales (proyecto_id, titulo, descripcion, responsable_id, fecha_limite, prioridad)
      values ($1, $2, $3, $4, $5, $6)
      `,
      [request.params.proyectoId, titulo, descripcion, responsableId || null, fechaLimite, prioridad],
    );
    response.status(201).json(await obtenerProyectoGrupalPorId(request.params.proyectoId));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo crear la tarea grupal.", error: error.message });
  }
});

app.patch("/api/trabajos-grupales/tareas/:tareaId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const campos = construirCamposActualizacion(
    request.body,
    {
      titulo: "titulo",
      descripcion: "descripcion",
      prioridad: "prioridad",
      responsableId: "responsable_id",
      fechaLimite: "fecha_limite",
      estado: "estado",
      progreso: "progreso",
    },
  );
  try {
    const tarea = await pool.query("select proyecto_id from tareas_grupales where id = $1", [request.params.tareaId]);
    if (!tarea.rows[0]) {
      response.status(404).json({ mensaje: "Tarea grupal no encontrada." });
      return;
    }
    if (campos.sets.length) {
      await pool.query(
        `update tareas_grupales set ${campos.sets.join(", ")} where id = $${campos.valores.length + 1}`,
        [...campos.valores, request.params.tareaId],
      );
    }
    response.json(await obtenerProyectoGrupalPorId(tarea.rows[0].proyecto_id));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar la tarea grupal.", error: error.message });
  }
});

app.post("/api/trabajos-grupales/tareas/:tareaId/comentarios", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { autor = "Equipo", comentario } = request.body;
  try {
    const tarea = await pool.query("select proyecto_id from tareas_grupales where id = $1", [request.params.tareaId]);
    if (!tarea.rows.length) {
      return response.status(404).json({ mensaje: "Tarea grupal no encontrada." });
    }
    await pool.query(
      "insert into comentarios_tarea_grupal (tarea_id, autor, comentario) values ($1, $2, $3)",
      [request.params.tareaId, autor, comentario],
    );
    response.status(201).json(await obtenerProyectoGrupalPorId(tarea.rows[0].proyecto_id));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo registrar el comentario.", error: error.message });
  }
});

app.post("/api/trabajos-grupales/tareas/:tareaId/checklist", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { titulo } = request.body;
  try {
    const tarea = await pool.query("select proyecto_id from tareas_grupales where id = $1", [request.params.tareaId]);
    if (!tarea.rows.length) {
      return response.status(404).json({ mensaje: "Tarea grupal no encontrada." });
    }
    await pool.query(
      "insert into checklist_tarea_grupal (tarea_id, titulo) values ($1, $2)",
      [request.params.tareaId, titulo],
    );
    response.status(201).json(await obtenerProyectoGrupalPorId(tarea.rows[0].proyecto_id));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo agregar el checklist.", error: error.message });
  }
});

app.patch("/api/trabajos-grupales/checklist/:itemId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    const item = await pool.query(
      `
      select tg.proyecto_id
      from checklist_tarea_grupal ct
      join tareas_grupales tg on tg.id = ct.tarea_id
      where ct.id = $1
      `,
      [request.params.itemId],
    );
    if (!item.rows.length) {
      return response.status(404).json({ mensaje: "Item de checklist no encontrado." });
    }
    const campos = construirCamposActualizacion(request.body, { titulo: "titulo", completado: "completado" });
    if (campos.sets.length) {
      await pool.query(
        `update checklist_tarea_grupal set ${campos.sets.join(", ")} where id = $${campos.valores.length + 1}`,
        [...campos.valores, request.params.itemId],
      );
    }
    response.json(await obtenerProyectoGrupalPorId(item.rows[0].proyecto_id));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar el checklist.", error: error.message });
  }
});

app.post("/api/micro-sesiones/:estudianteId/sugerir", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    const contexto = await obtenerContextoEstudiante(request.params.estudianteId);
    const tarea = contexto.tareas.find((item) => item.estado !== "completed");
    const duracion = contexto.usuario?.preferenciaMicroSesion ?? 20;
    response.json({
      duracion,
      tareaId: tarea?.id,
      mensaje: tarea
        ? `Hoy tienes poco tiempo disponible. Te recomendamos una micro-sesion de ${duracion} minutos para avanzar "${tarea.titulo}".`
        : `Puedes retomar el ritmo con una micro-sesion de ${duracion} minutos.`,
    });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo sugerir la micro-sesion.", error: error.message });
  }
});

app.post("/api/micro-sesiones/:estudianteId/agendar", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { duracion = 20, titulo = "Micro-sesion de estudio", tareaId } = request.body;
  try {
    const tarea = tareaId
      ? await pool.query("select curso_id as \"cursoId\" from tareas where id = $1", [tareaId])
      : { rows: [] };
    const cursoId = tarea.rows[0]?.cursoId ?? null;
    const resultado = await pool.query(
      `
      insert into bloques_planificador (estudiante_id, curso_id, dia_semana, hora_inicio, horas_duracion, titulo, tipo_bloque, color)
      values ($1, $2, extract(isodow from current_date)::int - 1, 19, $3, $4, 'micro_session', 'teal')
      returning id, curso_id as "cursoId", dia_semana as dia, hora_inicio as "horaInicio", horas_duracion as duracion, titulo, color, tipo_bloque as tipo
      `,
      [request.params.estudianteId, cursoId, Number(duracion) / 60, titulo],
    );
    response.status(201).json({
      bloque: mapearBloque(resultado.rows[0]),
      mensaje: `Agendamos una micro-sesion de ${duracion} minutos.`,
    });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo agendar la micro-sesion.", error: error.message });
  }
});

app.post("/api/planificador/:estudianteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { estudianteId } = request.params;
  const { bloques } = request.body;

  if (!Array.isArray(bloques)) {
    response.status(400).json({ mensaje: "Los bloques enviados no son validos." });
    return;
  }

  const cliente = await pool.connect();

  try {
    await cliente.query("begin");
    await cliente.query("delete from bloques_planificador where estudiante_id = $1", [estudianteId]);

    for (const bloque of bloques) {
      await cliente.query(
        `
        insert into bloques_planificador (
          id,
          estudiante_id,
          curso_id,
          dia_semana,
          hora_inicio,
          horas_duracion,
          titulo,
          tipo_bloque,
          color
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          bloque.id,
          estudianteId,
          bloque.cursoId ?? null,
          bloque.dia,
          bloque.horaInicio,
          bloque.duracion,
          bloque.titulo,
          bloque.tipo,
          bloque.color,
        ],
      );
    }

    await cliente.query("commit");

    const resultado = await pool.query(
      `
      select
        id,
        curso_id as "cursoId",
        dia_semana as dia,
        hora_inicio as "horaInicio",
        horas_duracion as duracion,
        titulo,
        color,
        tipo_bloque as tipo
      from bloques_planificador
      where estudiante_id = $1
      order by dia_semana asc, hora_inicio asc
      `,
      [estudianteId],
    );

    response.json({ bloques: resultado.rows.map(mapearBloque) });
  } catch (error) {
    await cliente.query("rollback");
    response.status(500).json({ mensaje: "No se pudo guardar el planificador.", error: error.message });
  } finally {
    cliente.release();
  }
});

app.post("/api/notificaciones", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { estudianteId, tipo, titulo, mensaje, noLeida = true } = request.body;

  try {
    const resultado = await pool.query(
      `
      insert into notificaciones (estudiante_id, tipo, titulo, mensaje, no_leida)
      values ($1, $2, $3, $4, $5)
      returning
        id,
        tipo,
        titulo,
        mensaje,
        no_leida as "noLeida",
        creado_en as "creadaEn"
      `,
      [estudianteId, tipo, titulo, mensaje, noLeida],
    );

    const notificacion = mapearNotificacion(resultado.rows[0]);
    await enviarNotificacionCorreoSiCorresponde(estudianteId, notificacion);

    response.status(201).json(notificacion);
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo crear la notificacion.", error: error.message });
  }
});

app.patch("/api/notificaciones/:notificacionId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    const resultado = await pool.query(
      `
      update notificaciones
      set no_leida = coalesce($1, no_leida)
      where id = $2
      returning
        id,
        tipo,
        titulo,
        mensaje,
        no_leida as "noLeida",
        creado_en as "creadaEn"
      `,
      [request.body.noLeida, request.params.notificacionId],
    );

    response.json(mapearNotificacion(resultado.rows[0]));
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo actualizar la notificacion.", error: error.message });
  }
});

app.patch("/api/notificaciones/leer-todas/:estudianteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    await pool.query("update notificaciones set no_leida = false where estudiante_id = $1", [
      request.params.estudianteId,
    ]);
    response.json({ ok: true });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudieron actualizar las notificaciones.", error: error.message });
  }
});

app.delete("/api/notificaciones/leidas/:estudianteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    await pool.query(
      "delete from notificaciones where estudiante_id = $1 and no_leida = false",
      [request.params.estudianteId],
    );
    response.json({ ok: true });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudieron limpiar las notificaciones.", error: error.message });
  }
});

app.post("/api/chat/:estudianteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  const { estudianteId } = request.params;
  const { mensaje } = request.body;

  try {
    const contexto = await obtenerContextoEstudiante(estudianteId);
    const respuestaDirecta = construirRespuestaDirectaPanel({ mensaje, contexto });

    if (respuestaDirecta) {
      const mensajes = await registrarIntercambioChat(estudianteId, mensaje, respuestaDirecta);
      response.status(201).json({
        mensajes,
        fuente: "sistema",
      });
      return;
    }

    if (detectarSolicitudPreguntasPracticaAmbigua(mensaje, contexto.cursos)) {
      const respuestaSistema = construirRespuestaAclaratoriaPractica(contexto);
      const mensajes = await registrarIntercambioChat(estudianteId, mensaje, respuestaSistema);
      response.status(201).json({
        mensajes,
        fuente: "sistema",
      });
      return;
    }

    try {
      const respuestaIa = await generarRespuestaAsistente({ mensaje, contexto });
      const mensajes = await registrarIntercambioChat(estudianteId, mensaje, respuestaIa.mensaje);
      response.status(201).json({
        mensajes,
        fuente: respuestaIa.fuente,
      });
      return;
    } catch (error) {
      response.status(500).json({ mensaje: "No se pudo preparar la respuesta del asistente.", error: error.message });
      return;
    }
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo enviar el mensaje.", error: error.message });
  }
});

app.delete("/api/chat/:estudianteId", async (request, response) => {
  if (!pool) return responderSinBase(response);

  try {
    await pool.query("delete from mensajes_chat where estudiante_id = $1", [request.params.estudianteId]);
    response.json({ ok: true });
  } catch (error) {
    response.status(500).json({ mensaje: "No se pudo limpiar el historial del chat.", error: error.message });
  }
});

asegurarColumnasCompatibilidad()
  .catch((error) => {
    console.error("No se pudo preparar el esquema de compatibilidad:", error);
  })
  .finally(() => {
    app.listen(puerto, () => {
      console.log(`StudyFlow API lista en http://localhost:${puerto}`);
    });
  });

