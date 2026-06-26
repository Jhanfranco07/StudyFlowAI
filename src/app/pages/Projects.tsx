import { useMemo, useState } from "react";
import { CheckCircle2, LockKeyhole, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { TIPOS_PERFIL, canUseLongProjects, isPremiumPlus } from "../data/plan-rules";
import { formatearFechaCorta, useStudyFlow, type FaseProyectoLargo, type ProyectoLargo, type TipoProyectoLargo } from "../data/studyflow-store";
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
    actualizarProyectoLargo,
    eliminarProyectoLargo,
    agregarPasoProyectoLargo,
    alternarPasoProyectoLargo,
  } = useStudyFlow();
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [proyectoEnEdicion, setProyectoEnEdicion] = useState<ProyectoLargo | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "tesis" as TipoProyectoLargo,
    cursoId: "none",
    fechaLimite: "",
  });
  const [pasos, setPasos] = useState<Record<string, string>>({});
  const puedeUsar = canUseLongProjects(usuarioActual);
  const premiumPlusActivo = isPremiumPlus(usuarioActual);
  const proyectoEnRiesgo = useMemo(
    () => proyectosLargos.find((proyecto) => proyecto.progreso < 45),
    [proyectosLargos],
  );

  if (!puedeUsar) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Tesis y proyectos</h1>
          <p className="max-w-2xl text-sm text-gray-600 sm:text-base">
            Organiza tesis, investigaciones y proyectos largos por fases y avances.
          </p>
        </div>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col gap-4 p-6 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Funcion exclusiva de Premium Plus</p>
                <p className="mt-1 text-sm">
                  Premium Plus habilita tesis, proyectos largos, fases, pasos y seguimiento de avances.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/app/settings">Ver Premium Plus</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge className="bg-slate-100 text-slate-700">{premiumPlusActivo ? "Premium Plus" : "Plan actual"}</Badge>
            {usuarioActual?.tipoPerfil ? <Badge className="bg-blue-50 text-blue-700">{TIPOS_PERFIL[usuarioActual.tipoPerfil]}</Badge> : null}
          </div>
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
            <FormularioProyectoLargo
              cursos={cursos.map((curso) => ({ id: curso.id, nombre: curso.nombre }))}
              valor={form}
              onChange={setForm}
              textoBoton="Guardar proyecto"
              disabled={!form.titulo || !form.fechaLimite || !puedeUsar}
              onGuardar={() => {
                agregarProyectoLargo({ ...form, cursoId: form.cursoId === "none" ? undefined : form.cursoId });
                setForm({ titulo: "", descripcion: "", tipo: "tesis", cursoId: "none", fechaLimite: "" });
                setDialogoAbierto(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {proyectosLargos.length === 0 ? (
        <Card className="border-dashed border-slate-300 shadow-none">
          <CardContent className="space-y-3 p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Todavía no tienes proyectos largos activos.</p>
            <p>Crea una tesis, investigación o entregable grande para que el sistema detecte estancamiento y te sugiera el siguiente paso.</p>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{tipos.find((tipo) => tipo.value === proyecto.tipo)?.label}</Badge>
                    <Dialog
                      open={proyectoEnEdicion?.id === proyecto.id}
                      onOpenChange={(abierto) => !abierto && setProyectoEnEdicion(null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setProyectoEnEdicion(proyecto)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar proyecto largo</DialogTitle>
                        </DialogHeader>
                        {proyectoEnEdicion ? (
                          <FormularioProyectoLargo
                            cursos={cursos.map((curso) => ({ id: curso.id, nombre: curso.nombre }))}
                            valor={{
                              titulo: proyectoEnEdicion.titulo,
                              descripcion: proyectoEnEdicion.descripcion,
                              tipo: proyectoEnEdicion.tipo,
                              cursoId: proyectoEnEdicion.cursoId ?? "none",
                              fechaLimite: proyectoEnEdicion.fechaLimite,
                            }}
                            onChange={(valor) =>
                              setProyectoEnEdicion((actual) =>
                                actual
                                  ? {
                                      ...actual,
                                      titulo: valor.titulo,
                                      descripcion: valor.descripcion,
                                      tipo: valor.tipo,
                                      cursoId: valor.cursoId === "none" ? undefined : valor.cursoId,
                                      fechaLimite: valor.fechaLimite,
                                    }
                                  : actual,
                              )
                            }
                            textoBoton="Guardar cambios"
                            onGuardar={() => {
                              if (!proyectoEnEdicion) return;
                              actualizarProyectoLargo(proyectoEnEdicion.id, {
                                titulo: proyectoEnEdicion.titulo,
                                descripcion: proyectoEnEdicion.descripcion,
                                tipo: proyectoEnEdicion.tipo,
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
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar proyecto largo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminara "{proyecto.titulo}" junto con sus fases y pasos. No se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => eliminarProyectoLargo(proyecto.id)}
                          >
                            Eliminar proyecto
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
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

function FormularioProyectoLargo({
  cursos,
  valor,
  onChange,
  onGuardar,
  textoBoton,
  disabled = false,
}: {
  cursos: Array<{ id: string; nombre: string }>;
  valor: {
    titulo: string;
    descripcion: string;
    tipo: TipoProyectoLargo;
    cursoId: string;
    fechaLimite: string;
  };
  onChange: (valor: {
    titulo: string;
    descripcion: string;
    tipo: TipoProyectoLargo;
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
        <Label>Titulo</Label>
        <Input className="mt-2" value={valor.titulo} onChange={(event) => onChange({ ...valor, titulo: event.target.value })} />
      </div>
      <div>
        <Label>Tipo</Label>
        <Select value={valor.tipo} onValueChange={(tipo: TipoProyectoLargo) => onChange({ ...valor, tipo })}>
          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
          <SelectContent>{tipos.map((tipo) => <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>Curso asociado</Label>
        <Select value={valor.cursoId} onValueChange={(cursoId) => onChange({ ...valor, cursoId })}>
          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin curso</SelectItem>
            {cursos.map((curso) => <SelectItem key={curso.id} value={curso.id}>{curso.nombre}</SelectItem>)}
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
