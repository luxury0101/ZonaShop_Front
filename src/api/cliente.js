const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(
    `${API_BASE_URL}${ruta}`,
    {
      headers: {
        Accept: "application/json",
        ...opciones.headers,
      },
      ...opciones,
    },
  );

  if (!respuesta.ok) {
    throw new Error(
      `La API respondió con el código ${respuesta.status}`,
    );
  }

  return respuesta.json();
}