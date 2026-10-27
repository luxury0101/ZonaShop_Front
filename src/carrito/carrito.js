import { obtenerProducto } from "../api/catalogo.js";
import {
  completarCompra,
  guardarCarritoCuenta,
  obtenerPerfil,
} from "../api/autenticacion.js";
import { abrirLogin, obtenerUsuarioActual } from "../auth/sesion.js";
import { mensajeDeError, notificar } from "../ui/notificaciones.js";

const CLAVE_ALMACENAMIENTO = "zonashop_carrito";
let carrito = [];
let usuarioAutenticado = false;
let pagoPendienteDeLogin = false;
let temporizadorCierreAutomatico = null;

const elementos = {
  botonAbrir: document.querySelector("#boton-abrir-carrito"),
  cantidad: document.querySelector("#cantidad-carrito"),
  modal: document.querySelector("#modal-carrito"),
  botonCerrar: document.querySelector("#boton-cerrar-carrito"),
  botonVaciar: document.querySelector("#boton-vaciar-carrito"),
  botonPagar: document.querySelector("#boton-pagar"),
  botonSeguir: document.querySelector("#boton-seguir-comprando"),
  lista: document.querySelector("#lista-carrito"),
  estado: document.querySelector("#estado-carrito"),
  subtotal: document.querySelector("#subtotal-carrito"),
  total: document.querySelector("#total-carrito"),
  aviso: document.querySelector("#aviso-carrito"),
  modalVaciar: document.querySelector("#modal-vaciar-carrito"),
  cancelarVaciado: document.querySelector("#boton-cancelar-vaciado"),
  confirmarVaciado: document.querySelector("#boton-confirmar-vaciado"),
  modalPago: document.querySelector("#modal-pago"),
  formularioPago: document.querySelector("#formulario-pago"),
  cerrarPago: document.querySelector("#boton-cerrar-pago"),
  resumenPago: document.querySelector("#resumen-pago"),
  confirmarPago: document.querySelector("#boton-confirmar-pago"),
};

function convertirACentavos(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.round(numero * 100) : 0;
}

function claveItem(item) {
  return `${item.id}::${item.talla || ""}`;
}

function stockDelProducto(producto, talla = "") {
  const tallas = Array.isArray(producto.tallas) ? producto.tallas : [];
  if (tallas.length === 0) {
    return talla ? 0 : Number(producto.existencias);
  }
  if (!talla) return 0;
  return Number(tallas.find((item) => item.talla === talla)?.stock || 0);
}

function formatearPrecio(centavos) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(centavos / 100);
}

function mostrarAviso(mensaje, esError = false) {
  if (!elementos.aviso) return;
  elementos.aviso.textContent = mensaje;
  elementos.aviso.classList.toggle("aviso-carrito--error", esError);
  elementos.aviso.hidden = !mensaje;
}

function avisar(mensaje, tipo = "informacion") {
  mostrarAviso(mensaje, tipo === "error");
  notificar(mensaje, tipo);
}

function guardarCarrito() {
  if (usuarioAutenticado) {
    window.clearTimeout(guardarCarrito.temporizador);
    guardarCarrito.temporizador = window.setTimeout(async () => {
      try {
        await guardarCarritoCuenta(carrito);
      } catch (error) {
        avisar(mensajeDeError(error), "error");
      }
    }, 250);
    return;
  }
  localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(carrito));
}

function adaptarCarritoCuenta(items) {
  return items.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    precioCentavos: convertirACentavos(item.precio),
    cantidad: item.cantidad,
    existencias: item.existencias,
    talla: item.talla || "",
    imagen: item.imagen || "",
  }));
}

async function sincronizarCarrito(usuario) {
  if (!usuario) {
    if (usuarioAutenticado) {
      carrito = [];
      localStorage.removeItem(CLAVE_ALMACENAMIENTO);
      renderizarCarrito();
    }
    usuarioAutenticado = false;
    return;
  }
  try {
    const items = await guardarCarritoCuenta(carrito, true);
    usuarioAutenticado = true;
    carrito = adaptarCarritoCuenta(items);
    localStorage.removeItem(CLAVE_ALMACENAMIENTO);
    renderizarCarrito();
  } catch (error) {
    avisar("Iniciaste sesión, pero no fue posible sincronizar el carrito.", "error");
  }
}

function cargarCarrito() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO) || "[]");
    carrito = Array.isArray(datos)
      ? datos.filter((item) => item && item.id != null && Number.isInteger(item.cantidad) && item.cantidad > 0)
        .map((item) => ({
          ...item,
          talla: item.talla || "",
          precioCentavos: Number.isInteger(item.precioCentavos)
            ? item.precioCentavos
            : convertirACentavos(item.precio),
        }))
      : [];
  } catch (error) {
    console.error("No se pudo recuperar el carrito:", error);
    carrito = [];
    localStorage.removeItem(CLAVE_ALMACENAMIENTO);
  }
}

function obtenerCantidadTotal() {
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

function obtenerValorTotalCentavos() {
  return carrito.reduce(
    (total, item) => total + item.precioCentavos * item.cantidad,
    0,
  );
}

function animarContador() {
  if (!elementos.cantidad) return;
  elementos.cantidad.classList.remove("cantidad-carrito--cambio");
  void elementos.cantidad.offsetWidth;
  elementos.cantidad.classList.add("cantidad-carrito--cambio");
}

function cancelarCierreAutomatico() {
  if (temporizadorCierreAutomatico != null) {
    window.clearTimeout(temporizadorCierreAutomatico);
    temporizadorCierreAutomatico = null;
  }
}

function animarBotonCarrito() {
  if (!elementos.botonAbrir) return;
  elementos.botonAbrir.classList.remove("boton-carrito--pulso");
  void elementos.botonAbrir.offsetWidth;
  elementos.botonAbrir.classList.add("boton-carrito--pulso");
}

function abrirCarrito({ automatico = false } = {}) {
  cancelarCierreAutomatico();
  if (!elementos.modal?.open) elementos.modal?.showModal();
  if (!automatico || !elementos.modal?.open) return;
  temporizadorCierreAutomatico = window.setTimeout(() => {
    if (elementos.modal?.open) elementos.modal.close();
    temporizadorCierreAutomatico = null;
  }, 4000);
}

function abrirCarritoDespuesDeAgregar() {
  animarBotonCarrito();
  window.setTimeout(() => abrirCarrito({ automatico: true }), 0);
}

function actualizarResumen() {
  const cantidadAnterior = elementos.cantidad?.textContent;
  const cantidad = obtenerCantidadTotal();
  const total = obtenerValorTotalCentavos();
  if (elementos.cantidad) {
    elementos.cantidad.textContent = cantidad;
    elementos.cantidad.setAttribute(
      "aria-label",
      `${cantidad} producto${cantidad === 1 ? "" : "s"} en el carrito`,
    );
    if (cantidadAnterior !== String(cantidad)) animarContador();
  }
  if (elementos.subtotal) elementos.subtotal.textContent = formatearPrecio(total);
  if (elementos.total) elementos.total.textContent = formatearPrecio(total);
  if (elementos.estado) {
    elementos.estado.textContent = cantidad === 0
      ? "Tu carrito está vacío."
      : `${cantidad} artículo(s) en el carrito.`;
  }
  [elementos.botonVaciar, elementos.botonPagar].forEach((boton) => {
    if (boton) boton.disabled = cantidad === 0;
  });
}

function cambiarCantidad(clave, nuevaCantidad) {
  const item = carrito.find((producto) => claveItem(producto) === clave);
  if (!item) return;
  const cantidad = Number(nuevaCantidad);
  const limite = Number(item.existencias);
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    eliminarDelCarrito(clave);
    return;
  }
  if (Number.isFinite(limite) && cantidad > limite) {
    item.cantidad = limite;
    avisar(`Solo quedan ${limite} unidades disponibles`, "advertencia");
  } else {
    item.cantidad = cantidad;
    avisar("Cantidad actualizada", "informacion");
  }
  guardarCarrito();
  renderizarCarrito();
}

function eliminarDelCarrito(clave) {
  const item = carrito.find((producto) => claveItem(producto) === clave);
  carrito = carrito.filter((producto) => claveItem(producto) !== clave);
  guardarCarrito();
  renderizarCarrito();
  avisar(`${item?.nombre || "Producto"} eliminado del carrito`, "informacion");
}

function crearControlCantidad(item) {
  const contenedor = document.createElement("div");
  contenedor.className = "item-carrito__cantidad";
  const botonRestar = document.createElement("button");
  botonRestar.type = "button";
  botonRestar.textContent = "−";
  const descripcion = `${item.nombre}${item.talla ? ` talla ${item.talla}` : ""}`;
  const clave = claveItem(item);
  botonRestar.setAttribute("aria-label", `Restar una unidad de ${descripcion}`);
  const entrada = document.createElement("input");
  entrada.type = "number";
  entrada.min = "1";
  entrada.max = String(item.existencias);
  entrada.value = String(item.cantidad);
  entrada.setAttribute("aria-label", `Cantidad de ${descripcion}`);
  const botonSumar = document.createElement("button");
  botonSumar.type = "button";
  botonSumar.textContent = "+";
  botonSumar.setAttribute("aria-label", `Agregar una unidad de ${descripcion}`);
  botonSumar.disabled = item.cantidad >= Number(item.existencias);
  botonRestar.addEventListener("click", () => cambiarCantidad(clave, item.cantidad - 1));
  entrada.addEventListener("change", () => cambiarCantidad(clave, Number(entrada.value)));
  botonSumar.addEventListener("click", () => cambiarCantidad(clave, item.cantidad + 1));
  contenedor.append(botonRestar, entrada, botonSumar);
  return contenedor;
}

function crearItemCarrito(item) {
  const articulo = document.createElement("article");
  articulo.className = "item-carrito";
  const visual = document.createElement("div");
  visual.className = "item-carrito__visual";
  if (item.imagen) {
    const imagen = document.createElement("img");
    imagen.src = item.imagen;
    imagen.alt = item.nombre;
    visual.append(imagen);
  } else {
    visual.textContent = "Sin imagen";
  }
  const informacion = document.createElement("div");
  informacion.className = "item-carrito__informacion";
  const nombre = document.createElement("h3");
  nombre.textContent = item.nombre;
  const precioUnitario = document.createElement("p");
  precioUnitario.textContent = `${formatearPrecio(item.precioCentavos)} por unidad`;
  informacion.append(nombre);
  if (item.talla) {
    const talla = document.createElement("p");
    talla.className = "item-carrito__talla";
    talla.textContent = `Talla: ${item.talla}`;
    informacion.append(talla);
  }
  informacion.append(precioUnitario);
  const subtotal = document.createElement("strong");
  subtotal.className = "item-carrito__subtotal";
  subtotal.textContent = formatearPrecio(item.precioCentavos * item.cantidad);
  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.className = "item-carrito__eliminar";
  botonEliminar.textContent = "Eliminar";
  botonEliminar.addEventListener("click", () => eliminarDelCarrito(claveItem(item)));
  articulo.append(visual, informacion, crearControlCantidad(item), subtotal, botonEliminar);
  return articulo;
}

function renderizarCarrito() {
  if (!elementos.lista) return;
  elementos.lista.replaceChildren();
  if (carrito.length === 0) {
    const vacio = document.createElement("div");
    vacio.className = "carrito-vacio";
    vacio.innerHTML = "<strong>Tu carrito está vacío</strong><p>Agrega productos para comenzar tu compra.</p>";
    const seguir = document.createElement("button");
    seguir.type = "button";
    seguir.textContent = "Seguir comprando";
    seguir.addEventListener("click", () => elementos.modal?.close());
    vacio.append(seguir);
    elementos.lista.append(vacio);
  } else {
    carrito.forEach((item) => elementos.lista.append(crearItemCarrito(item)));
  }
  actualizarResumen();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  renderizarCarrito();
  avisar("El carrito fue vaciado", "informacion");
}

async function revalidarCarrito() {
  const resultados = await Promise.all(carrito.map(async (item) => {
    try {
      return { item, producto: await obtenerProducto(item.id) };
    } catch (error) {
      return { item, error };
    }
  }));
  const carritoActualizado = [];
  let productosAjustados = 0;
  let falloConexion = false;
  resultados.forEach(({ item, producto, error }) => {
    if (error) {
      if (error.status === 404) productosAjustados += 1;
      else {
        falloConexion = true;
        carritoActualizado.push(item);
      }
      return;
    }
    const talla = item.talla || "";
    const existencias = stockDelProducto(producto, talla);
    if (!Number.isFinite(existencias) || existencias < 1) {
      productosAjustados += 1;
      return;
    }
    const precioCentavos = convertirACentavos(producto.precio);
    const cantidad = Math.min(item.cantidad, existencias);
    if (cantidad !== item.cantidad || precioCentavos !== item.precioCentavos || producto.nombre !== item.nombre) {
      productosAjustados += 1;
    }
    carritoActualizado.push({
      id: producto.id,
      nombre: producto.nombre,
      precioCentavos,
      cantidad,
      existencias,
      talla,
      imagen: producto.imagen || "",
    });
  });
  carrito = carritoActualizado;
  guardarCarrito();
  renderizarCarrito();
  if (falloConexion) {
    mostrarAviso("No fue posible actualizar todos los productos del carrito. Se conservaron temporalmente los datos guardados.", true);
  } else if (productosAjustados > 0) {
    mostrarAviso("El carrito se actualizó con los precios y existencias actuales.");
  }
}

export function agregarAlCarrito(producto) {
  const tallas = Array.isArray(producto.tallas) ? producto.tallas : [];
  const talla = producto.talla || "";
  if (tallas.length > 0 && !talla) {
    avisar("Elige una talla", "advertencia");
    return;
  }
  const existencias = tallas.length > 0
    ? stockDelProducto(producto, talla)
    : Number(producto.existencias);
  if (producto.agotado || !Number.isFinite(existencias) || existencias < 1) {
    avisar(`${producto.nombre} no tiene stock disponible`, "error");
    return;
  }
  const itemExistente = carrito.find((item) => claveItem(item) === claveItem({ id: producto.id, talla }));
  if (itemExistente) {
    itemExistente.existencias = existencias;
    itemExistente.precioCentavos = convertirACentavos(producto.precio);
    itemExistente.nombre = producto.nombre;
    itemExistente.imagen = producto.imagen || "";
    if (itemExistente.cantidad >= existencias) {
      avisar(`Solo quedan ${existencias} unidades disponibles`, "advertencia");
      return;
    }
    itemExistente.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precioCentavos: convertirACentavos(producto.precio),
      cantidad: 1,
      existencias,
      talla,
      imagen: producto.imagen || "",
    });
  }
  guardarCarrito();
  renderizarCarrito();
  avisar(`Producto agregado al carrito: ${producto.nombre}`, "exito");
  abrirCarritoDespuesDeAgregar();
}

function mostrarResumenPago() {
  if (!elementos.resumenPago) return;
  elementos.resumenPago.replaceChildren();
  carrito.forEach((item) => {
    const fila = document.createElement("div");
    const descripcion = document.createElement("span");
    const subtotal = document.createElement("strong");
    descripcion.textContent = `${item.nombre}${item.talla ? ` · Talla ${item.talla}` : ""} × ${item.cantidad}`;
    subtotal.textContent = formatearPrecio(item.precioCentavos * item.cantidad);
    fila.append(descripcion, subtotal);
    elementos.resumenPago.append(fila);
  });
  const total = document.createElement("div");
  total.className = "pago__total";
  const etiquetaTotal = document.createElement("span");
  const valorTotal = document.createElement("strong");
  etiquetaTotal.textContent = "Total";
  valorTotal.textContent = formatearPrecio(obtenerValorTotalCentavos());
  total.append(etiquetaTotal, valorTotal);
  elementos.resumenPago.append(total);
  if (elementos.confirmarPago) {
    elementos.confirmarPago.textContent = `Pagar ${formatearPrecio(obtenerValorTotalCentavos())}`;
  }
}

async function cargarDireccionPago() {
  try {
    const perfil = await obtenerPerfil();
    const valores = {
      destinatario: perfil.nombre,
      telefono: perfil.telefono,
      direccion: perfil.direccion,
      ciudad: perfil.ciudad,
      departamento: perfil.departamento,
      codigo_postal: perfil.codigo_postal,
      instrucciones: perfil.instrucciones_envio,
    };
    Object.entries(valores).forEach(([campo, valor]) => {
      if (elementos.formularioPago?.elements[campo]) {
        elementos.formularioPago.elements[campo].value = valor || "";
      }
    });
  } catch (error) {
    notificar("No fue posible cargar tu dirección guardada", "advertencia");
  }
}


async function abrirPago() {
  if (carrito.length === 0) return;
  if (!obtenerUsuarioActual()) {
    pagoPendienteDeLogin = true;
    elementos.modal?.close();
    notificar("Inicia sesión para continuar con tu compra", "advertencia");
    abrirLogin();
    return;
  }
  await cargarDireccionPago();
  mostrarResumenPago();
  elementos.modal?.close();
  elementos.modalPago?.showModal();
}

function errorPago(campo, mensaje) {
  const error = document.querySelector(`#error-pago-${campo.name}`);
  if (error) error.textContent = mensaje;
  campo.setAttribute("aria-invalid", String(Boolean(mensaje)));
  return !mensaje;
}

function validarCampoPago(campo) {
  const valor = campo.value.trim();
  if (campo.name === "titular") {
    return errorPago(campo, valor.length >= 3 ? "" : "Escribe el nombre completo del titular.");
  }
  if (campo.name === "tarjeta") {
    return errorPago(campo, /^\d{4} \d{4} \d{4} \d{4}$/.test(valor) ? "" : "El número debe tener 16 dígitos.");
  }
  if (campo.name === "cvv") {
    return errorPago(campo, /^\d{3,4}$/.test(valor) ? "" : "El CVV debe tener 3 o 4 dígitos.");
  }
  if (campo.name === "vencimiento") {
    const coincidencia = /^(\d{2})\/(\d{2})$/.exec(valor);
    let valido = false;
    if (coincidencia) {
      const mes = Number(coincidencia[1]);
      const anio = 2000 + Number(coincidencia[2]);
      const ahora = new Date();
      valido = mes >= 1 && mes <= 12 && (anio > ahora.getFullYear() || (anio === ahora.getFullYear() && mes >= ahora.getMonth() + 1));
    }
    return errorPago(campo, valido ? "" : "Usa una fecha MM/AA que no esté vencida.");
  }
  return true;
}

async function procesarPago(evento) {
  evento.preventDefault();
  const campos = Array.from(elementos.formularioPago.querySelectorAll("input"));
  if (!campos.map(validarCampoPago).every(Boolean)) return;
  elementos.confirmarPago.disabled = true;
  elementos.confirmarPago.classList.add("boton--cargando");
  elementos.confirmarPago.textContent = "Procesando pago...";
  const datosFormulario = new FormData(elementos.formularioPago);
  const envio = {
    destinatario: String(datosFormulario.get("destinatario") || "").trim(),
    telefono: String(datosFormulario.get("telefono") || "").trim(),
    direccion: String(datosFormulario.get("direccion") || "").trim(),
    ciudad: String(datosFormulario.get("ciudad") || "").trim(),
    departamento: String(datosFormulario.get("departamento") || "").trim(),
    codigo_postal: String(datosFormulario.get("codigo_postal") || "").trim(),
    instrucciones: String(datosFormulario.get("instrucciones") || "").trim(),
  };
  try {
    await Promise.all([
      completarCompra(
        carrito,
        envio,
        elementos.formularioPago.elements.guardarDireccion.checked,
      ),
      new Promise((resolver) => window.setTimeout(resolver, 1700)),
    ]);
    carrito = [];
    localStorage.removeItem(CLAVE_ALMACENAMIENTO);
    renderizarCarrito();
    elementos.formularioPago.reset();
    elementos.modalPago.close();
    notificar("¡Compra exitosa! Gracias por tu compra", "exito", { grande: true, duracion: 6000 });
    window.dispatchEvent(new CustomEvent("pedidos:actualizados"));
    window.dispatchEvent(new CustomEvent("productos:actualizados"));
  } catch (error) {
    notificar(mensajeDeError(error), "error", { duracion: 6000 });
    if (error.status === 409) await revalidarCarrito();
  } finally {
    elementos.confirmarPago.disabled = false;
    elementos.confirmarPago.classList.remove("boton--cargando");
    mostrarResumenPago();
  }
}

function configurarFormularioPago() {
  if (!elementos.formularioPago) return;
  const tarjeta = elementos.formularioPago.elements.tarjeta;
  const vencimiento = elementos.formularioPago.elements.vencimiento;
  const cvv = elementos.formularioPago.elements.cvv;
  tarjeta.addEventListener("input", () => {
    tarjeta.value = tarjeta.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    validarCampoPago(tarjeta);
  });
  vencimiento.addEventListener("input", () => {
    const digitos = vencimiento.value.replace(/\D/g, "").slice(0, 4);
    vencimiento.value = digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
    validarCampoPago(vencimiento);
  });
  cvv.addEventListener("input", () => {
    cvv.value = cvv.value.replace(/\D/g, "").slice(0, 4);
    validarCampoPago(cvv);
  });
  elementos.formularioPago.querySelectorAll("input").forEach((campo) => {
    campo.addEventListener("blur", () => validarCampoPago(campo));
  });
  elementos.formularioPago.addEventListener("submit", procesarPago);
}

export async function iniciarCarrito() {
  cargarCarrito();
  renderizarCarrito();
  elementos.botonAbrir?.addEventListener("click", () => abrirCarrito());
  elementos.botonCerrar?.addEventListener("click", () => elementos.modal?.close());
  elementos.botonSeguir?.addEventListener("click", () => elementos.modal?.close());
  elementos.botonVaciar?.addEventListener("click", () => elementos.modalVaciar?.showModal());
  elementos.cancelarVaciado?.addEventListener("click", () => elementos.modalVaciar?.close());
  elementos.confirmarVaciado?.addEventListener("click", () => {
    elementos.modalVaciar?.close();
    vaciarCarrito();
  });
  elementos.botonPagar?.addEventListener("click", abrirPago);
  elementos.cerrarPago?.addEventListener("click", () => elementos.modalPago?.close());
  configurarFormularioPago();
  elementos.modal?.addEventListener("click", (evento) => {
    if (evento.target === elementos.modal) elementos.modal.close();
  });
  ["pointerdown", "focusin", "keydown", "mouseenter"].forEach((tipo) => {
    elementos.modal?.addEventListener(tipo, cancelarCierreAutomatico);
  });
  elementos.modal?.addEventListener("close", cancelarCierreAutomatico);
  window.addEventListener("sesion:cambiada", async (evento) => {
    await sincronizarCarrito(evento.detail?.usuario);
    if (pagoPendienteDeLogin && evento.detail?.usuario) {
      pagoPendienteDeLogin = false;
      abrirCarrito();
    }
  });
  if (carrito.length > 0) await revalidarCarrito();
}
