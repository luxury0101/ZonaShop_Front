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
import { mensajeDeError, notificar } from "./ui/notificaciones.js";
import { iniciarPedidos } from "./pedidos/pedidos.js";
import { iniciarPerfil } from "./perfil/perfil.js";
import { iniciarAdministracionPedidos } from "./admin/pedidos.js";
import { iniciarNavegacionAdmin } from "./admin/navegacion.js";
import { iniciarEncabezado } from "./ui/encabezado.js";


const formulario = document.querySelector(
  "#formulario-filtros",
);

const selectorCategoria = document.querySelector(
  "#categoria",
);

const campoBusqueda = document.querySelector(
  "#busqueda",
);

const selectorOrden = document.querySelector("#orden");
const botonLimpiarFiltros = document.querySelector(
  "#boton-limpiar-filtros",
);

const contenedorProductos = document.querySelector(
  "#productos",
);

const estado = document.querySelector("#estado");
const botonBuscar = formulario.querySelector('button[type="submit"]');


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


function productoTieneTallas(producto) {
  if (Array.isArray(producto.tallas)) {
    return producto.tallas.length > 0;
  }

  return Boolean(
    producto.tallas
    && typeof producto.tallas === "object"
    && Object.keys(producto.tallas).length,
  );
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
    imagen.decoding = "async";
    imagen.width = 440;
    imagen.height = 550;
    visual.append(imagen);
  } else {
    visual.textContent = "ZS";
    visual.setAttribute("aria-label", `${producto.nombre}, sin imagen disponible`);
    visual.classList.add("producto__visual--vacio");
  }

  const nombre = crearTexto(
    "h3",
    producto.nombre,
  );

  const precio = crearTexto(
    "strong",
    formatearPrecio(producto.precio),
    "producto__precio",
  );

  const boton = crearTexto(
    "button",
    "Agregar",
    "producto__boton",
  );

  boton.type = "button";
  boton.disabled = producto.agotado;
  boton.setAttribute(
    "aria-label",
    producto.agotado
      ? `${producto.nombre}, agotado`
      : `Agregar ${producto.nombre}`,
  );

  boton.addEventListener(
    "click",
    () => {
      if (productoTieneTallas(producto)) {
        abrirDetalleProducto(producto, agregarAlCarrito);
        return;
      }
      agregarAlCarrito(producto);
    },
  );

  const acciones = document.createElement("div");
  acciones.className = "producto__acciones";
  acciones.append(boton);

  tarjeta.append(
    visual,
    nombre,
    precio,
    acciones,
  );

  return tarjeta;
}


function crearEstadoCatalogo(titulo, descripcion, textoBoton, manejador) {
  const contenedor = document.createElement("div");
  const encabezado = crearTexto("strong", titulo);
  const mensaje = crearTexto("p", descripcion);
  const boton = crearTexto("button", textoBoton);

  contenedor.className = "catalogo-vacio";
  boton.type = "button";
  boton.addEventListener("click", manejador);
  contenedor.append(encabezado, mensaje, boton);

  return contenedor;
}


function crearEsqueletoProducto() {
  const esqueleto = document.createElement("article");
  esqueleto.className = "producto-esqueleto";
  esqueleto.setAttribute("aria-hidden", "true");

  ["visual", "nombre", "precio", "boton"].forEach((parte) => {
    const bloque = document.createElement("span");
    bloque.className = `producto-esqueleto__${parte}`;
    esqueleto.append(bloque);
  });

  return esqueleto;
}


function mostrarProductos(productos) {
  contenedorProductos.replaceChildren();
  contenedorProductos.removeAttribute("aria-busy");
  estado.classList.remove("estado--solo-lectores");

  if (productos.length === 0) {
    estado.textContent = "0 producto(s) encontrado(s).";
    contenedorProductos.append(crearEstadoCatalogo(
      "No encontramos productos con esos filtros",
      "Prueba con otra búsqueda o restablece las opciones seleccionadas.",
      "Limpiar filtros",
      limpiarFiltros,
    ));

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
  estado.textContent = "Cargando productos...";
  estado.classList.add("estado--solo-lectores");
  botonBuscar.disabled = true;
  botonBuscar.classList.add("boton--cargando");
  contenedorProductos.setAttribute("aria-busy", "true");
  contenedorProductos.replaceChildren(
    ...Array.from({ length: 4 }, crearEsqueletoProducto),
  );

  try {
    const productos = await obtenerProductos({
      categoria: selectorCategoria.value,
      busqueda: campoBusqueda.value,
      orden: selectorOrden.value,
    });

    mostrarProductos(productos);
  } catch (error) {
    console.error(error);
    estado.textContent = "No fue posible cargar el catálogo.";
    estado.classList.remove("estado--solo-lectores");
    contenedorProductos.removeAttribute("aria-busy");
    contenedorProductos.replaceChildren(crearEstadoCatalogo(
      "No pudimos cargar los productos",
      "Revisa tu conexión e inténtalo nuevamente.",
      "Reintentar",
      cargarProductos,
    ));
    notificar(mensajeDeError(error), "error");
  } finally {
    botonBuscar.disabled = false;
    botonBuscar.classList.remove("boton--cargando");
  }
}


function limpiarFiltros() {
  campoBusqueda.value = "";
  selectorCategoria.value = "";
  selectorOrden.value = "";
  cargarProductos();
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


selectorOrden.addEventListener("change", cargarProductos);


botonLimpiarFiltros.addEventListener("click", limpiarFiltros);


async function iniciarAplicacion() {
  const esRutaAdmin = window.location.pathname.startsWith("/admin");

  if (esRutaAdmin) {
    iniciarNavegacionAdmin();
    iniciarAdministracionPedidos();
    const usuario = await restaurarSesion();
    if (usuario?.rol === "administrador") {
      await Promise.all([
        iniciarAdministracionCategorias(),
        iniciarAdministracionProductos(),
      ]);
    }
    return;
  }

  iniciarEncabezado();
  iniciarDetalleProducto();
  iniciarPedidos();
  iniciarPerfil();

  try {
    await Promise.all([
      iniciarCarrito(),
      restaurarSesion(),
      cargarCategorias(),
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
    if (window.location.pathname.startsWith("/admin")) return;
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
    if (window.location.pathname.startsWith("/admin")) return;
    await cargarProductos();
  },
);

iniciarAplicacion();
