import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { api, type AdminMetricsApi, type AdminUserApi, type AdminUserDetailApi, type UsuarioApi } from "../data/api";
import { useStudyFlow } from "../data/studyflow-store";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const PLAN_OPTIONS: Array<{ value: UsuarioApi["plan"]; label: string }> = [
  { value: "gratis", label: "Gratis" },
  { value: "estudiante", label: "Estudiante" },
  { value: "premium", label: "Premium" },
  { value: "premium_plus", label: "Premium Plus" },
];

const ROLE_OPTIONS: Array<{ value: AdminUserApi["rol"]; label: string }> = [
  { value: "estudiante", label: "Estudiante" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Superadmin" },
];

type AccionPendiente =
  | { tipo: "rol"; usuario: AdminUserApi; valorAnterior: AdminUserApi["rol"]; valorNuevo: AdminUserApi["rol"] }
  | { tipo: "plan"; usuario: AdminUserApi; valorAnterior: UsuarioApi["plan"]; valorNuevo: UsuarioApi["plan"] };

function esRolAdminValido(valor: string): valor is AdminUserApi["rol"] {
  return ROLE_OPTIONS.some((item) => item.value === valor);
}

function esPlanValido(valor: string): valor is UsuarioApi["plan"] {
  return PLAN_OPTIONS.some((item) => item.value === valor);
}

function formatearFecha(valor: string) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha);
}

function valorMetrica(valor: number | null | undefined) {
  return String(valor ?? 0);
}

function porcentaje(parte: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((parte / total) * 100);
}

function etiquetaPlan(plan: UsuarioApi["plan"]) {
  return PLAN_OPTIONS.find((item) => item.value === plan)?.label ?? plan;
}

function etiquetaRol(rol: AdminUserApi["rol"]) {
  return ROLE_OPTIONS.find((item) => item.value === rol)?.label ?? rol;
}

function etiquetaEstadoTarea(estado: string) {
  const mapa: Record<string, string> = {
    pending: "Pendientes",
    "in-progress": "En progreso",
    completed: "Completadas",
    overdue: "Atrasadas",
  };
  return mapa[estado] ?? estado;
}

function etiquetaTexto(valor: string | null | undefined) {
  return String(valor || "sin_definir").replace(/_/g, " ");
}

function etiquetaTono(tono: string) {
  const mapa: Record<string, string> = {
    frio: "Frio",
    amigable: "Amigable",
    responsable: "Responsable",
    sin_definir: "Sin definir",
  };
  return mapa[tono] ?? etiquetaTexto(tono);
}

export default function AdminPanel() {
  const { usuarioActual } = useStudyFlow();
  const [metricas, setMetricas] = useState<AdminMetricsApi | null>(null);
  const [usuarios, setUsuarios] = useState<AdminUserApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [accionEnCurso, setAccionEnCurso] = useState("");
  const [accionPendiente, setAccionPendiente] = useState<AccionPendiente | null>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<AdminUserDetailApi | null>(null);
  const [cargandoDetalleId, setCargandoDetalleId] = useState("");

  const esAdmin = usuarioActual?.rol === "admin" || usuarioActual?.rol === "superadmin";
  const esSuperadmin = usuarioActual?.rol === "superadmin";

  useEffect(() => {
    if (!usuarioActual?.id || !esAdmin) {
      setCargando(false);
      return;
    }

    let activo = true;
    setCargando(true);
    setError("");

    Promise.all([
      api.obtenerMetricasAdmin(usuarioActual.id),
      api.obtenerUsuariosAdmin(usuarioActual.id),
    ])
      .then(([metricasAdmin, usuariosAdmin]) => {
        if (!activo) return;
        setMetricas(metricasAdmin);
        setUsuarios(usuariosAdmin);
      })
      .catch((errorCarga) => {
        if (!activo) return;
        setError(errorCarga instanceof Error ? errorCarga.message : "No se pudo cargar el panel administrativo.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [esAdmin, usuarioActual?.id]);

  const totalAdmins = useMemo(() => usuarios.filter((usuario) => usuario.rol === "admin").length, [usuarios]);
  const totalSuperadmins = useMemo(() => usuarios.filter((usuario) => usuario.rol === "superadmin").length, [usuarios]);
  const totalEstudiantes = Math.max(usuarios.length - totalAdmins - totalSuperadmins, 0);
  const totalUsuarios = metricas?.totalUsuarios ?? usuarios.length;
  const totalVerificados = metricas?.totalUsuariosVerificados ?? 0;
  const totalNoVerificados = Math.max(totalUsuarios - totalVerificados, 0);
  const totalAcademico =
    (metricas?.totalCursos ?? 0) +
    (metricas?.totalTareas ?? 0) +
    (metricas?.totalExamenes ?? 0);
  const usuariosPorPlan = metricas?.usuariosPorPlan ?? [];
  const usuariosPorRol = metricas?.usuariosPorRol ?? [];
  const tareasPorEstado = metricas?.tareasPorEstado ?? [];
  const usuariosPorMetodoEstudio = metricas?.usuariosPorMetodoEstudio ?? [];
  const usuariosPorTonoAsistente = metricas?.usuariosPorTonoAsistente ?? [];
  const usuariosPorObjetivo = metricas?.usuariosPorObjetivo ?? [];
  const usuariosPorTipoPerfil = metricas?.usuariosPorTipoPerfil ?? [];
  const usuariosPorMicroSesion = metricas?.usuariosPorMicroSesion ?? [];

  const refrescarMetricas = async () => {
    if (!usuarioActual?.id) return;
    const metricasActualizadas = await api.obtenerMetricasAdmin(usuarioActual.id);
    setMetricas(metricasActualizadas);
  };

  const puedeCambiarPlan = (usuario: AdminUserApi) => {
    if (!usuarioActual) return false;
    if (usuario.rol === "superadmin") return false;
    if (usuarioActual.rol === "superadmin") return true;
    return usuarioActual.rol === "admin" && usuario.rol === "estudiante";
  };

  const actualizarUsuario = (usuarioActualizado: AdminUserApi) => {
    setUsuarios((actuales) =>
      actuales.map((usuario) =>
        usuario.id === usuarioActualizado.id
          ? {
              ...usuario,
              ...usuarioActualizado,
              totalCursos: usuario.totalCursos,
              totalTareas: usuario.totalTareas,
              totalExamenes: usuario.totalExamenes,
            }
          : usuario,
      ),
    );
    setUsuarioSeleccionado((actual) => (actual?.id === usuarioActualizado.id ? { ...actual, ...usuarioActualizado } : actual));
  };

  const cargarDetalleUsuario = async (usuario: AdminUserApi) => {
    if (!usuarioActual?.id) return;
    setCargandoDetalleId(usuario.id);
    setError("");
    setMensaje("");

    try {
      const detalle = await api.obtenerDetalleUsuarioAdmin(usuarioActual.id, usuario.id);
      setUsuarioSeleccionado(detalle);
    } catch (errorDetalle) {
      setError(errorDetalle instanceof Error ? errorDetalle.message : "No se pudo cargar el detalle del usuario.");
    } finally {
      setCargandoDetalleId("");
    }
  };

  const solicitarCambioRol = (usuario: AdminUserApi, rol: AdminUserApi["rol"]) => {
    if (usuario.rol === rol) return;
    if (!esSuperadmin) {
      setError("Solo un superadmin puede cambiar roles.");
      setMensaje("");
      return;
    }

    setError("");
    setMensaje("");
    setAccionPendiente({ tipo: "rol", usuario, valorAnterior: usuario.rol, valorNuevo: rol });
  };

  const solicitarCambioPlan = (usuario: AdminUserApi, plan: UsuarioApi["plan"]) => {
    if (usuario.plan === plan) return;
    if (!puedeCambiarPlan(usuario)) {
      setError("No tienes permisos para modificar este usuario.");
      setMensaje("");
      return;
    }

    setError("");
    setMensaje("");
    setAccionPendiente({ tipo: "plan", usuario, valorAnterior: usuario.plan, valorNuevo: plan });
  };

  const cambiarRol = async (usuario: AdminUserApi, rol: AdminUserApi["rol"]) => {
    if (!usuarioActual?.id || usuario.rol === rol) return;
    if (!esSuperadmin) {
      setError("Solo un superadmin puede cambiar roles.");
      setMensaje("");
      return;
    }
    if (usuario.id === usuarioActual.id && usuario.rol === "superadmin" && rol !== "superadmin") {
      setError("No puedes quitarte tu propio rol de superadmin.");
      setMensaje("");
      return;
    }
    if (usuario.rol === "superadmin" && rol !== "superadmin" && totalSuperadmins <= 1) {
      setError("Debe existir al menos un superadmin en el sistema.");
      setMensaje("");
      return;
    }

    setAccionEnCurso(`rol-${usuario.id}`);
    setError("");
    setMensaje("");

    try {
      const actualizado = await api.cambiarRolUsuarioAdmin(usuarioActual.id, usuario.id, rol);
      actualizarUsuario(actualizado);
      await refrescarMetricas();
      setMensaje("Rol actualizado correctamente.");
    } catch (errorAccion) {
      setError(errorAccion instanceof Error ? errorAccion.message : "No se pudo actualizar el usuario.");
    } finally {
      setAccionEnCurso("");
    }
  };

  const cambiarPlan = async (usuario: AdminUserApi, plan: UsuarioApi["plan"]) => {
    if (!usuarioActual?.id || usuario.plan === plan) return;
    if (!puedeCambiarPlan(usuario)) {
      setError("No tienes permisos para modificar este usuario.");
      setMensaje("");
      return;
    }

    setAccionEnCurso(`plan-${usuario.id}`);
    setError("");
    setMensaje("");

    try {
      const actualizado = await api.cambiarPlanUsuarioAdmin(usuarioActual.id, usuario.id, plan);
      actualizarUsuario(actualizado);
      await refrescarMetricas();
      setMensaje("Plan actualizado correctamente.");
    } catch (errorAccion) {
      setError(errorAccion instanceof Error ? errorAccion.message : "No se pudo actualizar el usuario.");
    } finally {
      setAccionEnCurso("");
    }
  };

  const confirmarAccionPendiente = async () => {
    const accion = accionPendiente;
    if (!accion) return;
    setAccionPendiente(null);

    if (accion.tipo === "rol") {
      await cambiarRol(accion.usuario, accion.valorNuevo);
      return;
    }

    await cambiarPlan(accion.usuario, accion.valorNuevo);
  };

  if (!esAdmin) {
    return (
      <Card className="border-red-100 bg-red-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-red-600" />
            <div>
              <h1 className="text-xl font-bold text-red-700">Acceso denegado</h1>
              <p className="mt-2 text-sm text-red-700">
                Necesitas rol administrador para entrar al panel administrativo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Badge className="mb-3 bg-blue-50 text-blue-700">MVP administrativo</Badge>
          <h1 className="text-2xl font-bold sm:text-3xl">Panel Administrativo</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Vista resumida para supervisar usuarios, planes y actividad general del sistema.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Sesion admin: <span className="font-semibold text-slate-900">{usuarioActual.correo}</span>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {mensaje ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {mensaje}
        </div>
      ) : null}

      {cargando ? (
        <Card className="shadow-sm">
          <CardContent className="p-6 text-sm text-slate-500">Cargando panel administrativo...</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricaCard
              icon={Users}
              titulo="Usuarios"
              valor={valorMetrica(totalUsuarios)}
              detalle={`${totalSuperadmins} superadmin / ${totalAdmins} admin / ${totalEstudiantes} estudiantes`}
              porcentaje={porcentaje(totalAdmins + totalSuperadmins, totalUsuarios)}
              etiquetaPorcentaje="con acceso admin"
            />
            <MetricaCard
              icon={CheckCircle2}
              titulo="Verificacion"
              valor={`${metricas?.porcentajeVerificacion ?? porcentaje(totalVerificados, totalUsuarios)}%`}
              detalle={`${totalVerificados} verificados / ${totalNoVerificados} pendientes`}
              porcentaje={metricas?.porcentajeVerificacion ?? porcentaje(totalVerificados, totalUsuarios)}
              etiquetaPorcentaje="confirmado"
            />
            <MetricaCard
              icon={GraduationCap}
              titulo="Carga academica"
              valor={valorMetrica(totalAcademico)}
              detalle={`${valorMetrica(metricas?.totalCursos)} cursos, ${valorMetrica(metricas?.totalTareas)} tareas, ${valorMetrica(metricas?.totalExamenes)} examenes`}
              porcentaje={porcentaje(metricas?.totalTareas ?? 0, Math.max(totalAcademico, 1))}
              etiquetaPorcentaje="tareas"
            />
            <MetricaCard
              icon={TrendingUp}
              titulo="Usuarios recientes"
              valor={valorMetrica(metricas?.usuariosRecientes)}
              detalle="Altas de los ultimos 30 dias"
              porcentaje={porcentaje(metricas?.usuariosRecientes ?? 0, totalUsuarios)}
              etiquetaPorcentaje="del total"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Usuarios por plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {usuariosPorPlan.length ? (
                  usuariosPorPlan.map((item) => (
                    <BarraDistribucion
                      key={item.plan}
                      etiqueta={etiquetaPlan(item.plan)}
                      valor={item.total}
                      total={totalUsuarios}
                      color="bg-blue-600"
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No hay datos por plan.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  Actividad general
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <MiniDato etiqueta="Proyectos largos" valor={valorMetrica(metricas?.totalProyectosLargos)} detalle="Entregables individuales" />
                <MiniDato etiqueta="Trabajos grupales" valor={valorMetrica(metricas?.totalTrabajosGrupales)} detalle="Colaborativos activos" />
                <MiniDato etiqueta="Notificaciones" valor={valorMetrica(metricas?.totalNotificaciones)} detalle="Historial generado" />
                <MiniDato etiqueta="Promedio tareas" valor={String(metricas?.promedioTareasPorUsuario ?? 0)} detalle="Por usuario" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="shadow-sm xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Estado de tareas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tareasPorEstado.length ? (
                  tareasPorEstado.map((item) => (
                    <BarraDistribucion
                      key={item.estado}
                      etiqueta={etiquetaEstadoTarea(item.estado)}
                      valor={item.total}
                      total={metricas.totalTareas ?? 0}
                      color={
                        item.estado === "completed"
                          ? "bg-emerald-600"
                          : item.estado === "overdue"
                            ? "bg-red-600"
                            : item.estado === "in-progress"
                              ? "bg-blue-600"
                              : "bg-slate-500"
                      }
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No hay tareas registradas.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  Control de acceso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(usuariosPorRol.length ? usuariosPorRol : [
                  { rol: "superadmin" as const, total: totalSuperadmins },
                  { rol: "admin" as const, total: totalAdmins },
                  { rol: "estudiante" as const, total: totalEstudiantes },
                ]).map((item) => (
                  <BarraDistribucion
                    key={item.rol}
                    etiqueta={etiquetaRol(item.rol)}
                    valor={item.total}
                    total={totalUsuarios}
                    color={item.rol === "superadmin" ? "bg-indigo-600" : item.rol === "admin" ? "bg-violet-600" : "bg-cyan-600"}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Metodos de estudio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {usuariosPorMetodoEstudio.length ? (
                  usuariosPorMetodoEstudio.map((item) => (
                    <BarraDistribucion
                      key={item.metodo}
                      etiqueta={etiquetaTexto(item.metodo)}
                      valor={item.total}
                      total={totalUsuarios}
                      color="bg-indigo-600"
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No hay metodos registrados.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCog className="h-5 w-5 text-blue-600" />
                  Tono de asistente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {usuariosPorTonoAsistente.length ? (
                  usuariosPorTonoAsistente.map((item) => (
                    <BarraDistribucion
                      key={item.tono}
                      etiqueta={etiquetaTono(item.tono)}
                      valor={item.total}
                      total={totalUsuarios}
                      color="bg-emerald-600"
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No hay preferencias de tono.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Perfil de negocio
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <MiniDato
                  etiqueta="Objetivo principal"
                  valor={etiquetaTexto(usuariosPorObjetivo[0]?.objetivo)}
                  detalle={`${usuariosPorObjetivo[0]?.total ?? 0} usuarios`}
                />
                <MiniDato
                  etiqueta="Perfil mas comun"
                  valor={etiquetaTexto(usuariosPorTipoPerfil[0]?.tipo)}
                  detalle={`${usuariosPorTipoPerfil[0]?.total ?? 0} usuarios`}
                />
                <MiniDato
                  etiqueta="Micro-sesion preferida"
                  valor={`${usuariosPorMicroSesion[0]?.duracion ?? 0} min`}
                  detalle={`${usuariosPorMicroSesion[0]?.total ?? 0} usuarios`}
                />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-blue-600" />
                Usuarios registrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usuarios.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Verificacion</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead>Actividad</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => {
                      const actualizandoRol = accionEnCurso === `rol-${usuario.id}`;
                      const actualizandoPlan = accionEnCurso === `plan-${usuario.id}`;
                      const esSuperadminActual = usuario.id === usuarioActual.id && usuario.rol === "superadmin";
                      const esUnicoSuperadmin = usuario.rol === "superadmin" && totalSuperadmins <= 1;
                      const bloquearBajaSuperadmin = esSuperadminActual || esUnicoSuperadmin;
                      const planPermitido = puedeCambiarPlan(usuario);
                      const ayudaRol = !esSuperadmin
                        ? "Solo un superadmin puede cambiar roles."
                        : esSuperadminActual
                          ? "No puedes cambiar tu propio rol superadmin"
                          : esUnicoSuperadmin
                            ? "Debe existir al menos un superadmin"
                            : "";
                      const ayudaPlan = planPermitido ? "" : "No tienes permisos para modificar este usuario.";

                      return (
                        <TableRow key={usuario.id}>
                          <TableCell className="font-medium">{usuario.nombre || "Sin nombre"}</TableCell>
                          <TableCell>{usuario.correo}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Select
                                value={usuario.rol}
                                disabled={!esSuperadmin || actualizandoRol}
                                onValueChange={(rol) => {
                                  if (esRolAdminValido(rol)) {
                                    solicitarCambioRol(usuario, rol);
                                  } else {
                                    setError("Rol no valido.");
                                    setMensaje("");
                                  }
                                }}
                              >
                                <SelectTrigger className="h-9 w-[132px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLE_OPTIONS.map((rol) => (
                                    <SelectItem
                                      key={rol.value}
                                      value={rol.value}
                                      disabled={rol.value !== "superadmin" && bloquearBajaSuperadmin}
                                    >
                                      {rol.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {actualizandoRol ? <p className="text-xs text-blue-600">Actualizando rol...</p> : null}
                              {ayudaRol ? <p className="max-w-[160px] text-xs text-slate-500">{ayudaRol}</p> : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Select
                                value={usuario.plan}
                                disabled={!planPermitido || actualizandoPlan}
                                onValueChange={(plan) => {
                                  if (esPlanValido(plan)) {
                                    solicitarCambioPlan(usuario, plan);
                                  } else {
                                    setError("Plan no valido.");
                                    setMensaje("");
                                  }
                                }}
                              >
                                <SelectTrigger className="h-9 w-[142px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PLAN_OPTIONS.map((plan) => (
                                    <SelectItem key={plan.value} value={plan.value}>
                                      {plan.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {actualizandoPlan ? <p className="text-xs text-blue-600">Actualizando plan...</p> : null}
                              {ayudaPlan ? <p className="max-w-[170px] text-xs text-slate-500">{ayudaPlan}</p> : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={usuario.emailVerificado ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}>
                              {usuario.emailVerificado ? "Verificado" : "No verificado"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatearFecha(usuario.creadoEn)}</TableCell>
                          <TableCell>
                            <span className="text-slate-600">
                              {usuario.totalCursos ?? 0} cursos / {usuario.totalTareas ?? 0} tareas / {usuario.totalExamenes ?? 0} examenes
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={cargandoDetalleId === usuario.id}
                              onClick={() => cargarDetalleUsuario(usuario)}
                            >
                              {cargandoDetalleId === usuario.id ? "Cargando..." : "Ver detalle"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  No hay usuarios registrados para mostrar.
                </p>
              )}
            </CardContent>
          </Card>

          {usuarioSeleccionado ? (
            <DetalleUsuario usuario={usuarioSeleccionado} onCerrar={() => setUsuarioSeleccionado(null)} />
          ) : null}

          <ConfirmacionAccionAdmin
            accion={accionPendiente}
            cargando={Boolean(accionEnCurso)}
            onCancelar={() => setAccionPendiente(null)}
            onConfirmar={confirmarAccionPendiente}
          />
        </>
      )}
    </div>
  );
}

function ConfirmacionAccionAdmin({
  accion,
  cargando,
  onCancelar,
  onConfirmar,
}: {
  accion: AccionPendiente | null;
  cargando: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  const abierto = Boolean(accion);
  const nombre = accion?.usuario.nombre || "este usuario";
  const esRol = accion?.tipo === "rol";
  const accesoActual = esRol && accion.valorAnterior !== "estudiante";
  const accesoNuevo = esRol && accion.valorNuevo !== "estudiante";
  const advertenciaRol = esRol
    ? accesoActual && !accesoNuevo
      ? "Este usuario perdera acceso al panel administrativo."
      : !accesoActual && accesoNuevo
        ? "Este cambio le dara acceso al panel administrativo."
        : "Este cambio modificara los permisos administrativos del usuario."
    : "";

  const titulo = esRol ? "Confirmar cambio de rol" : "Confirmar cambio de plan";
  const descripcion = accion
    ? esRol
      ? `Confirmas cambiar el rol de ${nombre} de ${etiquetaRol(accion.valorAnterior)} a ${etiquetaRol(accion.valorNuevo)}?`
      : `Confirmas cambiar el plan de ${nombre} de ${etiquetaPlan(accion.valorAnterior)} a ${etiquetaPlan(accion.valorNuevo)}?`
    : "";
  const detalle = esRol ? advertenciaRol : "Este cambio puede habilitar o restringir funcionalidades del sistema.";

  return (
    <AlertDialog open={abierto} onOpenChange={(open) => !open && onCancelar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">{descripcion}</span>
            <span className="block">{detalle}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cargando} onClick={onCancelar}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction disabled={cargando} onClick={onConfirmar}>
            {cargando ? "Actualizando..." : "Confirmar cambio"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DetalleUsuario({ usuario, onCerrar }: { usuario: AdminUserDetailApi; onCerrar: () => void }) {
  return (
    <Card className="border-blue-100 bg-blue-50 shadow-sm">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-blue-950">{usuario.nombre}</h2>
            <p className="mt-1 text-sm text-blue-800">{usuario.correo}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="bg-white text-blue-700">{usuario.rol}</Badge>
              <Badge className="bg-white text-blue-700">{etiquetaPlan(usuario.plan)}</Badge>
              <Badge className={usuario.emailVerificado ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                {usuario.emailVerificado ? "Verificado" : "No verificado"}
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={onCerrar}>
            Cerrar detalle
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MiniDato etiqueta="Universidad" valor={usuario.universidad || "Sin dato"} detalle={usuario.carrera || "Carrera no registrada"} />
          <MiniDato etiqueta="Perfil" valor={etiquetaTexto(usuario.tipoPerfil)} detalle={`Semestre ${usuario.semestre || "sin dato"}`} />
          <MiniDato etiqueta="Metodo" valor={etiquetaTexto(usuario.metodoEstudio)} detalle={`Tono ${etiquetaTono(usuario.tonoAsistente)}`} />
          <MiniDato etiqueta="Micro-sesion" valor={`${usuario.preferenciaMicroSesion} min`} detalle={`${usuario.horasEstudioDiarias ?? 0}h estudio/dia`} />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-900">Perfil academico</div>
            <div className="space-y-2 text-sm text-slate-600">
              <p><span className="font-medium text-slate-800">Objetivo:</span> {etiquetaTexto(usuario.objetivoAcademico)}</p>
              <p><span className="font-medium text-slate-800">Metas:</span> {usuario.metas || "Sin metas registradas"}</p>
              <p><span className="font-medium text-slate-800">Disponibilidad:</span> {usuario.diasMayorDisponibilidad || "Sin dato"}</p>
              <p><span className="font-medium text-slate-800">Trabajo:</span> {usuario.horarioLaboral || "No registrado"}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-900">Actividad resumida</div>
            <div className="grid gap-2 text-sm">
              <MiniDato etiqueta="Cursos" valor={String(usuario.cursos.length)} detalle="Muestra reciente" />
              <MiniDato etiqueta="Notificaciones" valor={String(usuario.totalNotificaciones)} detalle="Historial total" />
              <MiniDato etiqueta="Proyectos largos" valor={String(usuario.totalProyectosLargos)} detalle={usuario.tieneTesisProyecto ? "Tiene tesis/proyecto" : "Sin tesis marcada"} />
              <MiniDato etiqueta="Trabajos grupales" valor={String(usuario.totalTrabajosGrupales)} detalle="Colaboracion" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-900">Cursos principales</div>
            <div className="space-y-2">
              {usuario.cursos.length ? (
                usuario.cursos.map((curso) => (
                  <div key={curso.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <div className="font-medium text-slate-800">{curso.nombre}</div>
                    <div className="text-xs text-slate-500">{curso.docente} · semestre {curso.semestre}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Sin cursos registrados.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-900">Tareas recientes</div>
            <div className="space-y-2">
              {usuario.tareas.length ? (
                usuario.tareas.map((tarea) => (
                  <div key={`${tarea.titulo}-${tarea.fechaEntrega}`} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-800">{tarea.titulo}</span>
                      <Badge className="bg-white text-slate-700">{tarea.progreso}%</Badge>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {etiquetaEstadoTarea(tarea.estado)} · prioridad {tarea.prioridad} · {formatearFecha(tarea.fechaEntrega)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Sin tareas registradas.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-900">Examenes proximos</div>
            <div className="space-y-2">
              {usuario.examenes.length ? (
                usuario.examenes.map((examen) => (
                  <div key={`${examen.titulo}-${examen.fecha}`} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-800">{examen.titulo}</span>
                      <Badge className="bg-white text-slate-700">{examen.preparacion}%</Badge>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{formatearFecha(examen.fecha)}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Sin examenes registrados.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricaCard({
  icon: Icon,
  titulo,
  valor,
  detalle,
  porcentaje,
  etiquetaPorcentaje,
}: {
  icon: LucideIcon;
  titulo: string;
  valor: string;
  detalle: string;
  porcentaje: number;
  etiquetaPorcentaje: string;
}) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
          <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{titulo}</p>
          <p className="text-2xl font-bold text-slate-900">{valor}</p>
          <p className="text-xs text-slate-500">{detalle}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>{etiquetaPorcentaje}</span>
            <span className="font-semibold text-slate-700">{Math.min(Math.max(porcentaje, 0), 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
              style={{ width: `${Math.min(Math.max(porcentaje, 0), 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniDato({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{etiqueta}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{valor}</p>
      <p className="mt-1 text-xs text-slate-500">{detalle}</p>
    </div>
  );
}

function BarraDistribucion({
  etiqueta,
  valor,
  total,
  color,
}: {
  etiqueta: string;
  valor: number;
  total: number;
  color: string;
}) {
  const proporcion = porcentaje(valor, total);

  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{etiqueta}</span>
        <div className="flex items-center gap-2">
          <Badge className="bg-white text-slate-700">{valor}</Badge>
          <span className="w-10 text-right text-xs text-slate-400">{proporcion}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-white">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${proporcion}%` }} />
      </div>
    </div>
  );
}
