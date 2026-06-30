import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { GraduationCap, Lock, Mail, School, User } from "lucide-react";
import { useStudyFlow, type TipoPerfilUsuario } from "../data/studyflow-store";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { TIPOS_PERFIL, type PlanUsuario } from "../data/plan-rules";

type FormularioRegistro = {
  name: string;
  email: string;
  password: string;
  university: string;
  career: string;
  semester: string;
  plan: PlanUsuario;
  tipoPerfil: TipoPerfilUsuario;
};

function describirOnboardingPerfil(tipoPerfil: TipoPerfilUsuario) {
  if (tipoPerfil === "posgrado" || tipoPerfil === "segunda_especialidad") {
    return "Te prepararemos una experiencia pensada para trabajo, proyectos largos y estudio sostenido.";
  }

  if (tipoPerfil === "profesional_estudia" || tipoPerfil === "diplomado_maestria") {
    return "Vamos a priorizar disponibilidad real, micro-sesiones y equilibrio entre trabajo y estudio.";
  }

  if (tipoPerfil === "instituto") {
    return "Te ayudaremos a organizar cursos, entregas y evaluaciones con un ritmo más práctico y claro.";
  }

  return "Empezarás con una organización académica pensada para cursos, tareas, exámenes y progreso semanal.";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { registrarUsuario } = useStudyFlow();
  const etiquetasPlan = {
    gratis: "Gratis",
    estudiante: "Premium",
    premium: "Premium",
    premium_plus: "Premium Plus",
  } as const;
  const planInicial = (() => {
    const plan = searchParams.get("plan");
    return plan === "premium_plus" || plan === "premium" || plan === "estudiante" ? plan : "gratis";
  })();

  const [formData, setFormData] = useState<FormularioRegistro>({
    name: "",
    email: "",
    password: "",
    university: "",
    career: "",
    semester: "",
    plan: planInicial as PlanUsuario,
    tipoPerfil: "universitario" as const,
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setCargando(true);

    let success = false;
    try {
      success = await registrarUsuario({ ...formData, plan: "gratis" });
    } finally {
      setCargando(false);
    }

    if (!success) {
      setError("No pudimos crear la cuenta. Revisa si ese correo ya está registrado o intenta de nuevo.");
      return;
    }

    navigate(planInicial === "gratis" ? "/app" : `/checkout?plan=${planInicial}`);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-semibold text-transparent">
              StudyFlow AI
            </span>
          </Link>

          <h1 className="mb-2 text-3xl font-bold">Crea tu cuenta</h1>
          <p className="mb-2 text-gray-600">Empieza a organizar tu semestre desde hoy.</p>
          <p className="mb-8 text-sm text-gray-500">{describirOnboardingPerfil(formData.tipoPerfil)}</p>

          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-700">Plan seleccionado</p>
            <p className="mt-1 text-lg font-semibold text-blue-900">{etiquetasPlan[formData.plan]}</p>
            <p className="mt-1 text-sm text-blue-700">
              {formData.plan === "gratis"
                ? "No necesitas registrar ningún medio de pago."
                : "Crearás tu cuenta Gratis y luego podrás activar el plan seleccionado."}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <Label htmlFor="name">Nombres</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="name"
                  className="pl-10"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  placeholder="Jhan Perez"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  placeholder="tu@universidad.edu"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="university">Universidad</Label>
              <div className="relative mt-2">
                <School className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="university"
                  className="pl-10"
                  value={formData.university}
                  onChange={(event) => setFormData({ ...formData, university: event.target.value })}
                  placeholder="Universidad Nacional"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="career">Carrera</Label>
              <Input
                id="career"
                value={formData.career}
                onChange={(event) => setFormData({ ...formData, career: event.target.value })}
                placeholder="Ingeniería de Sistemas"
                required
              />
            </div>

            <div>
              <Label>Tipo de perfil</Label>
              <Select
                value={formData.tipoPerfil}
                onValueChange={(tipoPerfil: TipoPerfilUsuario) => setFormData({ ...formData, tipoPerfil })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecciona tu perfil" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPOS_PERFIL).map(([valor, etiqueta]) => (
                    <SelectItem key={valor} value={valor}>
                      {etiqueta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ciclo o semestre</Label>
              <Select
                value={formData.semester}
                onValueChange={(semester) => setFormData({ ...formData, semester })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecciona tu ciclo" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, index) => (
                    <SelectItem key={index + 1} value={`${index + 1}`}>
                      {index + 1} ciclo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta y continuar"}
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Ya tienes una cuenta?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white lg:flex lg:items-center lg:justify-center">
        <div className="max-w-lg">
          <h2 className="mb-6 text-4xl font-bold">Convierte el caos del semestre en un plan claro</h2>
          <div className="grid gap-4">
            {[
              "Dashboard con prioridades del día",
              "Cursos conectados con tareas y exámenes",
              "Planificador automático listo para IA",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
