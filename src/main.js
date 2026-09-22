import "./styles/main.scss";

import {
  restaurarSesion,
} from "./auth/sesion.js";

import {
  iniciarAdministracionCategorias,
} from "./admin/categorias.js";

import {
  obtenerCategorias,
  obtenerProductos,
} from "./api/catalogo.js";


const formulario = document.querySelector(
  "#formulario-filtros",
);

const selectorCategoria = document.querySelector(
  "#categoria",
);

const campoBusqueda = document.querySelector(
  "#busqueda",
);

const contenedorProductos = document.querySelector(
  "#productos",
);

const estado = document.querySelector("#estado");


function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor));
}


function crearTexto(elemento, contenido, clase = "") {
  const nodo = document.createElement(elemento);

  nodo.textContent = contenido;

  if (clase) {
    nodo.className = clase;
  }

  return nodo;
}


function crearTarjetaProducto(producto) {
  const tarjeta = document.createElement("article");

  tarjeta.className = "producto";

  const categoria = crearTexto(
    "span",
    producto.categoria_nombre,
    "producto__categoria",
  );

  const nombre = crearTexto(
    "h3",
    producto.nombre,
  );

  const descripcion = crearTexto(
    "p",
    producto.descripcion || "Sin descripción.",
    "producto__descripcion",
  );

  const precio = crearTexto(
    "strong",
    formatearPrecio(producto.precio),
    "producto__precio",
  );

  const disponibilidad = crearTexto(
    "span",
    producto.agotado
      ? "Agotado"
      : `${producto.existencias} disponible(s)`,
    producto.agotado
      ? "producto__stock producto__stock--agotado"
      : "producto__stock",
  );

  const boton = crearTexto(
    "button",
    producto.agotado
      ? "No disponible"
      : "Agregar al carrito",
    "producto__boton",
  );

  boton.type = "button";
  boton.disabled = producto.agotado;

  tarjeta.append(
    categoria,
    nombre,
    descripcion,
    precio,
    disponibilidad,
    boton,
  );

  return tarjeta;
}


function mostrarProductos(productos) {
  contenedorProductos.replaceChildren();

  if (productos.length === 0) {
    estado.textContent =
      "No se encontraron productos con esos filtros.";

    return;
  }

  estado.textContent =
    `${productos.length} producto(s) encontrado(s).`;

  productos.forEach((producto) => {
    contenedorProductos.append(
      crearTarjetaProducto(producto),
    );
  });
}


async function cargarCategorias() {
  const categoriaSeleccionada =
    selectorCategoria.value;

  const categorias =
    await obtenerCategorias();

  selectorCategoria.replaceChildren();

  const opcionGeneral =
    document.createElement("option");

  opcionGeneral.value = "";
  opcionGeneral.textContent =
    "Todas las categorías";

  selectorCategoria.append(opcionGeneral);

  categorias.forEach((categoria) => {
    const opcion =
      document.createElement("option");

    opcion.value = categoria.id;
    opcion.textContent = categoria.nombre;

    selectorCategoria.append(opcion);
  });

  const seleccionTodaviaExiste =
    Array.from(
      selectorCategoria.options,
    ).some(
      (opcion) =>
        opcion.value === categoriaSeleccionada,
    );

  selectorCategoria.value =
    seleccionTodaviaExiste
      ? categoriaSeleccionada
      : "";
}


async function cargarProductos() {
  estado.textContent = "Cargando catálogo...";

  contenedorProductos.replaceChildren();

  try {
    const productos = await obtenerProductos({
      categoria: selectorCategoria.value,
      busqueda: campoBusqueda.value,
    });

    mostrarProductos(productos);
  } catch (error) {
    console.error(error);

    estado.textContent =
      "No fue posible conectar con el catálogo. " +
      "Comprueba que el backend esté ejecutándose.";
  }
}


formulario.addEventListener(
  "submit",
  (evento) => {
    evento.preventDefault();
    cargarProductos();
  },
);


selectorCategoria.addEventListener(
  "change",
  () => {
    cargarProductos();
  },
);


async function iniciarAplicacion() {
  try {
    await Promise.all([
      restaurarSesion(),
      cargarCategorias(),
      iniciarAdministracionCategorias(),
    ]);

    await cargarProductos();
  } catch (error) {
    console.error(
      "No fue posible iniciar la aplicación:",
      error,
    );

    estado.textContent =
      "No fue posible cargar la información inicial.";
  }
}

window.addEventListener(
  "categorias:actualizadas",
  async () => {
    try {
      await cargarCategorias();
      await cargarProductos();
    } catch (error) {
      console.error(
        "No fue posible actualizar el catálogo:",
        error,
      );
    }
  },
);


iniciarAplicacion();