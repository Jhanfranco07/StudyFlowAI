import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, Plus, Sparkles } from "lucide-react";
import { canUseLongProjects, obtenerMensajeRecomendacionPlan } from "../data/plan-rules";
import { formatearFechaCorta, useStudyFlow, type FaseProyectoLargo, type TipoProyectoLargo } from "../data/studyflow-store";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

const tipos: Array<{ value: TipoProyectoLargo; label: string }> = [
  { value: "tesis", label: "Tesis" },
  { value: "proyecto_final", label: "Proyecto final" },
  { value: "investigacion", label: "Investigacion" },
  { value: "articulo", label: "Articulo" },
  { value: "exposicion_grande", label: "Exposicion grande" },
  { value: "caso_negocio", label: "Caso de negocio" },
  { value: "otro", label: "Otro" },
];

const fases: Array<{ value: FaseProyectoLargo; label: string }> = [
  { value: "investigacion", label: "Investigacion" },
  { value: "estructura", label: "Estructura" },
  { value: "redaccion", label: "Redaccion" },
  { value: "revision", label: "Revision" },
  { value: "entrega", label: "Entrega" },
];

export default function Projects() {
  const {
    usuarioActual,
    cursos,
    proyectosLargos,
    agregarProyectoLargo,
    agregarPasoProyectoLargo,
    alternarPasoProyectoLargo,
  } = useStudyFlow();
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "tesis" as TipoProyectoLargo,
    cursoId: "none",
    fechaLimite: "",
  });
  const [pasos, setPasos] = useState<Record<string, string>>({});
  const puedeUsar = canUseLongProjects(usuarioActual);
  const recomendacion = obtenerMensajeRecomendacionPlan(usuarioActual);
  const proyectoEnRiesgo = useMemo(
    () => proyectosLargos.find((proyecto) => proyecto.progreso < 45),
    [proyectosLargos],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Tesis y proyectos</h1>
          <p className="max-w-2xl text-sm text-gray-600 sm:text-base">
            Divide entregables largos en fases, pasos pequeños y micro-avances sostenibles.
          </p>
        </div>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="mr-2 h-4 w-4" />
              Crear proyecto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear proyecto largo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Titulo</Label>
                <Input className="mt-2" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(tipo: TipoProyectoLargo) => setForm({ ...form, tipo })}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>{tipos.map((tipo) => <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Curso asociado</Label>
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
                onClick={() => {
                  agregarProyectoLargo({ ...form, cursoId: form.cursoId === "none" ? undefined : form.cursoId });
                  setForm({ titulo: "", descripcion: "", tipo: "tesis", cursoId: "none", fechaLimite: "" });
                  setDialogoAbierto(false);
                }}
                disabled={!form.titulo || !form.fechaLimite || !puedeUsar}
              >
                Guardar proyecto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {recomendacion ? (
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="flex gap-3 p-5 text-blue-900">
            <Sparkles className="mt-0.5 h-5 w-5" />
            <p className="text-sm">{recomendacion}</p>
          </CardContent>
        </Card>
      ) : null}

      {!puedeUsar ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex gap-3 p-5 text-amber-800">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <p className="text-sm">Vista previa disponible. Para gestionar proyectos largos con pasos y seguimiento, usa Premium o Premium Plus.</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-none shadow-lg">
          <CardHeader><CardTitle>Proyecto en riesgo</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{proyectoEnRiesgo?.titulo ?? "Sin riesgo alto"}</p>
            <p className="mt-2 text-sm text-gray-600">
              {proyectoEnRiesgo ? "No dejes que se enfrie. Agenda un paso pequeño esta semana." : "Tus proyectos avanzan de forma estable."}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg lg:col-span-2">
          <CardHeader><CardTitle>Sugerencia IA</CardTitle></CardHeader>
          <CardContent className="text-sm text-gray-700">
            Si tienes poco tiempo, convierte una fase grande en una accion de 20 minutos: revisar fuentes, redactar un parrafo o ordenar conclusiones.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {proyectosLargos.map((proyecto) => {
          const curso = cursos.find((item) => item.id === proyecto.cursoId);
          const siguientePaso = proyecto.pasos.find((paso) => !paso.completado);
          return (
            <Card key={proyecto.id} className="border-none shadow-lg">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{proyecto.titulo}</CardTitle>
                    <p className="mt-1 text-sm text-gray-600">{curso?.nombre ?? "Proyecto transversal"} · {formatearFechaCorta(proyecto.fechaLimite)}</p>
                  </div>
                  <Badge>{tipos.find((tipo) => tipo.value === proyecto.tipo)?.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-gray-600">{proyecto.descripcion}</p>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Avance</span>
                    <span className="font-semibold">{proyecto.progreso}%</span>
                  </div>
                  <Progress value={proyecto.progreso} />
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <span className="font-semibold">Siguiente paso recomendado:</span>{" "}
                  {siguientePaso?.titulo ?? "Define el siguiente paso pequeño para no perder ritmo."}
                </div>
                <div className="space-y-3">
                  {proyecto.pasos.map((paso) => (
                    <button
                      key={paso.id}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm"
                      onClick={() => alternarPasoProyectoLargo(paso.id, !paso.completado)}
                    >
                      <CheckCircle2 className={`h-5 w-5 ${paso.completado ? "text-emerald-600" : "text-slate-300"}`} />
                      <span className={paso.completado ? "line-through text-slate-400" : "text-slate-700"}>{paso.titulo}</span>
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
                  <Input
                    placeholder="Agregar paso pequeño"
                    value={pasos[proyecto.id] ?? ""}
                    onChange={(event) => setPasos({ ...pasos, [proyecto.id]: event.target.value })}
                  />
                  <Select defaultValue="investigacion" onValueChange={(fase) => setPasos({ ...pasos, [`${proyecto.id}-fase`]: fase })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{fases.map((fase) => <SelectItem key={fase.value} value={fase.value}>{fase.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const titulo = pasos[proyecto.id]?.trim();
                      if (!titulo) return;
                      agregarPasoProyectoLargo(proyecto.id, titulo, (pasos[`${proyecto.id}-fase`] as FaseProyectoLargo) || "investigacion");
                      setPasos({ ...pasos, [proyecto.id]: "" });
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
