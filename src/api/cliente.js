const API_URL = "http://localhost:8000";

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

  return texto ? { detail: texto } : null;
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
    const mensaje =
      datos?.detail ||
      datos?.mensaje ||
      `Error HTTP ${respuesta.status}`;

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