import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { OBJETIVOS_ACADEMICOS } from "../data/plan-rules";
import { useStudyFlow, type PerfilUsuario } from "../data/studyflow-store";
import DashboardHeader from "./DashboardHeader";
import MobileBottomNav from "./MobileBottomNav";
import Sidebar from "./Sidebar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

function requierePreferenciasIniciales(usuario: PerfilUsuario | null) {
  return !usuario?.metas?.trim() || usuario.metas.trim().toLowerCase() === "por definir";
}

export default function DashboardLayout() {
  const { usuarioActual, requiereCompletarPerfilAcademico, actualizarPerfil } = useStudyFlow();
  const [preferencias, setPreferencias] = useState({
    objetivoAcademico: usuarioActual?.objetivoAcademico ?? "aprobar_cursos",
    horasDisponibles: usuarioActual?.horasDisponibles ?? "4-6",
    metodoEstudio: usuarioActual?.metodoEstudio ?? "pomodoro",
    tonoAsistente: usuarioActual?.tonoAsistente ?? "responsable",
    metas: usuarioActual?.metas ?? "",
  });

  useEffect(() => {
    if (!usuarioActual) return;
    setPreferencias({
      objetivoAcademico: usuarioActual.objetivoAcademico,
      horasDisponibles: usuarioActual.horasDisponibles,
      metodoEstudio: usuarioActual.metodoEstudio,
      tonoAsistente: usuarioActual.tonoAsistente,
      metas: usuarioActual.metas,
    });
  }, [usuarioActual]);

  if (!usuarioActual) {
    return <Navigate to="/login" replace />;
  }

  if (requiereCompletarPerfilAcademico) {
    return <Navigate to="/complete-profile" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="lg:ml-64">
        <DashboardHeader />
        <main className="p-4 pb-28 pt-24 lg:p-8 lg:pb-8 lg:pt-24">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
      <Dialog open={requierePreferenciasIniciales(usuarioActual)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Personaliza tu estudio</DialogTitle>
            <DialogDescription>
              Elige unas preferencias iniciales para priorizar mejor tus tareas, recomendaciones y horarios.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>Objetivo academico</Label>
              <Select
                value={preferencias.objetivoAcademico}
                onValueChange={(objetivoAcademico: PerfilUsuario["objetivoAcademico"]) =>
                  setPreferencias((actual) => ({ ...actual, objetivoAcademico }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBJETIVOS_ACADEMICOS.map((objetivo) => (
                    <SelectItem key={objetivo.valor} value={objetivo.valor}>
                      {objetivo.etiqueta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Metodo de estudio</Label>
              <Select
                value={preferencias.metodoEstudio}
                onValueChange={(metodoEstudio) => setPreferencias((actual) => ({ ...actual, metodoEstudio }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pomodoro">Pomodoro</SelectItem>
                  <SelectItem value="bloques-profundos">Bloques profundos</SelectItem>
                  <SelectItem value="repaso-espaciado">Repaso espaciado</SelectItem>
                  <SelectItem value="mixto">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Horas disponibles al dia</Label>
              <Select
                value={preferencias.horasDisponibles}
                onValueChange={(horasDisponibles) => setPreferencias((actual) => ({ ...actual, horasDisponibles }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-4">2-4 horas</SelectItem>
                  <SelectItem value="4-6">4-6 horas</SelectItem>
                  <SelectItem value="6-8">6-8 horas</SelectItem>
                  <SelectItem value="8+">8+ horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tono del asistente</Label>
              <Select
                value={preferencias.tonoAsistente}
                onValueChange={(tonoAsistente: PerfilUsuario["tonoAsistente"]) =>
                  setPreferencias((actual) => ({ ...actual, tonoAsistente }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amigable">Amigable</SelectItem>
                  <SelectItem value="responsable">Responsable</SelectItem>
                  <SelectItem value="frio">Frio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prioridad-inicial">Prioridad inicial</Label>
              <Input
                id="prioridad-inicial"
                className="mt-2"
                value={preferencias.metas}
                onChange={(event) => setPreferencias((actual) => ({ ...actual, metas: event.target.value }))}
                placeholder="Ej. organizar entregas y aprobar mis cursos"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full sm:w-auto"
              disabled={!preferencias.metas.trim()}
              onClick={() => {
                actualizarPerfil({
                  objetivoAcademico: preferencias.objetivoAcademico,
                  horasDisponibles: preferencias.horasDisponibles,
                  metodoEstudio: preferencias.metodoEstudio,
                  tonoAsistente: preferencias.tonoAsistente,
                  metas: preferencias.metas.trim(),
                });
              }}
            >
              Guardar preferencias
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
