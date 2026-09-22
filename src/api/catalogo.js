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


function construirDatosProducto({
  categoria,
  nombre,
  descripcion = "",
  precio,
  existencias,
  imagen,
}) {
  const datos = new FormData();

  datos.append("categoria", categoria);
  datos.append("nombre", nombre);
  datos.append("descripcion", descripcion);
  datos.append("precio", String(precio));
  datos.append("existencias", String(existencias));

  if (imagen instanceof File) {
    datos.append("imagen", imagen);
  }

  return datos;
}


export function crearProducto(datosProducto) {
  return solicitar("/productos/", {
    method: "POST",
    body: construirDatosProducto(datosProducto),
  });
}


export function actualizarProducto(
  productoId,
  datosProducto,
) {
  return solicitar(
    `/productos/${productoId}/`,
    {
      method: "PATCH",
      body: construirDatosProducto(datosProducto),
    },
  );
}


export function eliminarProducto(productoId) {
  return solicitar(
    `/productos/${productoId}/`,
    {
      method: "DELETE",
    },
  );
}
