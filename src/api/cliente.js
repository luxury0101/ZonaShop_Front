// En producción usamos el proxy /api del mismo dominio. Además de simplificar
// CORS, esto evita que Safari trate las cookies de sesión y CSRF como cookies
// de terceros entre dos proyectos diferentes de Vercel.
const API_URL = import.meta.env.PROD
  ? ""
  : (
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000"
  )
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

const METODOS_SEGUROS = [
  "GET",
  "HEAD",
  "OPTIONS",
];


async function obtenerTokenCsrf() {
  const respuesta = await fetch(
    `${API_URL}/api/auth/csrf/`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!respuesta.ok) {
    throw new Error(
      "No se pudo obtener el token de seguridad.",
    );
  }

  const datos = await respuesta.json();

  if (!datos.csrfToken) {
    throw new Error(
      "El backend no devolvió el token CSRF.",
    );
  }

  return datos.csrfToken;
}


async function leerRespuesta(respuesta) {
  const tipoContenido =
    respuesta.headers.get("content-type") || "";

  if (tipoContenido.includes("application/json")) {
    return respuesta.json();
  }

  const texto = await respuesta.text();

  if (tipoContenido.includes("text/html")) {
    return {
      detail: "No fue posible completar la solicitud. Actualiza la página e inténtalo nuevamente.",
    };
  }

  return texto ? { detail: texto } : null;
}


function obtenerMensajeError(datos, estado) {
  if (typeof datos?.detail === "string") {
    return datos.detail;
  }

  if (datos && typeof datos === "object") {
    const mensajes = Object.values(datos)
      .flatMap((valor) => Array.isArray(valor) ? valor : [valor])
      .filter((valor) => typeof valor === "string");

    if (mensajes.length > 0) {
      return mensajes.join(" ");
    }
  }

  return `Error HTTP ${estado}`;
}


export async function clienteApi(
  ruta,
  opciones = {},
) {
  const metodo = (
    opciones.method || "GET"
  ).toUpperCase();

  const headers = {
    Accept: "application/json",
    ...opciones.headers,
  };

  const esFormData =
    opciones.body instanceof FormData;

  if (opciones.body && !esFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (!METODOS_SEGUROS.includes(metodo)) {
    const tokenCsrf = await obtenerTokenCsrf();

    headers["X-CSRFToken"] = tokenCsrf;
  }

  const respuesta = await fetch(
    `${API_URL}${ruta}`,
    {
      ...opciones,
      method: metodo,
      credentials: "include",
      headers,
    },
  );

  const datos = await leerRespuesta(respuesta);

  if (!respuesta.ok) {
    const mensaje = obtenerMensajeError(datos, respuesta.status);

    const error = new Error(mensaje);

    error.status = respuesta.status;
    error.datos = datos;

    throw error;
  }

  return datos;
}

export function solicitar(ruta, opciones = {}) {
  let rutaCompleta = ruta;

  if (!ruta.startsWith("/")) {
    rutaCompleta = `/${ruta}`;
  }

  if (!rutaCompleta.startsWith("/api/")) {
    rutaCompleta = `/api${rutaCompleta}`;
  }

  return clienteApi(rutaCompleta, opciones);
}
