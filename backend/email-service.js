const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "StudyFlow AI <onboarding@resend.dev>";
const appPublicUrl = (process.env.APP_PUBLIC_URL || "http://localhost:5173").replace(/\/$/, "");

function escapeHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function construirUrlVerificacionCorreo(token) {
  return `${appPublicUrl}/verify-email?token=${encodeURIComponent(token)}`;
}

export async function enviarCorreo({ para, asunto, html, texto }) {
  if (!resendApiKey) {
    console.warn("[email] RESEND_API_KEY no configurada. No se envio el correo.");
    return { ok: false, omitido: true, motivo: "RESEND_API_KEY no configurada" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [para],
      subject: asunto,
      html,
      text: texto,
    }),
  });

  if (!response.ok) {
    const detalle = await response.text();
    throw new Error(detalle || `Resend respondio con HTTP ${response.status}`);
  }

  return { ok: true };
}

export function construirCorreoVerificacion({ nombres, token, tipo = "registro" }) {
  const url = construirUrlVerificacionCorreo(token);
  const nombre = escapeHtml(nombres || "estudiante");
  const esReenvio = tipo === "reenvio";
  const asunto = esReenvio
    ? "Nuevo enlace de verificacion para StudyFlow AI"
    : "Verifica tu correo en StudyFlow AI";
  const titulo = esReenvio ? "Nuevo enlace de verificacion" : "Verifica tu correo";
  const mensaje = esReenvio
    ? "Solicitaste un nuevo enlace para verificar tu correo en StudyFlow AI. Usa este enlace actualizado para completar la verificacion."
    : "Confirma que este correo te pertenece para activar avisos por email en StudyFlow AI.";
  const texto = esReenvio
    ? `Hola ${nombres || "estudiante"}, solicitaste un nuevo enlace de verificacion. Entra aqui para confirmar tu correo: ${url}`
    : `Hola ${nombres || "estudiante"}, confirma tu correo entrando a este enlace: ${url}`;
  const textoBoton = esReenvio ? "Usar nuevo enlace" : "Verificar correo";
  const nota = esReenvio
    ? "Si no pediste reenviar este enlace, puedes ignorar este mensaje."
    : "Si no creaste esta cuenta, puedes ignorar este mensaje.";

  return {
    asunto,
    texto,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
        <h1 style="font-size: 24px; margin-bottom: 12px;">${titulo}</h1>
        <p>Hola ${nombre}, ${mensaje}</p>
        <p style="margin: 28px 0;">
          <a href="${url}" style="background: #2563eb; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 700;">
            ${textoBoton}
          </a>
        </p>
        <p style="font-size: 13px; color: #475569;">${nota}</p>
      </div>
    `,
  };
}

export function construirCorreoBienvenida({ nombres }) {
  const nombre = escapeHtml(nombres || "estudiante");

  return {
    asunto: "Bienvenido a StudyFlow AI",
    texto: `Hola ${nombres || "estudiante"}, tu cuenta de StudyFlow AI ya esta lista. Puedes empezar a organizar tus cursos, tareas, examenes y horarios.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
        <h1 style="font-size: 24px; margin-bottom: 12px;">Bienvenido a StudyFlow AI</h1>
        <p>Hola ${nombre}, tu cuenta ya esta lista.</p>
        <p>Puedes empezar a organizar tus cursos, tareas, examenes y horarios desde tu panel academico.</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 28px;">Puedes controlar las notificaciones por correo desde Configuracion.</p>
      </div>
    `,
  };
}

export function construirCorreoNotificacion({ titulo, mensaje }) {
  const tituloSeguro = escapeHtml(titulo);
  const mensajeSeguro = escapeHtml(mensaje);

  return {
    asunto: `StudyFlow AI: ${titulo}`,
    texto: `${titulo}\n\n${mensaje}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
        <h1 style="font-size: 22px; margin-bottom: 12px;">${tituloSeguro}</h1>
        <p style="line-height: 1.55;">${mensajeSeguro}</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 28px;">Recibiste este aviso porque activaste notificaciones por correo en StudyFlow AI.</p>
      </div>
    `,
  };
}
