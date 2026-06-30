import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckSquare,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Milestone,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PLANES, canUseLongProjects } from "../data/plan-rules";
import { obtenerAlertasInteligentes, useStudyFlow } from "../data/studyflow-store";
import { Button } from "./ui/button";

const menuItems = [
  { path: "/app", label: "nav.dashboard", icon: LayoutDashboard },
  { path: "/app/courses", label: "nav.courses", icon: BookOpen },
  { path: "/app/tasks", label: "nav.tasks", icon: CheckSquare },
  { path: "/app/projects", label: "nav.thesis", icon: Milestone, premiumPlus: true },
  { path: "/app/team-projects", label: "nav.teamProjects", icon: FolderKanban },
  { path: "/app/exams", label: "nav.exams", icon: ClipboardList },
  { path: "/app/planner", label: "nav.planner", icon: Calendar },
  { path: "/app/assistant", label: "nav.assistant", icon: Sparkles },
  { path: "/app/progress", label: "nav.progress", icon: TrendingUp },
  { path: "/app/notifications", label: "nav.notifications", icon: Bell },
  { path: "/app/settings", label: "nav.settings", icon: Settings },
  { path: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

export default function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { usuarioActual, notificaciones, cerrarSesion, cursos, tareas, examenes, bloquesPlanificador } =
    useStudyFlow();
  const cantidadNoLeidas = notificaciones.filter((item) => item.noLeida).length;
  const alertasInteligentes = useMemo(
    () => obtenerAlertasInteligentes(cursos, tareas, examenes, bloquesPlanificador),
    [bloquesPlanificador, cursos, examenes, tareas],
  );
  const totalNotificacionesVisibles = Math.max(cantidadNoLeidas, alertasInteligentes.length);
  const menuItemsVisibles = menuItems.filter(
    (item) =>
      (!item.premiumPlus || canUseLongProjects(usuarioActual)) &&
      (!item.adminOnly || usuarioActual?.rol === "admin" || usuarioActual?.rol === "superadmin"),
  );
  const planActual = PLANES[usuarioActual?.plan ?? "gratis"];

  return (
    <aside
      className={
        mobile
          ? "w-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"
          : "fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 bg-white text-slate-900 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
      }
    >
      <div className="p-6">
        <Link to="/app" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-lg font-semibold text-transparent">
            StudyFlow AI
          </span>
        </Link>
      </div>

      <nav className="space-y-1 px-3">
        {menuItemsVisibles.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 dark:from-blue-950/60 dark:to-purple-950/60 dark:text-blue-300"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.adminOnly ? item.label : t(item.label)}</span>
              {item.path === "/app/notifications" && totalNotificacionesVisibles > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {totalNotificacionesVisibles}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 px-6 pb-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4 text-white">
          <p className="text-sm text-white/70">{t("nav.activeSession")}</p>
          <p className="mt-1 font-semibold">
            {usuarioActual ? `${usuarioActual.nombres} ${usuarioActual.apellidos}` : t("nav.guest")}
          </p>
          <p className="text-sm text-white/70">{usuarioActual?.carrera ?? t("nav.completeProfile")}</p>
          <div className="mt-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            {planActual.etiqueta}
          </div>
          <Button
            variant="secondary"
            className="mt-4 w-full justify-center border-white/10 bg-white/10 text-white hover:bg-white/20"
            onClick={cerrarSesion}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("nav.logout")}
          </Button>
        </div>
      </div>
    </aside>
  );
}
