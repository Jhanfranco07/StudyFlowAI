import { useMemo, useState } from "react";
import { Plus, UsersRound } from "lucide-react";
import { PLANES, canUseTeamProjectsAdvanced } from "../data/plan-rules";
import { formatearFechaCorta, useStudyFlow, type EstadoTareaGrupal } from "../data/studyflow-store";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
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

export default function TeamProjects() {
  const {
    usuarioActual,
    cursos,
    proyectosGrupales,
    agregarProyectoGrupal,
    agregarIntegranteProyectoGrupal,
    agregarTareaProyectoGrupal,
    actualizarTareaProyectoGrupal,
  } = useStudyFlow();
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", cursoId: "none", fechaLimite: "" });
  const [nuevoIntegrante, setNuevoIntegrante] = useState<Record<string, string>>({});
  const [nuevaTarea, setNuevaTarea] = useState<Record<string, string>>({});
  const puedeAvanzado = canUseTeamProjectsAdvanced(usuarioActual);
  const plan = PLANES[usuarioActual?.plan ?? "gratis"];

  const resumen = useMemo(() => {
    const totalTareas = proyectosGrupales.reduce((sum, proyecto) => sum + proyecto.tareas.length, 0);
    const finalizadas = proyectosGrupales.reduce(
      (sum, proyecto) => sum + proyecto.tareas.filter((tarea) => tarea.estado === "finalizado").length,
      0,
    );
    return {
      totalTareas,
      finalizadas,
      avance: totalTareas ? Math.round((finalizadas / totalTareas) * 100) : 0,
    };
  }, [proyectosGrupales]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Trabajos grupales</h1>
          <p className="max-w-2xl text-sm text-gray-600 sm:text-base">
            Coordina entregables, responsables y avance con un tablero academico tipo Kanban.
          </p>
        </div>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="mr-2 h-4 w-4" />
              Crear trabajo grupal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo trabajo grupal</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input className="mt-2" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
              </div>
              <div>
                <Label>Curso</Label>
                <Select value={form.cursoId} onValueChange={(cursoId) => setForm({ ...form, cursoId })}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin curso</SelectItem>
                    {cursos.map((curso) => <SelectItem key={curso.id} value={curso.id}>{curso.nombre}</SelectItem>)}
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
                disabled={!form.nombre || !form.fechaLimite}
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
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Plan activo</p>
            <p className="mt-1 text-2xl font-bold">{plan.etiqueta}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Trabajos activos</p>
            <p className="mt-1 text-2xl font-bold">{proyectosGrupales.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Avance global</p>
            <p className="mt-1 text-2xl font-bold">{resumen.avance}%</p>
          </CardContent>
        </Card>
      </div>

      {!puedeAvanzado ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5 text-sm text-amber-800">
            En Gratis puedes validar 1 proyecto grupal activo. Premium habilita mas tableros, responsables y seguimiento avanzado.
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
                      {curso?.nombre ?? "Proyecto transversal"} · vence {formatearFechaCorta(proyecto.fechaLimite)}
                    </p>
                  </div>
                  <div className="min-w-52">
                    <div className="mb-2 flex justify-between text-sm"><span>Avance</span><span>{avance}%</span></div>
                    <Progress value={avance} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                  <Input
                    placeholder="Agregar integrante"
                    value={nuevoIntegrante[proyecto.id] ?? ""}
                    onChange={(event) => setNuevoIntegrante({ ...nuevoIntegrante, [proyecto.id]: event.target.value })}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nombre = nuevoIntegrante[proyecto.id]?.trim();
                      if (!nombre) return;
                      agregarIntegranteProyectoGrupal(proyecto.id, nombre);
                      setNuevoIntegrante({ ...nuevoIntegrante, [proyecto.id]: "" });
                    }}
                  >
                    Agregar integrante
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {avancePorIntegrante.map(({ integrante, promedio }) => (
                    <Badge key={integrante.id} className="bg-blue-50 text-blue-700">
                      {integrante.nombre}: {promedio}%
                    </Badge>
                  ))}
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
                              <p className="font-semibold">{tarea.titulo}</p>
                              <p className="mt-2 text-xs text-gray-500">Responsable: {responsable?.nombre ?? "Sin asignar"}</p>
                              <p className="mt-1 text-xs text-gray-500">Vence {formatearFechaCorta(tarea.fechaLimite)}</p>
                              <div className="mt-3">
                                <Progress value={tarea.progreso} />
                              </div>
                              <Select
                                value={tarea.estado}
                                onValueChange={(estado: EstadoTareaGrupal) =>
                                  actualizarTareaProyectoGrupal(tarea.id, {
                                    estado,
                                    progreso: estado === "finalizado" ? 100 : tarea.progreso,
                                  })
                                }
                              >
                                <SelectTrigger className="mt-3 h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {columnas.map((item) => <SelectItem key={item.estado} value={item.estado}>{item.titulo}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
                  <Input
                    placeholder="Nueva tarea del equipo"
                    value={nuevaTarea[`${proyecto.id}-titulo`] ?? ""}
                    onChange={(event) => setNuevaTarea({ ...nuevaTarea, [`${proyecto.id}-titulo`]: event.target.value })}
                  />
                  <Select onValueChange={(responsableId) => setNuevaTarea({ ...nuevaTarea, [`${proyecto.id}-responsable`]: responsableId })}>
                    <SelectTrigger><SelectValue placeholder="Responsable" /></SelectTrigger>
                    <SelectContent>
                      {proyecto.integrantes.map((integrante) => <SelectItem key={integrante.id} value={integrante.id}>{integrante.nombre}</SelectItem>)}
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
                      agregarTareaProyectoGrupal(proyecto.id, titulo, fecha, nuevaTarea[`${proyecto.id}-responsable`]);
                      setNuevaTarea({ ...nuevaTarea, [`${proyecto.id}-titulo`]: "", [`${proyecto.id}-fecha`]: "" });
                    }}
                  >
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
