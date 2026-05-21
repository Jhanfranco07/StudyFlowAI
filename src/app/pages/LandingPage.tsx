import { Link } from "react-router";
import {
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
  Video,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";

const problemas = [
  "No sabes qué tarea hacer primero.",
  "Se te juntan entregas de varios cursos.",
  "Olvidas fechas importantes.",
  "Usas varias apps y aun así te desordenas.",
  "Pierdes tiempo organizando en vez de estudiar.",
  "Llegas a los exámenes sin un plan claro.",
  "En trabajos grupales, no siempre queda claro quién hace qué.",
];

const funcionalidades = [
  {
    icono: LayoutDashboard,
    titulo: "Dashboard inteligente",
    texto: "Cursos, tareas, exámenes y alertas en una vista clara.",
  },
  {
    icono: Radar,
    titulo: "Radar de riesgo académico",
    texto: "Detecta cursos descuidados antes de que sea tarde.",
  },
  {
    icono: ListChecks,
    titulo: "Tareas priorizadas",
    texto: "Ordena pendientes por urgencia, avance e importancia.",
  },
  {
    icono: ClipboardCheck,
    titulo: "Exámenes con plan de estudio",
    texto: "Divide temas, fechas y preparación en pasos manejables.",
  },
  {
    icono: CalendarDays,
    titulo: "Planificador semanal con IA",
    texto: "Crea bloques visuales según tu carga y disponibilidad.",
  },
  {
    icono: BrainCircuit,
    titulo: "Asistente académico contextual",
    texto: "Recibe recomendaciones según tus cursos y pendientes reales.",
  },
  {
    icono: BarChart3,
    titulo: "Progreso y analíticas",
    texto: "Visualiza avances, riesgos y hábitos de estudio.",
  },
  {
    icono: Bell,
    titulo: "Notificaciones inteligentes",
    texto: "Alertas útiles para entregas, exámenes y cambios críticos.",
  },
  {
    icono: UserCog,
    titulo: "Perfil personalizado",
    texto: "Ajusta horarios, metas, preferencias y ritmo académico.",
  },
  {
    icono: UsersRound,
    titulo: "Trabajo colaborativo académico",
    texto: "Coordina responsables, avances y fechas por equipo.",
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
    subtitulo: "Para estudiantes con alta carga y proyectos en equipo.",
    precio: "S/ 9.99",
    caracteristicas: [
      "Cursos ilimitados.",
      "Planificador inteligente.",
      "Asistente IA con más consultas.",
      "Prioridades automáticas.",
      "Analíticas avanzadas.",
      "Gestión colaborativa de trabajos grupales.",
    ],
    destino: "/register?plan=premium",
    cta: "Elegir Premium",
    destacado: true,
  },
];

const testimonios = [
  {
    nombre: "Camila Torres",
    carrera: "Ingeniería Industrial",
    texto: "Antes usaba varias apps y aun así me olvidaba de tareas. Con StudyFlow sé qué hacer primero.",
  },
  {
    nombre: "Valeria Rojas",
    carrera: "Administración",
    texto: "Me ayudó a organizar mi semana antes de parciales y a separar cada curso por prioridad.",
  },
  {
    nombre: "Diego Salazar",
    carrera: "Ingeniería de Sistemas",
    texto: "El radar de riesgo me mostró qué curso estaba descuidando antes de la entrega final.",
  },
  {
    nombre: "Lucia Paredes",
    carrera: "Comunicación",
    texto: "Para trabajos grupales me ayuda a ver qué falta y quién tiene pendiente cada parte.",
  },
];

const comparacion = [
  {
    titulo: "Herramientas generales",
    items: [
      "Organización manual.",
      "Dependen de que tú configures todo.",
      "No están enfocadas en carga académica.",
      "No priorizan por exámenes, avance y urgencia.",
    ],
  },
  {
    titulo: "StudyFlow AI",
    items: [
      "Entiende cursos, tareas, exámenes y proyectos.",
      "Prioriza automáticamente.",
      "Recomienda el siguiente paso.",
      "Genera alertas académicas y reduce carga mental.",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navbar />

      <main>
        <section id="inicio" className="overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#ffffff_34%,#f5f3ff_72%,#ffffff_100%)] px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 shadow-sm">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="truncate text-sm font-semibold text-blue-700">IA académica para estudiantes universitarios</span>
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.04] tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
                Deja de organizarte.{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Empieza a avanzar.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                StudyFlow AI prioriza tus tareas, planifica tu semana y te ayuda a reducir el estrés académico con inteligencia artificial.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-7 text-base shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-purple-700">
                  <Link to="/register?plan=gratis">
                    Empieza gratis
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-lg border-slate-300 bg-white/80 px-7 text-base">
                  <Link to="/login">
                    <Video className="h-5 w-5" />
                    Ver demo
                  </Link>
                </Button>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
                Ideal para estudiantes con tareas, exámenes, entregas y trabajos grupales acumulados.
              </p>
              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["3 min", "para ordenar tu semana"],
                  ["IA", "prioriza lo importante"],
                  ["24/7", "alertas académicas"],
                ].map(([dato, texto]) => (
                  <div key={dato} className="rounded-lg border border-slate-200 bg-white/75 p-3 shadow-sm">
                    <p className="text-xl font-bold text-slate-950">{dato}</p>
                    <p className="mt-1 text-xs leading-4 text-slate-500">{texto}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-blue-300 via-cyan-200 to-purple-300 opacity-45 blur-3xl" />
              <div className="relative rounded-[1.5rem] border border-white/70 bg-white/70 p-2 shadow-[0_30px_90px_-45px_rgba(30,41,59,0.9)] backdrop-blur">
                <ImageWithFallback
                  src="/branding/hero-dashboard-mockup.svg"
                  alt="Vista previa del dashboard académico de StudyFlow AI"
                  className="block w-full rounded-[1.15rem]"
                />
              </div>
              <div className="absolute -bottom-5 left-4 max-w-[17rem] rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:left-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">Siguiente mejor acción</p>
                    <p className="mt-1 text-sm text-slate-500">Estudiar 45 min para Cálculo antes de avanzar con la entrega grupal.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="beneficios" className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <span className="text-sm font-semibold uppercase tracking-wide text-blue-600">Problema real</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">¿Tu semana académica se siente fuera de control?</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Cuando se mezclan cursos, exámenes, entregas y trabajos en equipo, organizarse también se vuelve otra tarea.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {problemas.map((problema) => (
                <div key={problema} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <Clock3 className="mb-4 h-5 w-5 text-purple-600" />
                  <p className="text-sm leading-6 text-slate-700">{problema}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Solución</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Tu plan académico, organizado por IA</h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                StudyFlow AI centraliza cursos, tareas, exámenes, horarios, alertas, progreso, proyectos grupales y recomendaciones académicas para que tengas claridad antes de empezar.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Cursos", "Tareas", "Exámenes", "Horarios", "Alertas", "Progreso", "Proyectos grupales", "Recomendaciones IA"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                  <CheckCircle2 className="h-5 w-5 text-cyan-300" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="caracteristicas" className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-semibold uppercase tracking-wide text-blue-600">Funcionalidades</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Todo lo que necesitas para saber qué hacer primero</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Herramientas pensadas para carga académica real, no para listas genéricas.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {funcionalidades.map((item) => (
                <Card key={item.titulo} className="border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 text-blue-600">
                      <item.icono className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-950">{item.titulo}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.texto}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="colaborativo" className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-purple-600">Trabajo en equipo</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Organiza trabajos grupales sin desorden</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Coordina trabajos grupales con claridad: asigna tareas, revisa avances y evita que todo quede para el último día.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {["Tareas compartidas por equipo", "Responsables visibles", "Fechas de entrega claras", "Seguimiento por integrante", "Estados tipo tablero", "Exposiciones y proyectos finales"].map((beneficio) => (
                  <div key={beneficio} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-slate-700">{beneficio}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-950">Proyecto final: Investigacion de mercado</p>
                  <p className="text-sm text-slate-500">Equipo de 4 integrantes</p>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">68% avance</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ["Pendiente", "Encuestas", "Mateo", "Vence viernes"],
                  ["En avance", "Analisis de datos", "Camila", "Hoy 6:00 pm"],
                  ["Listo", "Diapositivas", "Lucia", "Revisado"],
                ].map(([estado, tarea, persona, fecha]) => (
                  <div key={estado} className="rounded-xl bg-slate-50 p-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{estado}</p>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="font-semibold text-slate-950">{tarea}</p>
                      <p className="mt-2 text-sm text-slate-500">{persona}</p>
                      <p className="mt-3 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-50/70 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-semibold uppercase tracking-wide text-blue-600">Diferencial</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">¿Por qué StudyFlow AI es diferente?</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                No reemplaza tus herramientas favoritas: convierte tu carga académica en decisiones claras.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {comparacion.map((columna, index) => (
                <div key={columna.titulo} className={`rounded-2xl border p-6 shadow-sm ${index === 1 ? "border-blue-200 bg-white" : "border-slate-200 bg-white/70"}`}>
                  <h3 className="text-xl font-bold text-slate-950">{columna.titulo}</h3>
                  <ul className="mt-6 space-y-4">
                    {columna.items.map((item) => (
                      <li key={item} className="flex gap-3 text-slate-700">
                        {index === 1 ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /> : <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />}
                        <span>{item}</span>
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
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-semibold uppercase tracking-wide text-purple-600">Cómo funciona</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Tres pasos para avanzar con menos carga mental</h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                ["1", "Registra tus cursos y actividades", "Agrega cursos, horarios, tareas, exámenes y proyectos grupales."],
                ["2", "La IA analiza tu carga académica", "Detecta prioridades, riesgos, tiempos disponibles, fechas críticas y tareas compartidas."],
                ["3", "Avanza con un plan claro", "Recibe recomendaciones, recordatorios y bloques de estudio personalizados."],
              ].map(([numero, titulo, texto]) => (
                <div key={numero} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-xl font-bold text-white">{numero}</div>
                  <h3 className="text-xl font-bold text-slate-950">{titulo}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-semibold uppercase tracking-wide text-blue-600">Feedback</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Feedback de estudiantes que probaron StudyFlow AI</h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {testimonios.map((testimonio) => (
                <Card key={testimonio.nombre} className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="min-h-28 text-sm leading-6 text-slate-700">"{testimonio.texto}"</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{testimonio.nombre}</p>
                        <p className="text-xs text-slate-500">{testimonio.carrera}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="precios" className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-semibold uppercase tracking-wide text-purple-600">Precios</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Planes simples para estudiantes</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">Empieza gratis y escala cuando necesites más cursos, IA y colaboración.</p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
              {planes.map((plan) => (
                <Card key={plan.nombre} className={`relative border-2 bg-white shadow-sm ${plan.destacado ? "border-blue-600 shadow-xl shadow-blue-600/10" : "border-slate-200"}`}>
                  {plan.destacado && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm font-semibold text-white">Más completo</span>
                    </div>
                  )}
                  <CardContent className="p-7 sm:p-8">
                    <h3 className="text-2xl font-bold text-slate-950">{plan.nombre}</h3>
                    <p className="mt-2 min-h-12 text-slate-600">{plan.subtitulo}</p>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-slate-950">{plan.precio}</span>
                      <span className="text-slate-500">/mes</span>
                    </div>
                    <ul className="mt-8 space-y-3">
                      {plan.caracteristicas.map((caracteristica) => (
                        <li key={caracteristica} className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                          <span className="text-slate-700">{caracteristica}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant={plan.destacado ? "default" : "outline"} className={`mt-8 h-11 w-full rounded-lg ${plan.destacado ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : "border-slate-300"}`}>
                      <Link to={plan.destino}>{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-slate-500">Precio referencial para validación del proyecto.</p>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-4 py-16 text-white sm:px-6 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">Empieza a estudiar con más claridad desde hoy.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-blue-50">
              Organiza tus cursos, prioriza tus pendientes y deja que la IA te ayude a avanzar.
            </p>
            <Button asChild size="lg" className="mt-8 h-12 rounded-lg bg-white px-7 text-base text-blue-700 hover:bg-blue-50">
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
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-semibold">StudyFlow AI</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                Plataforma académica con IA para organizar cursos, priorizar pendientes y avanzar con menos estrés.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Producto</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li><a href="#caracteristicas" className="hover:text-white">Características</a></li>
                <li><a href="#colaborativo" className="hover:text-white">Trabajo colaborativo</a></li>
                <li><a href="#precios" className="hover:text-white">Precios</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Acceso</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li><Link to="/login" className="hover:text-white">Iniciar sesión</Link></li>
                <li><Link to="/register?plan=gratis" className="hover:text-white">Empieza gratis</Link></li>
                <li><Link to="/login" className="hover:text-white">Ver demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Síguenos en redes</h3>
              <p className="mt-4 text-sm leading-6 text-slate-400">Tips de estudio, productividad académica y novedades de StudyFlow AI.</p>
              <div className="mt-5 flex gap-3">
                {[
                  [Instagram, "Instagram"],
                  [MessageCircle, "TikTok"],
                  [Linkedin, "LinkedIn"],
                  [Facebook, "Facebook"],
                ].map(([Icono, label]) => (
                  <a key={String(label)} href="#" aria-label={String(label)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white">
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
