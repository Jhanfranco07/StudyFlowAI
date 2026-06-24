import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { api, type AdminMetricsApi, type AdminUserApi, type UsuarioApi } from "../data/api";
import { useStudyFlow } from "../data/studyflow-store";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const planes: Array<{ valor: UsuarioApi["plan"]; etiqueta: string }> = [
  { valor: "gratis", etiqueta: "Gratis" },
  { valor: "estudiante", etiqueta: "Estudiante" },
  { valor: "premium", etiqueta: "Premium" },
  { valor: "premium_plus", etiqueta: "Premium Plus" },
];

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

export default function AdminPanel() {
  const { usuarioActual } = useStudyFlow();
  const [metricas, setMetricas] = useState<AdminMetricsApi | null>(null);
  const [usuarios, setUsuarios] = useState<AdminUserApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [accionEnCurso, setAccionEnCurso] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<AdminUserApi | null>(null);

  const esAdmin = usuarioActual?.rol === "admin";

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
  const totalEstudiantes = Math.max(usuarios.length - totalAdmins, 0);

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
    setUsuarioSeleccionado((actual) =>
      actual?.id === usuarioActualizado.id ? { ...actual, ...usuarioActualizado } : actual,
    );
  };

  const cambiarRol = async (usuario: AdminUserApi, rol: AdminUserApi["rol"]) => {
    if (!usuarioActual?.id || usuario.rol === rol) return;
    setAccionEnCurso(`rol-${usuario.id}`);
    setError("");

    try {
      const actualizado = await api.cambiarRolUsuarioAdmin(usuarioActual.id, usuario.id, rol);
      actualizarUsuario(actualizado);
    } catch (errorAccion) {
      setError(errorAccion instanceof Error ? errorAccion.message : "No se pudo actualizar el rol.");
    } finally {
      setAccionEnCurso("");
    }
  };

  const cambiarPlan = async (usuario: AdminUserApi, plan: UsuarioApi["plan"]) => {
    if (!usuarioActual?.id || usuario.plan === plan) return;
    setAccionEnCurso(`plan-${usuario.id}`);
    setError("");

    try {
      const actualizado = await api.cambiarPlanUsuarioAdmin(usuarioActual.id, usuario.id, plan);
      actualizarUsuario(actualizado);
    } catch (errorAccion) {
      setError(errorAccion instanceof Error ? errorAccion.message : "No se pudo actualizar el plan.");
    } finally {
      setAccionEnCurso("");
    }
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

      {cargando ? (
        <Card className="shadow-sm">
          <CardContent className="p-6 text-sm text-slate-500">Cargando panel administrativo...</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricaCard icon={Users} titulo="Usuarios" valor={valorMetrica(metricas?.totalUsuarios)} detalle={`${totalAdmins} admin / ${totalEstudiantes} estudiantes`} />
            <MetricaCard icon={CheckCircle2} titulo="Verificados" valor={valorMetrica(metricas?.totalUsuariosVerificados)} detalle="Correos confirmados" />
            <MetricaCard icon={BookOpen} titulo="Cursos" valor={valorMetrica(metricas?.totalCursos)} detalle="Cursos registrados" />
            <MetricaCard icon={ClipboardList} titulo="Tareas y examenes" valor={`${valorMetrica(metricas?.totalTareas)} / ${valorMetrica(metricas?.totalExamenes)}`} detalle="Tareas / examenes" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Usuarios por plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metricas?.usuariosPorPlan.length ? (
                  metricas.usuariosPorPlan.map((item) => (
                    <div key={item.plan} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                      <span className="font-medium text-slate-700">{item.plan}</span>
                      <Badge className="bg-white text-slate-700">{item.total}</Badge>
                    </div>
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
                <MiniDato etiqueta="Proyectos largos" valor={valorMetrica(metricas?.totalProyectosLargos)} />
                <MiniDato etiqueta="Trabajos grupales" valor={valorMetrica(metricas?.totalTrabajosGrupales)} />
                <MiniDato etiqueta="Notificaciones" valor={valorMetrica(metricas?.totalNotificaciones)} />
                <MiniDato etiqueta="Estados de verificacion" valor={String(metricas?.usuariosPorVerificacion.length ?? 0)} />
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
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">{usuario.nombre || "Sin nombre"}</TableCell>
                        <TableCell>{usuario.correo}</TableCell>
                        <TableCell>
                          <Select
                            value={usuario.rol}
                            disabled={accionEnCurso === `rol-${usuario.id}`}
                            onValueChange={(rol: AdminUserApi["rol"]) => cambiarRol(usuario, rol)}
                          >
                            <SelectTrigger className="h-9 w-[132px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="estudiante">Estudiante</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={usuario.plan}
                            disabled={accionEnCurso === `plan-${usuario.id}`}
                            onValueChange={(plan: UsuarioApi["plan"]) => cambiarPlan(usuario, plan)}
                          >
                            <SelectTrigger className="h-9 w-[142px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {planes.map((plan) => (
                                <SelectItem key={plan.valor} value={plan.valor}>
                                  {plan.etiqueta}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Button variant="outline" size="sm" onClick={() => setUsuarioSeleccionado(usuario)}>
                            Ver detalle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
            <Card className="border-blue-100 bg-blue-50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="font-semibold text-blue-950">{usuarioSeleccionado.nombre}</h2>
                    <p className="mt-1 text-sm text-blue-800">{usuarioSeleccionado.correo}</p>
                    <p className="mt-2 text-sm text-blue-700">
                      Rol {usuarioSeleccionado.rol}, plan {usuarioSeleccionado.plan}, registrado el {formatearFecha(usuarioSeleccionado.creadoEn)}.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setUsuarioSeleccionado(null)}>
                    Cerrar detalle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}

function MetricaCard({
  icon: Icon,
  titulo,
  valor,
  detalle,
}: {
  icon: typeof Users;
  titulo: string;
  valor: string;
  detalle: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{titulo}</p>
          <p className="text-2xl font-bold text-slate-900">{valor}</p>
          <p className="text-xs text-slate-500">{detalle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{etiqueta}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{valor}</p>
    </div>
  );
}
