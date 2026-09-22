import "./styles/main.scss";

import {
  agregarAlCarrito,
  iniciarCarrito,
} from "./carrito/carrito.js";

import {
  abrirDetalleProducto,
  iniciarDetalleProducto,
} from "./catalogo/detalle.js";

import {
  restaurarSesion,
} from "./auth/sesion.js";

import {
  iniciarAdministracionCategorias,
} from "./admin/categorias.js";

import {
  iniciarAdministracionProductos,
} from "./admin/productos.js";

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

  const visual = document.createElement("div");
  visual.className = "producto__visual";

  if (producto.imagen) {
    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    imagen.loading = "lazy";
    visual.append(imagen);
  } else {
    visual.textContent = "Sin imagen";
    visual.classList.add("producto__visual--vacio");
  }

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

  boton.addEventListener(
    "click",
    () => agregarAlCarrito(producto),
  );

  const botonDetalle = crearTexto(
    "button",
    "Ver detalle",
    "producto__detalle",
  );

  botonDetalle.type = "button";
  botonDetalle.addEventListener(
    "click",
    () => abrirDetalleProducto(
      producto,
      agregarAlCarrito,
    ),
  );

  const acciones = document.createElement("div");
  acciones.className = "producto__acciones";
  acciones.append(botonDetalle, boton);

  tarjeta.append(
    visual,
    categoria,
    nombre,
    descripcion,
    precio,
    disponibilidad,
    acciones,
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
  iniciarCarrito();
  iniciarDetalleProducto();

  try {
    await Promise.all([
      restaurarSesion(),
      cargarCategorias(),
      iniciarAdministracionCategorias(),
      iniciarAdministracionProductos(),
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


window.addEventListener(
  "productos:actualizados",
  async () => {
    await cargarProductos();
  },
);

iniciarAplicacion();