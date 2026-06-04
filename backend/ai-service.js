import OpenAI from "openai";

const proveedorIA = (process.env.AI_PROVIDER || "openai").toLowerCase();
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const clienteOpenAI = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
const clienteGroq = groqApiKey
  ? new OpenAI({
      apiKey: groqApiKey,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

export function obtenerProveedorIAActivo() {
  if (proveedorIA === "groq") return "groq";
  return "openai";
}

export function obtenerModeloIAActivo() {
  return obtenerProveedorIAActivo() === "groq" ? groqModel : openaiModel;
}

export function hayClienteIAConfigurado() {
  return obtenerProveedorIAActivo() === "groq" ? Boolean(clienteGroq) : Boolean(clienteOpenAI);
}

export async function generarRespuestaProveedorIA({ instrucciones, mensajes, timeoutMs = 18000 }) {
  const proveedor = obtenerProveedorIAActivo();
  const promesa =
    proveedor === "groq"
      ? generarConGroq({ instrucciones, mensajes })
      : generarConOpenAI({ instrucciones, mensajes });

  return Promise.race([
    promesa,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${proveedor} supero el tiempo limite`)), timeoutMs),
    ),
  ]);
}

async function generarConOpenAI({ instrucciones, mensajes }) {
  if (!clienteOpenAI) {
    throw new Error("OPENAI_API_KEY no configurada");
  }

  const input = [
    {
      role: "system",
      content: instrucciones,
    },
    ...mensajes.map((mensaje) => ({
      role: mensaje.role,
      content: mensaje.content,
    })),
  ];

  const response = await clienteOpenAI.responses.create({
    model: openaiModel,
    input,
    max_output_tokens: 900,
  });

  const texto = response.output_text?.trim();
  if (!texto) {
    throw new Error("OpenAI devolvio una respuesta vacia");
  }

  return {
    texto,
    fuente: "openai",
  };
}

async function generarConGroq({ instrucciones, mensajes }) {
  if (!clienteGroq) {
    throw new Error("GROQ_API_KEY no configurada");
  }

  const completion = await clienteGroq.chat.completions.create({
    model: groqModel,
    messages: [
      { role: "system", content: instrucciones },
      ...mensajes,
    ],
    temperature: 0.45,
    max_tokens: 900,
  });

  const texto = completion.choices?.[0]?.message?.content?.trim();
  if (!texto) {
    throw new Error("Groq devolvio una respuesta vacia");
  }

  return {
    texto,
    fuente: "groq",
  };
}
