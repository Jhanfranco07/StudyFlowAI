import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle2, GraduationCap, ShieldCheck, WalletCards } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api, type ConfiguracionPagoApi, type PlanPago } from "../data/api";
import { useStudyFlow } from "../data/studyflow-store";
import { Button } from "../components/ui/button";
import LanguageToggle from "../components/LanguageToggle";

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuarioActual, sincronizarConBackend } = useStudyFlow();
  const plan = searchParams.get("plan") as PlanPago | null;
  const planValido = plan === "premium" || plan === "premium_plus";
  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");
  const estadoRetorno = searchParams.get("payment_status") || searchParams.get("status");
  const confirmacionIniciada = useRef<string | null>(null);
  const [configuracion, setConfiguracion] = useState<ConfiguracionPagoApi | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    api.obtenerConfiguracionMercadoPago().then(setConfiguracion).catch((fallo) => {
      setError(fallo instanceof Error ? fallo.message : "No se pudo cargar el pago.");
    });
  }, []);

  useEffect(() => {
    if (!usuarioActual || !paymentId || estadoRetorno !== "success") return;
    if (confirmacionIniciada.current === paymentId) return;
    confirmacionIniciada.current = paymentId;
    setCargando(true);
    setError("");

    api.confirmarPagoMercadoPago(usuarioActual.id, paymentId)
      .then(async (resultado) => {
        await sincronizarConBackend();
        setExito(resultado.mensaje);
      })
      .catch((fallo) => {
        setError(fallo instanceof Error ? fallo.message : "No se pudo confirmar el pago.");
      })
      .finally(() => setCargando(false));
  }, [estadoRetorno, paymentId, sincronizarConBackend, usuarioActual]);

  useEffect(() => {
    if (estadoRetorno === "failure") {
      setError("El pago fue rechazado o cancelado. Puedes intentarlo nuevamente.");
    } else if (estadoRetorno === "pending") {
      setError("El pago quedó pendiente y el plan todavía no fue activado.");
    }
  }, [estadoRetorno]);

  const datosPlan = useMemo(
    () => (planValido ? configuracion?.plans[plan] : null),
    [configuracion, plan, planValido],
  );

  if (!planValido) return <Navigate to="/" replace />;

  const abrirCheckout = async () => {
    if (!usuarioActual || !datosPlan || cargando) return;
    setError("");
    setCargando(true);

    try {
      const preferencia = await api.crearPreferenciaMercadoPago(usuarioActual.id, plan);
      window.location.assign(preferencia.sandboxInitPoint);
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : "No se pudo iniciar Mercado Pago.");
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" /> {t("common.backHome")}
          </Link>
          <LanguageToggle />
        </div>

        <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:grid-cols-[1fr_0.85fr]">
          <section className="p-6 sm:p-9">
            <div className="mb-7 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white">
                <GraduationCap className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold text-slate-950">StudyFlow AI</p>
                <p className="text-sm text-slate-500">{t("checkout.securePayment")}</p>
              </div>
            </div>

            <p className="text-sm font-semibold text-blue-600">{t("checkout.improvePlan")}</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">{t("checkout.activate", { plan: datosPlan?.nombre.replace("StudyFlow ", "") ?? "" })}</h1>
            <p className="mt-3 text-slate-600">{t("checkout.confirm")}</p>

            <div className="mt-8 space-y-4 text-sm text-slate-700">
              <p className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" /> {t("checkout.secureData")}</p>
              <p className="flex gap-3"><WalletCards className="h-5 w-5 shrink-0 text-blue-600" /> {t("checkout.privateFinancial")}</p>
              <p className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-violet-600" /> {t("checkout.automaticActivation")}</p>
            </div>
          </section>

          <aside className="border-t border-slate-200 bg-slate-50 p-6 sm:p-9 md:border-l md:border-t-0">
            <p className="text-sm text-slate-500">{t("checkout.total")}</p>
            <p className="mt-2 text-4xl font-bold text-slate-950">S/ {datosPlan ? (datosPlan.monto / 100).toFixed(2) : "--"}</p>
            <p className="mt-2 text-sm text-slate-500">{t("checkout.selectedPlan")}</p>

            {error ? <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            {exito ? <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{exito}</div> : null}

            {!usuarioActual ? (
              <div className="mt-8 space-y-3">
                <Button asChild className="w-full"><Link to={`/login?plan=${plan}`}>{t("checkout.loginToPay")}</Link></Button>
                <Button asChild variant="outline" className="w-full"><Link to={`/register?plan=${plan}`}>{t("checkout.createAccount")}</Link></Button>
              </div>
            ) : exito ? (
              <Button className="mt-8 w-full" onClick={() => navigate("/app")}>{t("checkout.dashboard")}</Button>
            ) : (
              <Button className="mt-8 w-full bg-[#009ee3] hover:bg-[#008ed0]" disabled={!datosPlan || cargando} onClick={abrirCheckout}>
                {cargando ? t("checkout.validating") : t("checkout.pay")}
              </Button>
            )}

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">{t("checkout.redirect")}</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
