import { solicitar } from "./cliente.js";


export function obtenerCategorias() {
  return solicitar("/categorias/");
}


export function crearCategoria({
  nombre,
  descripcion = "",
}) {
  return solicitar("/categorias/", {
    method: "POST",
    body: JSON.stringify({
      nombre,
      descripcion,
    }),
  });
}


export function actualizarCategoria(
  categoriaId,
  {
    nombre,
    descripcion = "",
  },
) {
  return solicitar(
    `/categorias/${categoriaId}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        nombre,
        descripcion,
      }),
    },
  );
}


export function eliminarCategoria(
  categoriaId,
) {
  return solicitar(
    `/categorias/${categoriaId}/`,
    {
      method: "DELETE",
    },
  );
}


export function obtenerProductos({
  categoria = "",
  busqueda = "",
} = {}) {
  const parametros = new URLSearchParams();

  if (categoria) {
    parametros.set(
      "categoria",
      categoria,
    );
  }

  if (busqueda.trim()) {
    parametros.set(
      "buscar",
      busqueda.trim(),
    );
  }

  const consulta = parametros.toString();

  const ruta = consulta
    ? `/productos/?${consulta}`
    : "/productos/";

  return solicitar(ruta);
}