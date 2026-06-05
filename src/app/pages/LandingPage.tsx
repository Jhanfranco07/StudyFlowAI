import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Facebook,
  GraduationCap,
  Instagram,
  Layers3,
  LayoutDashboard,
  Linkedin,
  ListChecks,
  MessageCircle,
  Radar,
  Sparkles,
  Star,
  Target,
  UserCog,
  UsersRound,
  Zap,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";

const problemas = [
  {
    icono: AlertTriangle,
    titulo: "Prioridad borrosa",
    texto: "No sabes qué tarea hacer primero cuando todo parece urgente.",
  },
  {
    icono: CalendarDays,
    titulo: "Fechas encima",
    texto: "Se juntan entregas, exámenes y trabajos de varios cursos.",
  },
  {
    icono: Bell,
    titulo: "Recordatorios dispersos",
    texto: "Usas varias apps y aun así se te pasan fechas importantes.",
  },
  {
    icono: UsersRound,
    titulo: "Equipos desordenados",
    texto: "En trabajos grupales no siempre queda claro quién hace qué.",
  },
];

const funcionalidades = [
  {
    categoria: "Organización",
    icono: LayoutDashboard,
    titulo: "Dashboard inteligente",
    texto: "Cursos, tareas, exámenes y alertas en una vista clara.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    categoria: "Seguimiento",
    icono: Radar,
    titulo: "Radar de riesgo académico",
    texto: "Detecta cursos descuidados antes de que sea tarde.",
    color: "from-violet-500 to-purple-500",
  },
  {
    categoria: "Organización",
    icono: ListChecks,
    titulo: "Tareas priorizadas",
    texto: "Ordena pendientes por urgencia, avance e importancia.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    categoria: "Seguimiento",
    icono: ClipboardCheck,
    titulo: "Exámenes con plan de estudio",
    texto: "Divide temas, fechas y preparación en pasos manejables.",
    color: "from-amber-500 to-orange-500",
  },
  {
    categoria: "Inteligencia artificial",
    icono: CalendarDays,
    titulo: "Planificador semanal con IA",
    texto: "Crea bloques visuales según tu carga y disponibilidad.",
    color: "from-blue-600 to-indigo-500",
  },
  {
    categoria: "Inteligencia artificial",
    icono: BrainCircuit,
    titulo: "Asistente académico contextual",
    texto: "Recibe recomendaciones según tus cursos y pendientes reales.",
    color: "from-fuchsia-500 to-purple-500",
  },
  {
    categoria: "Seguimiento",
    icono: BarChart3,
    titulo: "Progreso y analíticas",
    texto: "Visualiza avances, riesgos y hábitos de estudio.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    categoria: "Organización",
    icono: Bell,
    titulo: "Notificaciones inteligentes",
    texto: "Alertas útiles para entregas, exámenes y cambios críticos.",
    color: "from-rose-500 to-pink-500",
  },
  {
    categoria: "Personalización",
    icono: UserCog,
    titulo: "Perfil personalizado",
    texto: "Ajusta horarios, metas, preferencias y ritmo académico.",
    color: "from-slate-600 to-blue-500",
  },
  {
    categoria: "Trabajo colaborativo",
    icono: UsersRound,
    titulo: "Trabajo colaborativo académico",
    texto: "Coordina responsables, avances y fechas por equipo.",
    color: "from-green-500 to-emerald-500",
  },
];

const planes = [
  {
    nombre: "Gratis",
    subtitulo: "Para ordenar tu semana académica sin complicarte.",
    precio: "S/ 0",
    caracteristicas: [
      "Hasta 3 cursos.",
      "Tareas y exámenes en un solo lugar.",
      "Recordatorios esenciales.",
      "Tokens limitados del asistente IA.",
    ],
    destino: "/register?plan=gratis",
    cta: "Empieza gratis",
    destacado: false,
  },
  {
    nombre: "Premium",
    subtitulo: "Para estudiantes con alta carga, trabajo o proyectos en equipo.",
    precio: "S/ 9.99",
    caracteristicas: [
      "Cursos ilimitados.",
      "Planificador inteligente.",
      "Registro de bloques de trabajo, traslado y tiempo personal.",
      "Asistente IA con más consultas.",
      "Agente IA que crea tareas desde el chat.",
      "Prioridades automáticas.",
      "Analíticas avanzadas.",
      "Gestión colaborativa de trabajos grupales.",
    ],
    destino: "/register?plan=premium",
    cta: "Elegir Premium",
    destacado: true,
  },
  {
    nombre: "Premium Plus",
    subtitulo: "Para posgrado y profesionales que trabajan y estudian.",
    precio: "S/ 14.99",
    caracteristicas: [
      "Todo lo del Premium.",
      "IA que adapta el horario según trabajo y disponibilidad.",
      "Micro-sesiones de estudio.",
      "Seguimiento de tesis y proyectos largos.",
      "Dashboard avanzado trabajo + estudio.",
      "Trabajo colaborativo avanzado.",
      "Recomendaciones para retomar el ritmo.",
    ],
    destino: "/register?plan=premium_plus",
    cta: "Probar Premium Plus",
    destacado: false,
  },
];

const testimonios = [
  {
    iniciales: "CT",
    nombre: "Camila Torres",
    carrera: "Ingeniería Industrial",
    texto: "Antes usaba varias apps y aun así me olvidaba de tareas. Con StudyFlow sé qué hacer primero.",
    etiqueta: "Prioridad clara",
  },
  {
    iniciales: "VR",
    nombre: "Valeria Rojas",
    carrera: "Administración",
    texto: "Me ayudó a organizar mi semana antes de parciales y a separar cada curso por prioridad.",
    etiqueta: "Semana ordenada",
  },
  {
    iniciales: "DS",
    nombre: "Diego Salazar",
    carrera: "Ingeniería de Sistemas",
    texto: "El radar de riesgo me mostró qué curso estaba descuidando antes de la entrega final.",
    etiqueta: "Riesgo visible",
  },
  {
    iniciales: "LP",
    nombre: "Lucia Paredes",
    carrera: "Comunicación",
    texto: "Para trabajos grupales me ayuda a ver qué falta y quién tiene pendiente cada parte.",
    etiqueta: "Equipo alineado",
  },
];

const comparacion = [
  {
    titulo: "Herramientas generales",
    descripcion: "Sirven para organizar, pero el estudiante sigue haciendo todo el trabajo mental.",
    icono: Layers3,
    estilo: "border-slate-200 bg-white text-slate-950",
    itemClass: "text-slate-600",
    items: [
      "Organización manual.",
      "Dependen de que tú configures todo.",
      "No entienden carga de cursos.",
      "No priorizan académicamente.",
    ],
  },
  {
    titulo: "StudyFlow AI",
    descripcion: "Convierte tu carga académica en decisiones claras y acciones siguientes.",
    icono: BrainCircuit,
    estilo: "border-blue-300 bg-slate-950 text-white shadow-2xl shadow-blue-950/30",
    itemClass: "text-blue-50",
    items: [
      "Priorización automática.",
      "Contexto académico por curso.",
      "Recomendaciones inteligentes.",
      "Alertas, riesgo académico y trabajo grupal.",
    ],
  },
];

const pasos = [
  {
    numero: "01",
    icono: GraduationCap,
    titulo: "Registra tus cursos y actividades",
    texto: "Agrega cursos, horarios, tareas, exámenes y proyectos grupales.",
  },
  {
    numero: "02",
    icono: BrainCircuit,
    titulo: "La IA analiza tu carga académica",
    texto: "Detecta prioridades, riesgos, tiempos disponibles y fechas críticas.",
  },
  {
    numero: "03",
    icono: Target,
    titulo: "Avanza con un plan claro",
    texto: "Recibe recomendaciones, recordatorios y bloques de estudio personalizados.",
  },
];

function SectionLabel({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${dark ? "border-white/15 bg-white/10 text-cyan-200" : "border-blue-100 bg-blue-50 text-blue-700"}`}>
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-950">
      <Navbar />

      <main>
        <section id="inicio" className="relative isolate overflow-hidden bg-slate-950 px-4 pb-16 pt-24 text-white sm:px-6 sm:pb-24 sm:pt-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.55),transparent_32%),radial-gradient(circle_at_74%_22%,rgba(168,85,247,0.45),transparent_30%),linear-gradient(135deg,#020617_0%,#111827_42%,#1e1b4b_100%)]" />
          <div className="absolute inset-0 -z-10 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="sf-light-beam left-[8%] top-24" />
          <div className="sf-light-beam right-[14%] top-40 rotate-45" />
          <div className="absolute left-5 top-28 hidden h-24 w-24 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 backdrop-blur-xl lg:block" />
          <div className="absolute bottom-28 right-8 hidden h-28 w-28 rotate-12 rounded-[2rem] border border-purple-300/20 bg-purple-300/10 backdrop-blur-xl lg:block" />

          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="sf-reveal">
              <div className="mb-6 flex flex-wrap gap-3">
                {["IA académica", "Prioridad automática", "Menos estrés"].map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50 shadow-lg shadow-blue-950/20 backdrop-blur">
                    <Zap className="h-4 w-4 text-cyan-300" />
                    {badge}
                  </span>
                ))}
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-normal sm:text-6xl lg:text-7xl">
                Deja de organizarte.{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Empieza a avanzar.
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                StudyFlow AI prioriza tus tareas, planifica tu semana y te ayuda a reducir el estrés académico con inteligencia artificial.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="sf-button h-12 rounded-xl bg-white px-7 text-base text-blue-700 shadow-2xl shadow-blue-500/25 hover:bg-blue-50">
                  <Link to="/register?plan=gratis">
                    Empieza gratis
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="sf-button h-12 rounded-xl border-white/20 bg-white/10 px-7 text-base text-white backdrop-blur hover:bg-white/15 hover:text-white">
                  <Link to="/login">
                    Ver demo
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
                Ideal para estudiantes con tareas, exámenes, entregas y trabajos grupales acumulados.
              </p>
            </div>

            <div className="relative sf-reveal">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-blue-500/30 via-cyan-300/10 to-purple-500/30 blur-2xl" />
              <div className="sf-float relative rounded-[1.75rem] border border-white/20 bg-white/10 p-2 shadow-[0_40px_120px_-48px_rgba(56,189,248,0.85)] backdrop-blur-xl">
                <ImageWithFallback
                  src="/branding/hero-dashboard-mockup.svg"
                  alt="Vista previa del dashboard académico de StudyFlow AI"
                  className="block w-full rounded-[1.35rem]"
                />
              </div>

              <div className="sf-float-slow absolute -left-2 top-8 hidden max-w-[14rem] rounded-2xl border border-white/20 bg-white/90 p-4 text-slate-950 shadow-2xl backdrop-blur md:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">IA priorizando</p>
                    <p className="text-xs text-slate-500">4 pendientes críticos</p>
                  </div>
                </div>
              </div>

              <div className="sf-float absolute -right-2 top-28 hidden max-w-[14rem] rounded-2xl border border-cyan-200/60 bg-white p-4 text-slate-950 shadow-2xl md:block">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Radar académico</p>
                <p className="mt-1 text-2xl font-black text-slate-950">82%</p>
                <p className="text-xs text-slate-500">Riesgo reducido esta semana</p>
              </div>

              <div className="absolute -bottom-6 left-4 max-w-[18rem] rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-2xl sm:left-10">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold">Siguiente mejor acción</p>
                    <p className="mt-1 text-sm text-slate-500">Estudiar 45 min para Cálculo antes de avanzar con la entrega grupal.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="beneficios" className="relative bg-white px-4 py-16 sm:px-6 sm:py-24">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/10 to-transparent" />
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div className="sf-reveal">
                <SectionLabel>Problema real</SectionLabel>
                <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">¿Tu semana académica se siente fuera de control?</h2>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  Cuando se mezclan cursos, exámenes, entregas y trabajos en equipo, organizarse también se vuelve otra tarea.
                </p>
              </div>
              <div className="sf-reveal rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-purple-50 p-5 shadow-xl shadow-amber-100/50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-amber-700">Carga mental detectada</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">7 pendientes compiten por tu atención</p>
                  </div>
                  <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-lg sm:flex">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {problemas.map((problema) => (
                <Card key={problema.titulo} className="sf-reveal group border-amber-100 bg-gradient-to-br from-white to-amber-50/70 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-lg shadow-amber-100 transition group-hover:scale-105">
                      <problema.icono className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-950">{problema.titulo}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{problema.texto}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_12%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_80%_60%,rgba(34,211,238,0.2),transparent_28%)]" />
          <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:96px_96px]" />
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div className="sf-reveal">
              <SectionLabel dark>Solución</SectionLabel>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Tu plan académico, organizado por IA</h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                StudyFlow AI centraliza cursos, tareas, exámenes, horarios, alertas, progreso, proyectos grupales y recomendaciones académicas para que tengas claridad antes de empezar.
              </p>
            </div>
            <div className="sf-reveal grid gap-4 sm:grid-cols-2">
              {["Cursos", "Tareas", "Exámenes", "Horarios", "Alertas", "Progreso", "Proyectos grupales", "Recomendaciones IA"].map((item, index) => (
                <div key={item} className="group rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-white/[0.1]">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-200/20">
                      {index % 2 === 0 ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    </span>
                    <span className="font-bold">{item}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" style={{ width: `${68 + index * 3}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="caracteristicas" className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center sf-reveal">
              <SectionLabel>Funcionalidades</SectionLabel>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Todo lo que necesitas para saber qué hacer primero</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Herramientas pensadas para carga académica real, no para listas genéricas.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {funcionalidades.map((item) => (
                <Card key={item.titulo} className="sf-reveal group relative overflow-hidden border-white bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/10">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.color}`} />
                  <CardContent className="p-6">
                    <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg transition duration-300 group-hover:scale-105`}>
                      <item.icono className="h-7 w-7" />
                    </div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{item.categoria}</p>
                    <h3 className="text-base font-black leading-snug text-slate-950">{item.titulo}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.texto}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="colaborativo" className="relative overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-24">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-50/80 to-transparent" />
          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="sf-reveal">
              <SectionLabel>Trabajo en equipo</SectionLabel>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Organiza trabajos grupales sin desorden</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Coordina trabajos grupales con claridad: asigna tareas, revisa avances y evita que todo quede para el último día.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {["Tareas compartidas", "Responsables visibles", "Fechas claras", "Avance por integrante", "Estados tipo tablero", "Exposiciones y finales"].map((beneficio) => (
                  <div key={beneficio} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700">{beneficio}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sf-reveal rounded-[2rem] border border-slate-200 bg-slate-950 p-4 shadow-[0_35px_100px_-45px_rgba(30,41,59,0.9)]">
              <div className="rounded-[1.5rem] bg-white p-5">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-black text-slate-950">Proyecto final: Investigación de mercado</p>
                    <div className="mt-2 flex items-center gap-2">
                      {["CT", "VR", "DS", "LP"].map((avatar) => (
                        <span key={avatar} className="-mr-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-600 to-purple-600 text-[10px] font-black text-white">
                          {avatar}
                        </span>
                      ))}
                      <span className="ml-2 text-sm text-slate-500">Equipo de 4 integrantes</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Avance</p>
                    <p className="text-2xl font-black text-emerald-700">68%</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ["Pendiente", "bg-amber-50 text-amber-700", "Encuestas", "Mateo", "Vence viernes"],
                    ["En avance", "bg-blue-50 text-blue-700", "Análisis de datos", "Camila", "Hoy 6:00 pm"],
                    ["Listo", "bg-emerald-50 text-emerald-700", "Diapositivas", "Lucia", "Revisado"],
                  ].map(([estado, estilo, tarea, persona, fecha]) => (
                    <div key={estado} className="rounded-2xl bg-slate-50 p-3">
                      <p className={`mb-3 rounded-full px-3 py-1 text-xs font-black ${estilo}`}>{estado}</p>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                        <p className="font-black text-slate-950">{tarea}</p>
                        <p className="mt-3 text-sm text-slate-500">Responsable: {persona}</p>
                        <p className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">{fecha}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center sf-reveal">
              <SectionLabel>Diferencial</SectionLabel>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">¿Por qué StudyFlow AI es diferente?</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                No reemplaza tus herramientas favoritas: convierte tu carga académica en decisiones claras.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {comparacion.map((columna, index) => (
                <div key={columna.titulo} className={`sf-reveal rounded-[2rem] border p-7 ${columna.estilo}`}>
                  <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${index === 1 ? "bg-white/10 text-cyan-200" : "bg-slate-100 text-slate-500"}`}>
                      <columna.icono className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{columna.titulo}</h3>
                      <p className={`mt-1 text-sm leading-6 ${index === 1 ? "text-slate-300" : "text-slate-500"}`}>{columna.descripcion}</p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {columna.items.map((item) => (
                      <li key={item} className={`flex gap-3 ${columna.itemClass}`}>
                        {index === 1 ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" /> : <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />}
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center sf-reveal">
              <SectionLabel>Cómo funciona</SectionLabel>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Tres pasos para avanzar con menos carga mental</h2>
            </div>
            <div className="relative mt-14 grid gap-6 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-10 hidden h-1 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 md:block" />
              {pasos.map((paso) => (
                <div key={paso.numero} className="sf-reveal group relative rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/10">
                  <div className="mb-7 flex items-center justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20">
                      <paso.icono className="h-8 w-8" />
                    </div>
                    <span className="text-4xl font-black text-slate-100 transition group-hover:text-blue-100">{paso.numero}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-950">{paso.titulo}</h3>
                  <p className="mt-4 leading-7 text-slate-600">{paso.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center sf-reveal">
              <SectionLabel>Feedback</SectionLabel>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Feedback de estudiantes que probaron StudyFlow AI</h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {testimonios.map((testimonio) => (
                <Card key={testimonio.nombre} className="sf-reveal border-white bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">PMV probado</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="min-h-32 text-sm leading-6 text-slate-700">"{testimonio.texto}"</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-black text-white">
                        {testimonio.iniciales}
                      </div>
                      <div>
                        <p className="font-black text-slate-950">{testimonio.nombre}</p>
                        <p className="text-xs text-slate-500">{testimonio.carrera}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-wide text-emerald-600">{testimonio.etiqueta}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="precios" className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center sf-reveal">
              <SectionLabel>Precios</SectionLabel>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Planes simples para estudiantes</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">Empieza gratis y escala cuando necesites más cursos, IA y colaboración.</p>
            </div>
            <div className="mx-auto mt-12 grid max-w-7xl gap-6 lg:grid-cols-3">
              {planes.map((plan) => (
                <Card key={plan.nombre} className={`sf-reveal relative overflow-hidden border-2 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${plan.destacado ? "border-blue-500 shadow-xl shadow-blue-600/10" : "border-slate-200"}`}>
                  {plan.destacado && (
                    <>
                      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-600" />
                      <div className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm font-bold text-white">Más completo</div>
                    </>
                  )}
                  <CardContent className="p-7 pt-10 sm:p-9 sm:pt-12">
                    <h3 className="text-2xl font-black text-slate-950">{plan.nombre}</h3>
                    <p className="mt-2 min-h-12 text-slate-600">{plan.subtitulo}</p>
                    <div className="mt-7">
                      <span className="text-5xl font-black text-slate-950">{plan.precio}</span>
                      <span className="text-slate-500">/mes</span>
                    </div>
                    <ul className="mt-8 space-y-3">
                      {plan.caracteristicas.map((caracteristica) => (
                        <li key={caracteristica} className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                          <span className="text-slate-700">{caracteristica}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant={plan.destacado ? "default" : "outline"} className={`sf-button mt-8 h-12 w-full rounded-xl ${plan.destacado ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-purple-700" : "border-slate-300"}`}>
                      <Link to={plan.destino}>{plan.cta}</Link>
                    </Button>
                    {plan.nombre === "Premium Plus" ? (
                      <Button asChild variant="ghost" className="mt-3 h-11 w-full rounded-xl text-blue-700">
                        <Link to="/register?plan=premium_plus">Ver funciones para posgrado</Link>
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-slate-500">Precio referencial para validación del proyecto.</p>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.45),transparent_35%),linear-gradient(135deg,#020617,#1e1b4b)]" />
          <div className="mx-auto max-w-4xl text-center sf-reveal">
            <SectionLabel dark>Empieza hoy</SectionLabel>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Empieza a estudiar con más claridad desde hoy.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-50">
              Organiza tus cursos, prioriza tus pendientes y deja que la IA te ayude a avanzar.
            </p>
            <Button asChild size="lg" className="sf-button mt-9 h-12 rounded-xl bg-white px-7 text-base text-blue-700 shadow-2xl shadow-blue-500/25 hover:bg-blue-50">
              <Link to="/register?plan=gratis">
                Probar StudyFlow gratis
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 px-4 py-12 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-600/20">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-black">StudyFlow AI</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                Deja de organizarte. Empieza a avanzar.
              </p>
            </div>
            <div>
              <h3 className="font-bold">Producto</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li><a href="#caracteristicas" className="transition hover:text-white">Características</a></li>
                <li><a href="#colaborativo" className="transition hover:text-white">Trabajo colaborativo</a></li>
                <li><a href="#precios" className="transition hover:text-white">Precios</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Acceso</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li><Link to="/login" className="transition hover:text-white">Iniciar sesión</Link></li>
                <li><Link to="/register?plan=gratis" className="transition hover:text-white">Empieza gratis</Link></li>
                <li><Link to="/login" className="transition hover:text-white">Ver demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Síguenos en redes</h3>
              <p className="mt-4 text-sm leading-6 text-slate-400">Tips de estudio, productividad académica y novedades de StudyFlow AI.</p>
              <div className="mt-5 flex gap-3">
                {[
                  [Instagram, "Instagram"],
                  [MessageCircle, "TikTok"],
                  [Linkedin, "LinkedIn"],
                  [Facebook, "Facebook"],
                ].map(([Icono, label]) => (
                  <a key={String(label)} href="#" aria-label={String(label)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white">
                    <Icono className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 StudyFlow AI. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
