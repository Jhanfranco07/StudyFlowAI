import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const STORAGE_KEY = "studyflow-language";

const es = {
  common: {
    language: "Idioma",
    spanish: "Español",
    english: "Inglés",
    login: "Iniciar sesión",
    enter: "Entrar",
    startFree: "Empieza gratis",
    free: "Gratis",
    backHome: "Volver al inicio",
  },
  nav: {
    home: "Inicio",
    benefits: "Beneficios",
    features: "Características",
    teams: "Equipos",
    pricing: "Precios",
    dashboard: "Dashboard",
    courses: "Mis cursos",
    tasks: "Tareas",
    thesis: "Tesis y proyectos",
    teamProjects: "Trabajos grupales",
    exams: "Exámenes",
    planner: "Planificador",
    assistant: "Asistente IA",
    progress: "Progreso",
    notifications: "Notificaciones",
    settings: "Configuración",
    profile: "Perfil",
    activeSession: "Sesión activa",
    guest: "Invitado",
    completeProfile: "Completa tu perfil",
    logout: "Cerrar sesión",
    importantNotifications_one: "{{count}} notificación importante",
    importantNotifications_other: "{{count}} notificaciones importantes",
  },
  landing: {
    badges: ["IA académica", "Prioridad automática", "Menos estrés"],
    headline: "Deja de organizarte.",
    headlineAccent: "Empieza a avanzar.",
    description: "StudyFlow AI prioriza tus tareas, planifica tu semana y te ayuda a reducir el estrés académico con inteligencia artificial.",
    demo: "Ver demo",
    ideal: "Ideal para estudiantes con tareas, exámenes, entregas y trabajos grupales acumulados.",
    aiPrioritizing: "IA priorizando",
    criticalPending: "4 pendientes críticos",
    academicRadar: "Radar académico",
    reducedRisk: "Riesgo reducido esta semana",
    nextAction: "Siguiente mejor acción",
    nextActionText: "Estudiar 45 min para Cálculo antes de avanzar con la entrega grupal.",
    realProblem: "Problema real",
    outOfControl: "¿Tu semana académica se siente fuera de control?",
    problemDescription: "Cuando se mezclan cursos, exámenes, entregas y trabajos en equipo, organizarse también se vuelve otra tarea.",
    mentalLoad: "Carga mental detectada",
    competingTasks: "7 pendientes compiten por tu atención",
    solution: "Solución",
    organizedByAi: "Tu plan académico, organizado por IA",
    solutionDescription: "StudyFlow AI centraliza cursos, tareas, exámenes, horarios, alertas, progreso, proyectos grupales y recomendaciones académicas para que tengas claridad antes de empezar.",
    functionality: "Funcionalidades",
    everythingYouNeed: "Todo lo que necesitas para saber qué hacer primero",
    realLoad: "Herramientas pensadas para carga académica real, no para listas genéricas.",
    teamwork: "Trabajo en equipo",
    organizeTeams: "Organiza trabajos grupales sin desorden",
    teamworkDescription: "Coordina trabajos grupales con claridad: asigna tareas, revisa avances y evita que todo quede para el último día.",
    howItWorks: "Cómo funciona",
    threeSteps: "Tres pasos para avanzar con menos carga mental",
    feedback: "Feedback",
    studentFeedback: "Feedback de estudiantes que probaron StudyFlow AI",
    simplePlans: "Planes simples para estudiantes",
    pricingDescription: "Empieza gratis y escala cuando necesites más cursos, IA y colaboración.",
    mostComplete: "Más completo",
    perMonth: "/mes",
    referencePrice: "Precio referencial para validación del proyecto.",
    startToday: "Empieza hoy",
    clarityToday: "Empieza a estudiar con más claridad desde hoy.",
    clarityDescription: "Organiza tus cursos, prioriza tus pendientes y deja que la IA te ayude a avanzar.",
    tryFree: "Probar StudyFlow gratis",
    problemCards: [
      { title: "Prioridad borrosa", text: "No sabes qué tarea hacer primero cuando todo parece urgente." },
      { title: "Fechas encima", text: "Se juntan entregas, exámenes y trabajos de varios cursos." },
      { title: "Recordatorios dispersos", text: "Usas varias apps y aun así se te pasan fechas importantes." },
      { title: "Equipos desordenados", text: "En trabajos grupales no siempre queda claro quién hace qué." },
    ],
    solutionItems: ["Cursos", "Tareas", "Exámenes", "Horarios", "Alertas", "Progreso", "Proyectos grupales", "Recomendaciones IA"],
    teamBenefits: ["Tareas compartidas", "Responsables visibles", "Fechas claras", "Avance por integrante", "Estados tipo tablero", "Exposiciones y finales"],
    features: [
      { category: "Organización", title: "Dashboard inteligente", text: "Cursos, tareas, exámenes y alertas en una vista clara." },
      { category: "Seguimiento", title: "Radar de riesgo académico", text: "Detecta cursos descuidados antes de que sea tarde." },
      { category: "Organización", title: "Tareas priorizadas", text: "Ordena pendientes por urgencia, avance e importancia." },
      { category: "Seguimiento", title: "Exámenes con plan de estudio", text: "Divide temas, fechas y preparación en pasos manejables." },
      { category: "Inteligencia artificial", title: "Planificador semanal con IA", text: "Crea bloques visuales según tu carga y disponibilidad." },
      { category: "Inteligencia artificial", title: "Asistente académico contextual", text: "Recibe recomendaciones según tus cursos y pendientes reales." },
      { category: "Seguimiento", title: "Progreso y analíticas", text: "Visualiza avances, riesgos y hábitos de estudio." },
      { category: "Organización", title: "Notificaciones inteligentes", text: "Alertas útiles para entregas, exámenes y cambios críticos." },
      { category: "Personalización", title: "Perfil personalizado", text: "Ajusta horarios, metas, preferencias y ritmo académico." },
      { category: "Trabajo colaborativo", title: "Trabajo colaborativo académico", text: "Coordina responsables, avances y fechas por equipo." },
    ],
    plans: [
      { name: "Gratis", subtitle: "Para ordenar tu semana académica sin complicarte.", features: ["Hasta 3 cursos.", "Tareas y exámenes en un solo lugar.", "Recordatorios esenciales.", "Tokens limitados del asistente IA."], cta: "Empieza gratis" },
      { name: "Premium", subtitle: "Para estudiantes con alta carga, trabajo o proyectos en equipo.", features: ["Cursos ilimitados.", "Planificador inteligente.", "Registro de bloques de trabajo, traslado y tiempo personal.", "Asistente IA con más consultas.", "Agente IA que crea tareas desde el chat.", "Prioridades automáticas.", "Analíticas avanzadas.", "Gestión colaborativa de trabajos grupales."], cta: "Elegir Premium" },
      { name: "Premium Plus", subtitle: "Para posgrado y profesionales que trabajan y estudian.", features: ["Todo lo del Premium.", "IA que adapta el horario según trabajo y disponibilidad.", "Micro-sesiones para tesis y proyectos largos.", "Seguimiento de tesis y proyectos largos.", "Dashboard avanzado trabajo + estudio.", "Trabajo colaborativo avanzado.", "Recomendaciones para retomar el ritmo."], cta: "Probar Premium Plus" },
    ],
    steps: [
      { title: "Registra tus cursos y actividades", text: "Agrega cursos, horarios, tareas, exámenes y proyectos grupales." },
      { title: "La IA analiza tu carga académica", text: "Detecta prioridades, riesgos, tiempos disponibles y fechas críticas." },
      { title: "Avanza con un plan claro", text: "Recibe recomendaciones, recordatorios y bloques de estudio personalizados." },
    ],
    comparisonLabel: "Diferencial", comparisonTitle: "¿Por qué StudyFlow AI es diferente?", comparisonDescription: "No reemplaza tus herramientas favoritas: convierte tu carga académica en decisiones claras.",
    comparison: [
      { title: "Herramientas generales", description: "Sirven para organizar, pero el estudiante sigue haciendo todo el trabajo mental.", items: ["Organización manual.", "Dependen de que tú configures todo.", "No entienden carga de cursos.", "No priorizan académicamente."] },
      { title: "StudyFlow AI", description: "Convierte tu carga académica en decisiones claras y acciones siguientes.", items: ["Priorización automática.", "Contexto académico por curso.", "Recomendaciones inteligentes.", "Alertas, riesgo académico y trabajo grupal."] },
    ],
    testedMvp: "PMV probado", product: "Producto", access: "Acceso", collaborativeWork: "Trabajo colaborativo", followUs: "Síguenos en redes", socialDescription: "Tips de estudio, productividad académica y novedades de StudyFlow AI.", rights: "Todos los derechos reservados.",
  },
  checkout: {
    securePayment: "Pago seguro con Mercado Pago",
    improvePlan: "MEJORA TU PLAN",
    activate: "Activa {{plan}}",
    confirm: "Confirma tu plan y continúa a Mercado Pago para completar el proceso.",
    secureData: "Tus datos de pago se procesan de forma segura.",
    privateFinancial: "Completa el proceso sin compartir tus datos financieros con StudyFlow.",
    automaticActivation: "Tu plan se activa automáticamente al confirmar el pago.",
    total: "Total",
    selectedPlan: "Plan seleccionado",
    loginToPay: "Iniciar sesión para pagar",
    createAccount: "Crear cuenta",
    dashboard: "Ir al dashboard",
    validating: "Validando pago...",
    pay: "Pagar con Mercado Pago",
    redirect: "Serás redirigido a Mercado Pago para continuar.",
  },
  auth: {
    welcome: "Bienvenido de nuevo", loginDescription: "Inicia sesión para continuar con tus estudios.", email: "Correo electrónico", password: "Contraseña", loggingIn: "Ingresando...", noAccount: "¿No tienes una cuenta?", registerFree: "Regístrate gratis", createAccount: "Crea tu cuenta", registerDescription: "Empieza a organizar tu semestre desde hoy.", names: "Nombres", university: "Universidad", career: "Carrera", profileType: "Tipo de perfil", semester: "Ciclo o semestre", selectProfile: "Selecciona tu perfil", selectSemester: "Selecciona tu ciclo", creating: "Creando cuenta...", createContinue: "Crear cuenta y continuar", alreadyAccount: "¿Ya tienes una cuenta?", selectedPlan: "Plan seleccionado",
  },
};

const en = {
  common: { language: "Language", spanish: "Spanish", english: "English", login: "Sign in", enter: "Sign in", startFree: "Start for free", free: "Free", backHome: "Back to home" },
  nav: {
    home: "Home", benefits: "Benefits", features: "Features", teams: "Teams", pricing: "Pricing", dashboard: "Dashboard", courses: "My courses", tasks: "Tasks", thesis: "Thesis and projects", teamProjects: "Team projects", exams: "Exams", planner: "Planner", assistant: "AI Assistant", progress: "Progress", notifications: "Notifications", settings: "Settings", profile: "Profile", activeSession: "Active session", guest: "Guest", completeProfile: "Complete your profile", logout: "Sign out", importantNotifications_one: "{{count}} important notification", importantNotifications_other: "{{count}} important notifications",
  },
  landing: {
    badges: ["Academic AI", "Automatic prioritization", "Less stress"], headline: "Stop organizing.", headlineAccent: "Start making progress.", description: "StudyFlow AI prioritizes your tasks, plans your week, and helps reduce academic stress with artificial intelligence.", demo: "View demo", ideal: "Ideal for students managing accumulated tasks, exams, deadlines, and team projects.", aiPrioritizing: "AI prioritizing", criticalPending: "4 critical items", academicRadar: "Academic radar", reducedRisk: "Risk reduced this week", nextAction: "Next best action", nextActionText: "Study Calculus for 45 minutes before moving on to the team assignment.", realProblem: "A real problem", outOfControl: "Does your academic week feel out of control?", problemDescription: "When courses, exams, deadlines, and team projects overlap, staying organized becomes another task.", mentalLoad: "Mental load detected", competingTasks: "7 tasks are competing for your attention", solution: "Solution", organizedByAi: "Your academic plan, organized by AI", solutionDescription: "StudyFlow AI brings together courses, tasks, exams, schedules, alerts, progress, team projects, and academic recommendations so you have clarity before you begin.", functionality: "Features", everythingYouNeed: "Everything you need to know what to do first", realLoad: "Tools designed for real academic workloads, not generic lists.", teamwork: "Teamwork", organizeTeams: "Organize team projects without the mess", teamworkDescription: "Coordinate team projects clearly: assign tasks, review progress, and avoid leaving everything until the last day.", howItWorks: "How it works", threeSteps: "Three steps to move forward with less mental load", feedback: "Feedback", studentFeedback: "Feedback from students who tried StudyFlow AI", simplePlans: "Simple plans for students", pricingDescription: "Start free and upgrade when you need more courses, AI, and collaboration.", mostComplete: "Most complete", perMonth: "/month", referencePrice: "Reference price for project validation.", startToday: "Start today", clarityToday: "Start studying with more clarity today.", clarityDescription: "Organize your courses, prioritize your work, and let AI help you move forward.", tryFree: "Try StudyFlow for free",
    problemCards: [
      { title: "Unclear priorities", text: "You do not know which task to tackle first when everything feels urgent." },
      { title: "Overlapping deadlines", text: "Assignments, exams, and work from several courses pile up." },
      { title: "Scattered reminders", text: "You use several apps and still miss important dates." },
      { title: "Disorganized teams", text: "In team projects, it is not always clear who is responsible for what." },
    ],
    solutionItems: ["Courses", "Tasks", "Exams", "Schedules", "Alerts", "Progress", "Team projects", "AI recommendations"],
    teamBenefits: ["Shared tasks", "Visible owners", "Clear dates", "Progress by member", "Board-style statuses", "Presentations and finals"],
    features: [
      { category: "Organization", title: "Smart dashboard", text: "Courses, tasks, exams, and alerts in one clear view." },
      { category: "Tracking", title: "Academic risk radar", text: "Spot neglected courses before it is too late." },
      { category: "Organization", title: "Prioritized tasks", text: "Sort work by urgency, progress, and importance." },
      { category: "Tracking", title: "Exam study plans", text: "Break topics, dates, and preparation into manageable steps." },
      { category: "Artificial intelligence", title: "AI weekly planner", text: "Create visual blocks based on your workload and availability." },
      { category: "Artificial intelligence", title: "Context-aware academic assistant", text: "Get recommendations based on your real courses and pending work." },
      { category: "Tracking", title: "Progress and analytics", text: "See progress, risks, and study habits." },
      { category: "Organization", title: "Smart notifications", text: "Useful alerts for deadlines, exams, and critical changes." },
      { category: "Personalization", title: "Personalized profile", text: "Adjust schedules, goals, preferences, and academic pace." },
      { category: "Collaboration", title: "Academic collaboration", text: "Coordinate owners, progress, and dates across your team." },
    ],
    plans: [
      { name: "Free", subtitle: "Organize your academic week without unnecessary complexity.", features: ["Up to 3 courses.", "Tasks and exams in one place.", "Essential reminders.", "Limited AI assistant tokens."], cta: "Start for free" },
      { name: "Premium", subtitle: "For students with heavy workloads, jobs, or team projects.", features: ["Unlimited courses.", "Smart planner.", "Work, commute, and personal-time blocks.", "More AI assistant queries.", "AI agent that creates tasks from chat.", "Automatic priorities.", "Advanced analytics.", "Collaborative team-project management."], cta: "Choose Premium" },
      { name: "Premium Plus", subtitle: "For graduate students and professionals who work and study.", features: ["Everything in Premium.", "AI scheduling adapted to work and availability.", "Micro-sessions for theses and long projects.", "Thesis and long-project tracking.", "Advanced work-and-study dashboard.", "Advanced collaboration.", "Recommendations to get back on track."], cta: "Try Premium Plus" },
    ],
    steps: [
      { title: "Add your courses and activities", text: "Add courses, schedules, tasks, exams, and team projects." },
      { title: "AI analyzes your academic workload", text: "It identifies priorities, risks, available time, and critical dates." },
      { title: "Move forward with a clear plan", text: "Get personalized recommendations, reminders, and study blocks." },
    ],
    comparisonLabel: "What makes us different", comparisonTitle: "Why is StudyFlow AI different?", comparisonDescription: "It does not replace your favorite tools: it turns your academic workload into clear decisions.",
    comparison: [
      { title: "General-purpose tools", description: "They help you organize, but the student still carries all the mental work.", items: ["Manual organization.", "They depend on you configuring everything.", "They do not understand course workloads.", "They do not prioritize academically."] },
      { title: "StudyFlow AI", description: "It turns your academic workload into clear decisions and next actions.", items: ["Automatic prioritization.", "Academic context by course.", "Smart recommendations.", "Alerts, academic risk, and team projects."] },
    ],
    testedMvp: "Tested MVP", product: "Product", access: "Access", collaborativeWork: "Collaborative work", followUs: "Follow us", socialDescription: "Study tips, academic productivity, and StudyFlow AI updates.", rights: "All rights reserved.",
  },
  checkout: {
    securePayment: "Secure payment with Mercado Pago", improvePlan: "UPGRADE YOUR PLAN", activate: "Activate {{plan}}", confirm: "Confirm your plan and continue to Mercado Pago to complete the process.", secureData: "Your payment data is processed securely.", privateFinancial: "Complete the process without sharing your financial information with StudyFlow.", automaticActivation: "Your plan is activated automatically once payment is confirmed.", total: "Total", selectedPlan: "Selected plan", loginToPay: "Sign in to pay", createAccount: "Create account", dashboard: "Go to dashboard", validating: "Validating payment...", pay: "Pay with Mercado Pago", redirect: "You will be redirected to Mercado Pago to continue.",
  },
  auth: {
    welcome: "Welcome back", loginDescription: "Sign in to continue with your studies.", email: "Email address", password: "Password", loggingIn: "Signing in...", noAccount: "Don't have an account?", registerFree: "Register for free", createAccount: "Create your account", registerDescription: "Start organizing your semester today.", names: "Names", university: "University", career: "Degree program", profileType: "Profile type", semester: "Cycle or semester", selectProfile: "Select your profile", selectSemester: "Select your cycle", creating: "Creating account...", createContinue: "Create account and continue", alreadyAccount: "Already have an account?", selectedPlan: "Selected plan",
  },
};

const idiomaGuardado = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: idiomaGuardado === "en" ? "en" : "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

i18n.on("languageChanged", (language) => {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, language);
  if (typeof document !== "undefined") document.documentElement.lang = language;
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.resolvedLanguage ?? "es";
}

export default i18n;
