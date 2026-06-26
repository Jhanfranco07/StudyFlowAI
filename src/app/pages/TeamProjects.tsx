import { useMemo, useState } from "react";
import { Activity, CheckCircle2, Circle, Copy, Link2, MessageCircle, Pencil, Plus, ShieldCheck, Trash2, UsersRound } from "lucide-react";
import { PLANES, canUseTeamProjectsAdvanced, isPremiumPlus } from "../data/plan-rules";
import {
  formatearFechaCorta,
  useStudyFlow,
  type EstadoTareaGrupal,
  type Prioridad,
  type ProyectoGrupal,
  type RolIntegranteProyecto,
} from "../data/studyflow-store";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

const columnas: Array<{ estado: EstadoTareaGrupal; titulo: string }> = [
  { estado: "pendiente", titulo: "Pendiente" },
  { estado: "en_proceso", titulo: "En proceso" },
  { estado: "en_revision", titulo: "En revision" },
  { estado: "finalizado", titulo: "Finalizado" },
];

const roles: Array<{ value: RolIntegranteProyecto; label: string }> = [
  { value: "editor", label: "Editor" },
  { value: "responsable", label: "Responsable" },
  { value: "lector", label: "Lector" },
  { value: "admin", label: "Admin" },
];

function etiquetaRolPermiso(rol: RolIntegranteProyecto) {
  return roles.find((item) => item.value === rol)?.label ?? rol;
}

function obtenerIniciales(nombre: string) {
  return (
    nombre
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join("") || "IN"
  );
}

function obtenerEnlaceInvitacion(codigo: string) {
  if (typeof window === "undefined") return `/app/team-projects?join=${codigo}`;
  return `${window.location.origin}/app/team-projects?join=${codigo}`;
}

export default function TeamProjects() {
  const {
    usuarioActual,
    cursos,
    proyectosGrupales,
    agregarProyectoGrupal,
    actualizarProyectoGrupal,
    eliminarProyectoGrupal,
    agregarIntegranteProyectoGrupal,
    actualizarIntegranteProyectoGrupal,
    eliminarIntegranteProyectoGrupal,
    agregarTareaProyectoGrupal,
    actualizarTareaProyectoGrupal,
    comentarTareaProyectoGrupal,
    agregarChecklistTareaGrupal,
    alternarChecklistTareaGrupal,
  } = useStudyFlow();
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [proyectoEnEdicion, setProyectoEnEdicion] = useState<ProyectoGrupal | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", cursoId: "none", fechaLimite: "" });
  const [nuevoIntegrante, setNuevoIntegrante] = useState<Record<string, string>>({});
  const [nuevoCorreoIntegrante, setNuevoCorreoIntegrante] = useState<Record<string, string>>({});
  const [nuevoRol, setNuevoRol] = useState<Record<string, RolIntegranteProyecto>>({});
  const [mensajeCopiado, setMensajeCopiado] = useState<Record<string, string>>({});
  const [nuevaTarea, setNuevaTarea] = useState<Record<string, string>>({});
  const [tareaEnEdicion, setTareaEnEdicion] = useState<ProyectoGrupal["tareas"][number] | null>(null);
  const [nuevoComentario, setNuevoComentario] = useState<Record<string, string>>({});
  const [nuevoChecklist, setNuevoChecklist] = useState<Record<string, string>>({});
  const puedeAvanzado = canUseTeamProjectsAdvanced(usuarioActual);
  const premiumPlusActivo = isPremiumPlus(usuarioActual);
  const plan = PLANES[usuarioActual?.plan ?? "gratis"];
  const puedeCrearProyecto =
    plan.limiteProyectosGrupales === "ilimitado" || proyectosGrupales.length < plan.limiteProyectosGrupales;

  const resumen = useMemo(() => {
    const totalTareas = proyectosGrupales.reduce((sum, proyecto) => sum + proyecto.tareas.length, 0);
    const finalizadas = proyectosGrupales.reduce(
      (sum, proyecto) => sum + proyecto.tareas.filter((tarea) => tarea.estado === "finalizado").length,
      0,
    );
    return {
      avance: totalTareas ? Math.round((finalizadas / totalTareas) * 100) : 0,
    };
  }, [proyectosGrupales]);
  const proyectoTareaEnEdicion = useMemo(
    () => proyectosGrupales.find((proyecto) => proyecto.tareas.some((tarea) => tarea.id === tareaEnEdicion?.id)),
    [proyectosGrupales, tareaEnEdicion],
  );

  const copiar = async (proyectoId: string, texto: string, mensaje: string) => {
    await navigator.clipboard?.writeText(texto);
    setMensajeCopiado({ ...mensajeCopiado, [proyectoId]: mensaje });
  };

  return (
    <div className="space-y-8">
      <Dialog open={Boolean(tareaEnEdicion)} onOpenChange={(abierto) => !abierto && setTareaEnEdicion(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar tarea grupal</DialogTitle>
          </DialogHeader>
          {tareaEnEdicion && proyectoTareaEnEdicion ? (
            <FormularioTareaGrupal
              integrantes={proyectoTareaEnEdicion.integrantes.map((integrante) => ({ id: integrante.id, nombre: integrante.nombre }))}
              valor={{
                titulo: tareaEnEdicion.titulo,
                descripcion: tareaEnEdicion.descripcion,
                responsableId: tareaEnEdicion.responsableId ?? "none",
                fechaLimite: tareaEnEdicion.fechaLimite,
                prioridad: tareaEnEdicion.prioridad,
                progreso: tareaEnEdicion.progreso,
              }}
              onChange={(valor) =>
                setTareaEnEdicion((actual) =>
                  actual
                    ? {
                        ...actual,
                        titulo: valor.titulo,
                        descripcion: valor.descripcion,
                        responsableId: valor.responsableId === "none" ? undefined : valor.responsableId,
                        fechaLimite: valor.fechaLimite,
                        prioridad: valor.prioridad,
                        progreso: valor.progreso,
                      }
                    : actual,
                )
              }
              textoBoton="Guardar cambios"
              disabled={!tareaEnEdicion.titulo || !tareaEnEdicion.fechaLimite}
              onGuardar={() => {
                if (!tareaEnEdicion) return;
                actualizarTareaProyectoGrupal(tareaEnEdicion.id, {
                  titulo: tareaEnEdicion.titulo,
                  descripcion: tareaEnEdicion.descripcion,
                  responsableId: tareaEnEdicion.responsableId,
                  fechaLimite: tareaEnEdicion.fechaLimite,
                  prioridad: tareaEnEdicion.prioridad,
                  progreso: tareaEnEdicion.progreso,
                });
                setTareaEnEdicion(null);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Trabajos grupales</h1>
          <p className="max-w-2xl text-sm text-gray-600 sm:text-base">
            Coordina entregables, responsables, permisos basicos e invitaciones por enlace o codigo.
          </p>
        </div>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600" disabled={!puedeCrearProyecto}>
              <Plus className="mr-2 h-4 w-4" />
              Crear trabajo grupal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo trabajo grupal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input className="mt-2" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
              </div>
              <div>
                <Label>Curso</Label>
                <Select value={form.cursoId} onValueChange={(cursoId) => setForm({ ...form, cursoId })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin curso</SelectItem>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha limite</Label>
                <Input type="date" className="mt-2" value={form.fechaLimite} onChange={(event) => setForm({ ...form, fechaLimite: event.target.value })} />
              </div>
              <div>
                <Label>Descripcion</Label>
                <Textarea className="mt-2" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
              </div>
              <Button
                className="w-full"
                disabled={!form.nombre || !form.fechaLimite || !puedeCrearProyecto}
                onClick={() => {
                  agregarProyectoGrupal({ ...form, cursoId: form.cursoId === "none" ? undefined : form.cursoId });
                  setForm({ nombre: "", descripcion: "", cursoId: "none", fechaLimite: "" });
                  setDialogoAbierto(false);
                }}
              >
                Crear tablero
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Stat label="Plan activo" value={plan.etiqueta} />
        <Stat label="Trabajos activos" value={`${proyectosGrupales.length}`} />
        <Stat label="Avance global" value={`${resumen.avance}%`} />
      </div>

      {premiumPlusActivo ? (
        <Card className="border-none bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 text-white shadow-lg">
          <CardContent className="grid gap-4 p-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-cyan-200">Modo avanzado activo</p>
              <p className="mt-2 text-sm text-white/75">
                Premium Plus refuerza la coordinación con permisos más claros, seguimiento operativo y lectura rápida del tablero.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-cyan-200">Qué mirar primero</p>
              <p className="mt-2 text-sm text-white/75">
                Prioriza tareas sin responsable, entregas próximas y tarjetas en revisión para evitar cuellos de botella.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-cyan-200">Invitación del equipo</p>
              <p className="mt-2 text-sm text-white/75">
                Cada tablero mantiene enlace y código listos para compartir sin sacar al equipo del flujo.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!puedeAvanzado ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5 text-sm text-amber-800">
            {puedeCrearProyecto
              ? "En Gratis puedes validar 1 proyecto grupal activo. Premium habilita mas tableros, responsables y seguimiento avanzado."
              : "Alcanzaste el limite de 1 proyecto grupal del plan Gratis. Premium habilita proyectos ilimitados y seguimiento avanzado."}
          </CardContent>
        </Card>
      ) : null}

      {proyectosGrupales.length === 0 ? (
        <Card className="border-dashed border-slate-300 shadow-none">
          <CardContent className="space-y-3 p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Todavía no tienes tableros grupales activos.</p>
            <p>Crea uno para repartir responsables, mover tareas por estado y compartir enlace o código con tu equipo.</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-8">
        {proyectosGrupales.map((proyecto) => {
          const total = proyecto.tareas.length;
          const finalizadas = proyecto.tareas.filter((tarea) => tarea.estado === "finalizado").length;
          const avance = total ? Math.round((finalizadas / total) * 100) : 0;
          const curso = cursos.find((item) => item.id === proyecto.cursoId);
          const avancePorIntegrante = proyecto.integrantes.map((integrante) => {
            const tareas = proyecto.tareas.filter((tarea) => tarea.responsableId === integrante.id);
            const promedio = tareas.length
              ? Math.round(tareas.reduce((sum, tarea) => sum + tarea.progreso, 0) / tareas.length)
              : 0;
            return { integrante, promedio };
          });
          const tareasSinResponsable = proyecto.tareas.filter((tarea) => !tarea.responsableId).length;
          const tareasEnRevision = proyecto.tareas.filter((tarea) => tarea.estado === "en_revision").length;
          const proximas = [...proyecto.tareas]
            .sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite))
            .slice(0, 3);

          return (
            <Card key={proyecto.id} className="border-none shadow-lg">
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UsersRound className="h-5 w-5" />
                      {proyecto.nombre}
                    </CardTitle>
                    <p className="mt-2 text-sm text-gray-600">
                      {curso?.nombre ?? "Proyecto transversal"} - vence {formatearFechaCorta(proyecto.fechaLimite)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="flex -space-x-2">
                        {proyecto.integrantes.slice(0, 6).map((integrante) => (
                          <div
                            key={integrante.id}
                            title={`${integrante.nombre} - ${integrante.rolPermiso}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-600 to-purple-600 text-xs font-bold text-white shadow-sm"
                          >
                            {obtenerIniciales(integrante.nombre)}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {proyecto.integrantes.length} integrante{proyecto.integrantes.length === 1 ? "" : "s"}
                      </span>
                      <Badge className="bg-slate-100 text-slate-700">Codigo {proyecto.codigoInvitacion}</Badge>
                      {premiumPlusActivo ? <Badge className="bg-cyan-50 text-cyan-700">Modo avanzado</Badge> : null}
                    </div>
                  </div>
                  <div className="min-w-52 space-y-3">
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Avance</span>
                        <span>{avance}%</span>
                      </div>
                      <Progress value={avance} />
                    </div>
                    <Dialog
                      open={proyectoEnEdicion?.id === proyecto.id}
                      onOpenChange={(abierto) => !abierto && setProyectoEnEdicion(null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setProyectoEnEdicion(proyecto)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar tablero
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar trabajo grupal</DialogTitle>
                        </DialogHeader>
                        {proyectoEnEdicion ? (
                          <FormularioTrabajoGrupal
                            cursos={cursos.map((curso) => ({ id: curso.id, nombre: curso.nombre }))}
                            valor={{
                              nombre: proyectoEnEdicion.nombre,
                              descripcion: proyectoEnEdicion.descripcion,
                              cursoId: proyectoEnEdicion.cursoId ?? "none",
                              fechaLimite: proyectoEnEdicion.fechaLimite,
                            }}
                            onChange={(valor) =>
                              setProyectoEnEdicion((actual) =>
                                actual
                                  ? {
                                      ...actual,
                                      nombre: valor.nombre,
                                      descripcion: valor.descripcion,
                                      cursoId: valor.cursoId === "none" ? undefined : valor.cursoId,
                                      fechaLimite: valor.fechaLimite,
                                    }
                                  : actual,
                              )
                            }
                            textoBoton="Guardar cambios"
                            disabled={!proyectoEnEdicion.nombre || !proyectoEnEdicion.fechaLimite}
                            onGuardar={() => {
                              if (!proyectoEnEdicion) return;
                              actualizarProyectoGrupal(proyectoEnEdicion.id, {
                                nombre: proyectoEnEdicion.nombre,
                                descripcion: proyectoEnEdicion.descripcion,
                                cursoId: proyectoEnEdicion.cursoId,
                                fechaLimite: proyectoEnEdicion.fechaLimite,
                              });
                              setProyectoEnEdicion(null);
                            }}
                          />
                        ) : null}
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar tablero
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar trabajo grupal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminara "{proyecto.nombre}" junto con sus integrantes y tareas. No se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => eliminarProyectoGrupal(proyecto.id)}
                          >
                            Eliminar tablero
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 lg:grid-cols-[1fr_auto_auto]">
                  <div>
                    <p className="text-sm font-semibold text-blue-950">Invitar por enlace o codigo</p>
                    <p className="mt-1 break-all text-sm text-blue-700">{obtenerEnlaceInvitacion(proyecto.codigoInvitacion)}</p>
                    {mensajeCopiado[proyecto.id] ? <p className="mt-2 text-xs font-medium text-blue-700">{mensajeCopiado[proyecto.id]}</p> : null}
                  </div>
                  <Button variant="outline" className="bg-white" onClick={() => copiar(proyecto.id, obtenerEnlaceInvitacion(proyecto.codigoInvitacion), "Enlace copiado")}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Copiar enlace
                  </Button>
                  <Button variant="outline" className="bg-white" onClick={() => copiar(proyecto.id, proyecto.codigoInvitacion, "Codigo copiado")}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar codigo
                  </Button>
                </div>

                <div className="grid gap-3 lg:grid-cols-[1fr_1fr_190px_auto]">
                  <Input
                    placeholder="Agregar integrante"
                    value={nuevoIntegrante[proyecto.id] ?? ""}
                    onChange={(event) => setNuevoIntegrante({ ...nuevoIntegrante, [proyecto.id]: event.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder="Correo del integrante"
                    value={nuevoCorreoIntegrante[proyecto.id] ?? ""}
                    onChange={(event) => setNuevoCorreoIntegrante({ ...nuevoCorreoIntegrante, [proyecto.id]: event.target.value })}
                  />
                  <Select
                    value={nuevoRol[proyecto.id] ?? "editor"}
                    onValueChange={(rolPermiso: RolIntegranteProyecto) => setNuevoRol({ ...nuevoRol, [proyecto.id]: rolPermiso })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((rol) => (
                        <SelectItem key={rol.value} value={rol.value}>
                          {rol.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nombre = nuevoIntegrante[proyecto.id]?.trim();
                      if (!nombre) return;
                      const rolPermiso = nuevoRol[proyecto.id] ?? "editor";
                      agregarIntegranteProyectoGrupal(
                        proyecto.id,
                        nombre,
                        nuevoCorreoIntegrante[proyecto.id]?.trim() ?? "",
                        roles.find((rol) => rol.value === rolPermiso)?.label ?? "Integrante",
                        rolPermiso,
                      );
                      setNuevoIntegrante({ ...nuevoIntegrante, [proyecto.id]: "" });
                      setNuevoCorreoIntegrante({ ...nuevoCorreoIntegrante, [proyecto.id]: "" });
                    }}
                  >
                    Agregar integrante
                  </Button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {avancePorIntegrante.map(({ integrante, promedio }) => {
                    const tareasAsignadas = proyecto.tareas.filter((tarea) => tarea.responsableId === integrante.id).length;

                    return (
                      <div key={integrante.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{integrante.nombre}</p>
                          <p className="text-xs text-slate-500">{integrante.correo || "Sin correo"}</p>
                          <p className="text-xs text-slate-500">{promedio}% - {tareasAsignadas} tarea{tareasAsignadas === 1 ? "" : "s"}</p>
                        </div>
                        <Select
                          value={integrante.rolPermiso}
                          onValueChange={(rolPermiso: RolIntegranteProyecto) =>
                            actualizarIntegranteProyectoGrupal(integrante.id, {
                              rolPermiso,
                              rol: etiquetaRolPermiso(rolPermiso),
                            })
                          }
                        >
                          <SelectTrigger className="h-8 w-32 shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((rol) => (
                              <SelectItem key={rol.value} value={rol.value}>
                                {rol.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Quitar integrante</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se quitara "{integrante.nombre}" del trabajo grupal. Sus tareas asignadas quedaran sin responsable.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => eliminarIntegranteProyectoGrupal(integrante.id)}
                              >
                                Quitar integrante
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Activity className="h-4 w-4" />
                      <p className="text-sm font-semibold">Pulso operativo</p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sin responsable</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{tareasSinResponsable}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">En revisión</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{tareasEnRevision}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Próximas entregas</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{proximas.length}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {proximas.map((tarea) => {
                        const responsable = proyecto.integrantes.find((integrante) => integrante.id === tarea.responsableId);
                        return (
                          <div key={tarea.id} className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-700">
                            {tarea.titulo} · {formatearFechaCorta(tarea.fechaLimite)} · {responsable?.nombre ?? "Sin asignar"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <ShieldCheck className="h-4 w-4" />
                      <p className="text-sm font-semibold">Roles del tablero</p>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="font-medium text-slate-900">Admin:</span> organiza el tablero y coordina entregas.</div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="font-medium text-slate-900">Editor:</span> actualiza tareas y mueve el progreso.</div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="font-medium text-slate-900">Responsable:</span> lidera una parte concreta del trabajo.</div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="font-medium text-slate-900">Lector:</span> revisa el tablero sin cambiar la ejecución.</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-4">
                  {columnas.map((columna) => (
                    <div key={columna.estado} className="rounded-2xl bg-slate-50 p-3">
                      <p className="mb-3 text-sm font-bold text-slate-700">{columna.titulo}</p>
                      <div className="space-y-3">
                        {proyecto.tareas.filter((tarea) => tarea.estado === columna.estado).map((tarea) => {
                          const responsable = proyecto.integrantes.find((integrante) => integrante.id === tarea.responsableId);
                          return (
                            <div key={tarea.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold">{tarea.titulo}</p>
                                  {tarea.descripcion ? <p className="mt-1 text-xs text-gray-500">{tarea.descripcion}</p> : null}
                                </div>
                                <Badge
                                  className={
                                    tarea.prioridad === "high"
                                      ? "bg-red-50 text-red-600"
                                      : tarea.prioridad === "medium"
                                        ? "bg-yellow-50 text-yellow-700"
                                        : "bg-slate-100 text-slate-600"
                                  }
                                >
                                  {tarea.prioridad === "high" ? "Alta" : tarea.prioridad === "medium" ? "Media" : "Baja"}
                                </Badge>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">Responsable: {responsable?.nombre ?? "Sin asignar"}</p>
                              <p className="mt-1 text-xs text-gray-500">Vence {formatearFechaCorta(tarea.fechaLimite)}</p>
                              <div className="mt-3">
                                <Progress value={tarea.progreso} />
                              </div>
                              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setTareaEnEdicion(tarea)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar tarea
                              </Button>
                              <Select
                                value={tarea.estado}
                                onValueChange={(estado: EstadoTareaGrupal) =>
                                  actualizarTareaProyectoGrupal(tarea.id, {
                                    estado,
                                    progreso: estado === "finalizado" ? 100 : tarea.progreso,
                                  })
                                }
                              >
                                <SelectTrigger className="mt-3 h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {columnas.map((item) => (
                                    <SelectItem key={item.estado} value={item.estado}>
                                      {item.titulo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
                                <div>
                                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Checklist
                                  </div>
                                  <div className="space-y-2">
                                    {tarea.checklist.map((item) => (
                                      <button
                                        key={item.id}
                                        type="button"
                                        className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-2 py-2 text-left text-xs text-slate-700"
                                        onClick={() => alternarChecklistTareaGrupal(item.id, !item.completado)}
                                      >
                                        {item.completado ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
                                        <span className={item.completado ? "line-through text-slate-400" : ""}>{item.titulo}</span>
                                      </button>
                                    ))}
                                  </div>
                                  <div className="mt-2 flex gap-2">
                                    <Input
                                      className="h-8 text-xs"
                                      placeholder="Nuevo item"
                                      value={nuevoChecklist[tarea.id] ?? ""}
                                      onChange={(event) => setNuevoChecklist({ ...nuevoChecklist, [tarea.id]: event.target.value })}
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const titulo = nuevoChecklist[tarea.id]?.trim();
                                        if (!titulo) return;
                                        agregarChecklistTareaGrupal(tarea.id, titulo);
                                        setNuevoChecklist({ ...nuevoChecklist, [tarea.id]: "" });
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
                                    <MessageCircle className="h-4 w-4" />
                                    Comentarios
                                  </div>
                                  <div className="space-y-2">
                                    {tarea.comentarios.slice(-2).map((comentario) => (
                                      <div key={comentario.id} className="rounded-lg bg-blue-50 px-2 py-2 text-xs text-blue-900">
                                        <span className="font-semibold">{comentario.autor}:</span> {comentario.comentario}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-2 flex gap-2">
                                    <Input
                                      className="h-8 text-xs"
                                      placeholder="Comentar avance"
                                      value={nuevoComentario[tarea.id] ?? ""}
                                      onChange={(event) => setNuevoComentario({ ...nuevoComentario, [tarea.id]: event.target.value })}
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const comentario = nuevoComentario[tarea.id]?.trim();
                                        if (!comentario) return;
                                        comentarTareaProyectoGrupal(tarea.id, comentario, usuarioActual?.nombres || "Equipo");
                                        setNuevoComentario({ ...nuevoComentario, [tarea.id]: "" });
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_180px_150px_180px_auto]">
                  <Input
                    placeholder="Nueva tarea del equipo"
                    value={nuevaTarea[`${proyecto.id}-titulo`] ?? ""}
                    onChange={(event) => setNuevaTarea({ ...nuevaTarea, [`${proyecto.id}-titulo`]: event.target.value })}
                  />
                  <Select onValueChange={(responsableId) => setNuevaTarea({ ...nuevaTarea, [`${proyecto.id}-responsable`]: responsableId })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {proyecto.integrantes.map((integrante) => (
                        <SelectItem key={integrante.id} value={integrante.id}>
                          {integrante.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={nuevaTarea[`${proyecto.id}-prioridad`] ?? "medium"}
                    onValueChange={(prioridad) => setNuevaTarea({ ...nuevaTarea, [`${proyecto.id}-prioridad`]: prioridad })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={nuevaTarea[`${proyecto.id}-fecha`] ?? ""}
                    onChange={(event) => setNuevaTarea({ ...nuevaTarea, [`${proyecto.id}-fecha`]: event.target.value })}
                  />
                  <Button
                    onClick={() => {
                      const titulo = nuevaTarea[`${proyecto.id}-titulo`]?.trim();
                      const fecha = nuevaTarea[`${proyecto.id}-fecha`];
                      if (!titulo || !fecha) return;
                      agregarTareaProyectoGrupal(
                        proyecto.id,
                        titulo,
                        fecha,
                        nuevaTarea[`${proyecto.id}-responsable`],
                        nuevaTarea[`${proyecto.id}-descripcion`] ?? "",
                        (nuevaTarea[`${proyecto.id}-prioridad`] as Prioridad) || "medium",
                      );
                      setNuevaTarea({
                        ...nuevaTarea,
                        [`${proyecto.id}-titulo`]: "",
                        [`${proyecto.id}-descripcion`]: "",
                        [`${proyecto.id}-fecha`]: "",
                      });
                    }}
                  >
                    Agregar
                  </Button>
                </div>
                <Textarea
                  placeholder="Descripcion breve de la tarea grupal"
                  value={nuevaTarea[`${proyecto.id}-descripcion`] ?? ""}
                  onChange={(event) => setNuevaTarea({ ...nuevaTarea, [`${proyecto.id}-descripcion`]: event.target.value })}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function FormularioTrabajoGrupal({
  cursos,
  valor,
  onChange,
  onGuardar,
  textoBoton,
  disabled = false,
}: {
  cursos: Array<{ id: string; nombre: string }>;
  valor: {
    nombre: string;
    descripcion: string;
    cursoId: string;
    fechaLimite: string;
  };
  onChange: (valor: {
    nombre: string;
    descripcion: string;
    cursoId: string;
    fechaLimite: string;
  }) => void;
  onGuardar: () => void;
  textoBoton: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Nombre</Label>
        <Input className="mt-2" value={valor.nombre} onChange={(event) => onChange({ ...valor, nombre: event.target.value })} />
      </div>
      <div>
        <Label>Curso asociado</Label>
        <Select value={valor.cursoId} onValueChange={(cursoId) => onChange({ ...valor, cursoId })}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin curso</SelectItem>
            {cursos.map((curso) => (
              <SelectItem key={curso.id} value={curso.id}>
                {curso.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Fecha limite</Label>
        <Input type="date" className="mt-2" value={valor.fechaLimite} onChange={(event) => onChange({ ...valor, fechaLimite: event.target.value })} />
      </div>
      <div>
        <Label>Descripcion</Label>
        <Textarea className="mt-2" value={valor.descripcion} onChange={(event) => onChange({ ...valor, descripcion: event.target.value })} />
      </div>
      <Button className="w-full" onClick={onGuardar} disabled={disabled}>
        {textoBoton}
      </Button>
    </div>
  );
}

function FormularioTareaGrupal({
  integrantes,
  valor,
  onChange,
  onGuardar,
  textoBoton,
  disabled = false,
}: {
  integrantes: Array<{ id: string; nombre: string }>;
  valor: {
    titulo: string;
    descripcion: string;
    responsableId: string;
    fechaLimite: string;
    prioridad: Prioridad;
    progreso: number;
  };
  onChange: (valor: {
    titulo: string;
    descripcion: string;
    responsableId: string;
    fechaLimite: string;
    prioridad: Prioridad;
    progreso: number;
  }) => void;
  onGuardar: () => void;
  textoBoton: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Titulo</Label>
        <Input className="mt-2" value={valor.titulo} onChange={(event) => onChange({ ...valor, titulo: event.target.value })} />
      </div>
      <div>
        <Label>Descripcion</Label>
        <Textarea className="mt-2" value={valor.descripcion} onChange={(event) => onChange({ ...valor, descripcion: event.target.value })} />
      </div>
      <div>
        <Label>Responsable</Label>
        <Select value={valor.responsableId} onValueChange={(responsableId) => onChange({ ...valor, responsableId })}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin responsable</SelectItem>
            {integrantes.map((integrante) => (
              <SelectItem key={integrante.id} value={integrante.id}>
                {integrante.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Fecha limite</Label>
          <Input type="date" className="mt-2" value={valor.fechaLimite} onChange={(event) => onChange({ ...valor, fechaLimite: event.target.value })} />
        </div>
        <div>
          <Label>Prioridad</Label>
          <Select value={valor.prioridad} onValueChange={(prioridad: Prioridad) => onChange({ ...valor, prioridad })}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Avance (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            className="mt-2"
            value={valor.progreso}
            onChange={(event) => onChange({ ...valor, progreso: Number(event.target.value) })}
          />
        </div>
      </div>
      <Button className="w-full" onClick={onGuardar} disabled={disabled}>
        {textoBoton}
      </Button>
    </div>
  );
}
