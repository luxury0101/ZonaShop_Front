export function crearSlug(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


export function crearRutaCategoria(categoria) {
  const id = Number(categoria?.id);
  const slug = crearSlug(categoria?.nombre) || "categoria";
  return `/categoria/${Number.isInteger(id) && id > 0 ? `${id}-` : ""}${slug}`;
}


export function analizarRutaCatalogo(ruta = "/") {
  const normalizada = String(ruta).replace(/\/+$/, "") || "/";

  if (normalizada === "/") return { tipo: "inicio" };
  if (normalizada === "/productos") return { tipo: "productos" };

  const coincidencia = normalizada.match(/^\/categoria\/([^/]+)$/);
  if (!coincidencia) return { tipo: "otra" };

  const segmento = decodeURIComponent(coincidencia[1]);
  const coincidenciaId = segmento.match(/^(\d+)(?:-|$)/);
  const slug = segmento.replace(/^\d+-?/, "");

  return {
    tipo: "categoria",
    id: coincidenciaId ? Number(coincidenciaId[1]) : null,
    slug: crearSlug(slug),
  };
}


export function leerFiltrosBusqueda(busqueda = "") {
  const parametros = new URLSearchParams(busqueda);
  return {
    busqueda: parametros.get("buscar") || "",
    orden: parametros.get("orden") || "",
    talla: parametros.get("talla") || "",
  };
}


export function crearConsultaFiltros({ busqueda = "", orden = "", talla = "" } = {}) {
  const parametros = new URLSearchParams();
  if (String(busqueda).trim()) parametros.set("buscar", String(busqueda).trim());
  if (orden) parametros.set("orden", orden);
  if (talla) parametros.set("talla", talla);
  const consulta = parametros.toString();
  return consulta ? `?${consulta}` : "";
}
