import { solicitar } from "./cliente.js";


export function obtenerCategorias() {
  return solicitar("/categorias/");
}


export function obtenerProductos({
  categoria = "",
  busqueda = "",
} = {}) {
  const parametros = new URLSearchParams();

  if (categoria) {
    parametros.set("categoria", categoria);
  }

  if (busqueda.trim()) {
    parametros.set("buscar", busqueda.trim());
  }

  const consulta = parametros.toString();

  const ruta = consulta
    ? `/productos/?${consulta}`
    : "/productos/";

  return solicitar(ruta);
}