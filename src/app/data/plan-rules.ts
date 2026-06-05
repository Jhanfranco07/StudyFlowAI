import type { PerfilUsuario, TipoBloquePlanificador, TipoPerfilUsuario } from "./studyflow-types";

export type PlanUsuario = "gratis" | "estudiante" | "premium" | "premium_plus";

export const PLANES: Record<
  PlanUsuario,
  {
    etiqueta: string;
    descripcion: string;
    limiteCursos: number | "ilimitado";
    limiteProyectosGrupales: number | "ilimitado";
  }
> = {
  gratis: {
    etiqueta: "Gratis",
    descripcion: "Organizacion academica esencial para empezar.",
    limiteCursos: 3,
    limiteProyectosGrupales: 1,
  },
  estudiante: {
    etiqueta: "Premium",
    descripcion: "Planificacion academica con bloques manuales de trabajo, traslado y tiempo personal.",
    limiteCursos: "ilimitado",
    limiteProyectosGrupales: "ilimitado",
  },
  premium: {
    etiqueta: "Premium",
    descripcion: "Planificacion academica con bloques manuales de trabajo, traslado y tiempo personal.",
    limiteCursos: "ilimitado",
    limiteProyectosGrupales: "ilimitado",
  },
  premium_plus: {
    etiqueta: "Premium Plus",
    descripcion: "Planificacion automatica de trabajo y estudio, micro-sesiones, tesis y proyectos largos.",
    limiteCursos: "ilimitado",
    limiteProyectosGrupales: "ilimitado",
  },
};

export const TIPOS_PERFIL: Record<TipoPerfilUsuario, string> = {
  universitario: "Universitario",
  instituto: "Instituto",
  posgrado: "Posgrado",
  profesional_estudia: "Profesional que trabaja y estudia",
  diplomado_maestria: "Diplomado o maestria",
  segunda_especialidad: "Segunda especialidad",
};

export const PERFILES_TRABAJO_ESTUDIO: TipoPerfilUsuario[] = [
  "posgrado",
  "profesional_estudia",
  "diplomado_maestria",
  "segunda_especialidad",
];

export const OBJETIVOS_ACADEMICOS = [
  { valor: "aprobar_cursos", etiqueta: "Aprobar cursos" },
  { valor: "preparar_examenes", etiqueta: "Preparar examenes" },
  { valor: "avanzar_tesis", etiqueta: "Avanzar tesis" },
  { valor: "terminar_proyecto_final", etiqueta: "Terminar proyecto final" },
  { valor: "organizar_trabajo_estudio", etiqueta: "Organizar trabajo y estudio" },
  { valor: "mejorar_productividad", etiqueta: "Mejorar productividad" },
] as const;

export const DURACIONES_MICRO_SESION = [15, 20, 30, 45] as const;

export const BLOQUES_BASICOS: TipoBloquePlanificador[] = ["class", "study", "exam", "break"];
export const BLOQUES_PREMIUM: TipoBloquePlanificador[] = [
  ...BLOQUES_BASICOS,
  "task",
  "review",
  "work",
  "personal",
  "commute",
];
export const BLOQUES_PREMIUM_PLUS: TipoBloquePlanificador[] = [
  "work",
  "class",
  "study",
  "break",
  "personal",
  "commute",
  "project_thesis",
  "micro_session",
  "academic_meeting",
  "research",
  "exam",
  "task",
  "review",
];

export const ETIQUETAS_BLOQUE: Record<TipoBloquePlanificador, string> = {
  class: "Clase",
  study: "Estudio",
  exam: "Examen",
  break: "Descanso",
  task: "Tarea",
  review: "Repaso",
  work: "Trabajo",
  personal: "Familia / personal",
  commute: "Traslado",
  project_thesis: "Proyecto / tesis",
  micro_session: "Micro-sesion",
  academic_meeting: "Reunion academica",
  research: "Investigacion",
};

export function normalizarPlan(plan: string | null | undefined): PlanUsuario {
  if (plan === "premium_plus" || plan === "premium" || plan === "estudiante" || plan === "gratis") {
    return plan;
  }
  return "gratis";
}

export function normalizarTipoPerfil(tipo: string | null | undefined): TipoPerfilUsuario {
  if (
    tipo === "universitario" ||
    tipo === "instituto" ||
    tipo === "posgrado" ||
    tipo === "profesional_estudia" ||
    tipo === "diplomado_maestria" ||
    tipo === "segunda_especialidad"
  ) {
    return tipo;
  }
  return "universitario";
}

export function isPremium(usuario: Pick<PerfilUsuario, "plan"> | null | undefined) {
  const plan = normalizarPlan(usuario?.plan);
  return plan === "estudiante" || plan === "premium" || plan === "premium_plus";
}

export function isPremiumPlus(usuario: Pick<PerfilUsuario, "plan"> | null | undefined) {
  return normalizarPlan(usuario?.plan) === "premium_plus";
}

export function isPostgradProfile(usuario: Pick<PerfilUsuario, "tipoPerfil"> | null | undefined) {
  const tipo = normalizarTipoPerfil(usuario?.tipoPerfil);
  return PERFILES_TRABAJO_ESTUDIO.includes(tipo);
}

export function canUseMicroSessions(usuario: Pick<PerfilUsuario, "plan"> | null | undefined) {
  return isPremiumPlus(usuario);
}

export function canUseAdvancedBlocks(usuario: Pick<PerfilUsuario, "plan"> | null | undefined) {
  return isPremium(usuario);
}

export function canUseTeamProjectsAdvanced(usuario: Pick<PerfilUsuario, "plan"> | null | undefined) {
  return isPremium(usuario);
}

export function canUseLongProjects(usuario: Pick<PerfilUsuario, "plan" | "tipoPerfil"> | null | undefined) {
  return isPremiumPlus(usuario);
}

export function obtenerTiposBloqueDisponibles(usuario: Pick<PerfilUsuario, "plan"> | null | undefined) {
  if (isPremiumPlus(usuario)) return BLOQUES_PREMIUM_PLUS;
  if (isPremium(usuario)) return BLOQUES_PREMIUM;
  return BLOQUES_BASICOS;
}

export function obtenerMensajeRecomendacionPlan(usuario: Pick<PerfilUsuario, "tipoPerfil" | "plan"> | null | undefined) {
  if (!usuario || !isPostgradProfile(usuario) || isPremiumPlus(usuario)) return null;

  return "Por tu perfil, te recomendamos Premium Plus para organizar trabajo, estudio, tesis y micro-sesiones; pero puedes continuar con tu plan actual.";
}

export function obtenerUpsellPremiumPlus(funcion: string) {
  return `${funcion} esta disponible en Premium Plus. Puedes verla como vista previa y actualizar cuando quieras.`;
}
