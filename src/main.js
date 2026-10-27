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
import { iniciarPaginasInformativas } from "./paginas/informativas.js";


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
const selectorTalla = document.querySelector("#talla");
const botonLimpiarFiltros = document.querySelector(
  "#boton-limpiar-filtros",
);

const contenedorProductos = document.querySelector(
  "#productos",
);

const estado = document.querySelector("#estado");
const botonBuscar = formulario.querySelector('button[type="submit"]');
const hero = document.querySelector(".presentacion");
const categoriasMosaico = document.querySelector("#categorias-mosaico");
const productosNuevos = document.querySelector("#productos-nuevos");
const formularioSuscripcion = document.querySelector("#formulario-suscripcion");
const mensajeSuscripcion = document.querySelector("#mensaje-suscripcion");

// TODO: reemplazar estas fotografías provisionales por fotos propias por categoría.
const IMAGENES_CATEGORIA = [
  "/images/categoria-mujer.webp",
  "/images/categoria-hombre.webp",
  "/images/categoria-ninos.webp",
];


function iniciarHero() {
  if (!hero) return;

  const claveAnimacion = "zonashop:hero-animado";
  let primeraVista = true;

  try {
    primeraVista = sessionStorage.getItem(claveAnimacion) !== "si";
    sessionStorage.setItem(claveAnimacion, "si");
  } catch {
    primeraVista = true;
  }

  hero.classList.toggle("presentacion--animar", primeraVista);
}


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

  const visual = document.createElement("button");
  visual.className = "producto__visual";
  visual.type = "button";
  visual.setAttribute("aria-label", `Ver detalles de ${producto.nombre}`);
  visual.addEventListener(
    "click",
    () => abrirDetalleProducto(producto, agregarAlCarrito),
  );

  const imagenes = [producto.imagen, producto.imagen_secundaria].filter(Boolean);
  const placeholder = document.createElement("span");
  placeholder.className = "producto__placeholder";
  placeholder.textContent = "ZS";
  placeholder.hidden = imagenes.length > 0;
  visual.append(placeholder);

  imagenes.forEach((ruta, indice) => {
    const imagen = document.createElement("img");
    imagen.src = ruta;
    imagen.alt = indice === 0
      ? producto.nombre
      : `${producto.nombre}, vista alternativa`;
    imagen.loading = "lazy";
    imagen.decoding = "async";
    imagen.width = 440;
    imagen.height = 550;
    imagen.className = indice === 0
      ? "producto__imagen producto__imagen--principal"
      : "producto__imagen producto__imagen--secundaria";
    imagen.addEventListener("error", () => {
      imagen.hidden = true;
      const hayImagenVisible = Array.from(
        visual.querySelectorAll(".producto__imagen"),
      ).some((elemento) => !elemento.hidden);
      placeholder.hidden = hayImagenVisible;
    });
    visual.append(imagen);
  });

  if (imagenes.length === 0) {
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

  const informacion = document.createElement("div");
  informacion.className = "producto__informacion";
  informacion.append(nombre, precio);

  tarjeta.append(visual);

  if (imagenes.length > 1) {
    visual.classList.add("producto__visual--doble");
    const indicadores = document.createElement("div");
    indicadores.className = "producto__indicadores";
    ["principal", "alternativa"].forEach((nombreVista, indice) => {
      const indicador = document.createElement("button");
      indicador.type = "button";
      indicador.className = "producto__indicador";
      indicador.setAttribute("aria-label", `Mostrar vista ${nombreVista} de ${producto.nombre}`);
      indicador.setAttribute("aria-pressed", String(indice === 0));
      indicador.addEventListener("click", () => {
        const mostrarSecundaria = indice === 1;
        visual.classList.toggle("producto__visual--mostrar-secundaria", mostrarSecundaria);
        indicadores.querySelectorAll("button").forEach((boton, posicion) => {
          boton.setAttribute("aria-pressed", String(posicion === indice));
        });
      });
      indicadores.append(indicador);
    });
    tarjeta.append(indicadores);
  }

  tarjeta.append(informacion);

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

  ["visual", "nombre", "precio"].forEach((parte) => {
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

  return categorias;
}


function imagenParaCategoria(categoria, indice) {
  const nombre = categoria.nombre.toLocaleLowerCase("es");
  if (nombre.includes("mujer")) return IMAGENES_CATEGORIA[0];
  if (nombre.includes("hombre")) return IMAGENES_CATEGORIA[1];
  if (nombre.includes("niñ") || nombre.includes("infantil")) return IMAGENES_CATEGORIA[2];
  return IMAGENES_CATEGORIA[indice % IMAGENES_CATEGORIA.length];
}


function renderizarCategorias(categorias) {
  if (!categoriasMosaico) return;
  categoriasMosaico.replaceChildren();

  if (categorias.length === 0) {
    categoriasMosaico.hidden = true;
    return;
  }

  categoriasMosaico.hidden = false;

  categorias.forEach((categoria, indice) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "categoria-editorial";
    boton.setAttribute("aria-label", `Ver productos de ${categoria.nombre}`);

    const imagen = document.createElement("img");
    imagen.src = imagenParaCategoria(categoria, indice);
    imagen.alt = `Selección editorial de ${categoria.nombre}`;
    imagen.width = 1067;
    imagen.height = 1600;
    imagen.loading = "eager";
    imagen.decoding = "async";

    const nombre = crearTexto("span", categoria.nombre, "categoria-editorial__nombre");
    const cantidad = crearTexto(
      "small",
      `${categoria.cantidad_productos ?? 0} producto(s)`,
      "categoria-editorial__cantidad",
    );
    boton.append(imagen, nombre, cantidad);
    boton.addEventListener("click", async () => {
      selectorCategoria.value = String(categoria.id);
      await cargarProductos();
      document.querySelector("#productos-catalogo")?.scrollIntoView({ block: "start" });
    });
    categoriasMosaico.append(boton);
  });
}


function renderizarNuevos(productos) {
  if (!productosNuevos) return;
  productosNuevos.replaceChildren();
  productos.slice(0, 4).forEach((producto) => {
    productosNuevos.append(crearTarjetaProducto(producto));
  });
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
      talla: selectorTalla.value,
    });

    mostrarProductos(productos);
    return productos;
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
    return [];
  } finally {
    botonBuscar.disabled = false;
    botonBuscar.classList.remove("boton--cargando");
  }
}


function iniciarSuscripcion() {
  formularioSuscripcion?.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const correo = String(new FormData(formularioSuscripcion).get("email") || "").trim();
    if (!correo || !formularioSuscripcion.checkValidity()) {
      formularioSuscripcion.reportValidity();
      return;
    }
    try {
      localStorage.setItem("zonashop:newsletter", correo);
    } catch {
      // La preferencia sigue confirmada durante esta visita si el navegador bloquea el almacenamiento.
    }
    mensajeSuscripcion.textContent = "Preferencia guardada en este dispositivo. Te avisaremos cuando el canal de novedades esté activo.";
    formularioSuscripcion.reset();
  });
}


function limpiarFiltros() {
  campoBusqueda.value = "";
  selectorCategoria.value = "";
  selectorOrden.value = "";
  selectorTalla.value = "";
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
selectorTalla.addEventListener("change", cargarProductos);


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

  iniciarHero();
  iniciarEncabezado();
  iniciarDetalleProducto();
  iniciarPedidos();
  iniciarPerfil();
  iniciarSuscripcion();

  const esPaginaInformativa = iniciarPaginasInformativas();

  if (esPaginaInformativa) {
    await Promise.all([
      iniciarCarrito(),
      restaurarSesion(),
    ]);
    return;
  }

  try {
    const [, , categorias] = await Promise.all([
      iniciarCarrito(),
      restaurarSesion(),
      cargarCategorias(),
    ]);

    const productos = await cargarProductos();
    renderizarCategorias(categorias);
    renderizarNuevos(productos);
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
      const categorias = await cargarCategorias();
      const productos = await cargarProductos();
      renderizarCategorias(categorias);
      renderizarNuevos(productos);
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
    const productos = await cargarProductos();
    if (
      !selectorCategoria.value &&
      !campoBusqueda.value.trim() &&
      !selectorOrden.value &&
      !selectorTalla.value
    ) {
      renderizarNuevos(productos);
    }
  },
);

productosNuevos?.replaceChildren(
  ...Array.from({ length: 4 }, crearEsqueletoProducto),
);

iniciarAplicacion();
