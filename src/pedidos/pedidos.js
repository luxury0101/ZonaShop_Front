import { obtenerPedidos } from "../api/autenticacion.js";
import { mensajeDeError, notificar } from "../ui/notificaciones.js";


const elementos = {
  abrir: document.querySelector("#boton-mis-pedidos"),
  cerrar: document.querySelector("#boton-cerrar-pedidos"),
  modal: document.querySelector("#modal-pedidos"),
  estado: document.querySelector("#estado-pedidos"),
  lista: document.querySelector("#lista-pedidos"),
};


function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor));
}


function crearPedido(pedido) {
  const detalle = document.createElement("details");
  detalle.className = "pedido";
  const resumen = document.createElement("summary");
  const fecha = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(pedido.creado_en));
  const datoResumen = (etiqueta, valor, destacado = false) => {
    const contenedor = document.createElement("span");
    const titulo = document.createElement("small");
    const contenido = document.createElement(destacado ? "strong" : "span");
    titulo.textContent = etiqueta;
    contenido.textContent = valor;
    contenedor.append(titulo, contenido);
    return contenedor;
  };
  const estado = document.createElement("span");
  estado.className = "pedido__estado";
  estado.textContent = pedido.estado;
  resumen.append(
    datoResumen("Pedido", `#${pedido.numero.slice(0, 8).toUpperCase()}`, true),
    datoResumen("Fecha", fecha),
    datoResumen("Total", formatearPrecio(pedido.total), true),
    estado,
  );
  const items = document.createElement("div");
  items.className = "pedido__items";
  pedido.items.forEach((item) => {
    const fila = document.createElement("div");
    const descripcion = document.createElement("span");
    const nombre = document.createElement("span");
    const unitario = document.createElement("small");
    const subtotal = document.createElement("strong");
    nombre.textContent = `${item.nombre_producto}${item.talla ? ` · Talla ${item.talla}` : ""} × ${item.cantidad}`;
    unitario.textContent = `${formatearPrecio(item.precio_unitario)} por unidad`;
    subtotal.textContent = formatearPrecio(item.subtotal);
    descripcion.append(nombre, unitario);
    fila.append(descripcion, subtotal);
    items.append(fila);
  });
  const envio = document.createElement("div");
  envio.className = "pedido__envio";
  const tituloEnvio = document.createElement("strong");
  const direccion = document.createElement("p");
  const contacto = document.createElement("p");
  tituloEnvio.textContent = "Entrega";
  direccion.textContent = [
    pedido.envio.direccion,
    pedido.envio.ciudad,
    pedido.envio.departamento,
  ].filter(Boolean).join(", ") || "Sin dirección registrada";
  contacto.textContent = `${pedido.envio.destinatario} · ${pedido.envio.telefono}`;
  envio.append(tituloEnvio, direccion, contacto);
  detalle.append(resumen, items, envio);
  return detalle;
}


async function cargarPedidos() {
  elementos.estado.textContent = "Cargando tus pedidos...";
  elementos.lista.replaceChildren();
  try {
    const pedidos = await obtenerPedidos();
    if (pedidos.length === 0) {
      elementos.estado.textContent = "Aún no tienes pedidos. Tu primera compra aparecerá aquí.";
      return;
    }
    elementos.estado.textContent = `${pedidos.length} pedido(s) encontrado(s).`;
    pedidos.forEach((pedido) => elementos.lista.append(crearPedido(pedido)));
  } catch (error) {
    elementos.estado.textContent = "No fue posible cargar tus pedidos.";
    notificar(mensajeDeError(error), "error");
  }
}


export function iniciarPedidos() {
  elementos.abrir?.addEventListener("click", async () => {
    elementos.modal?.showModal();
    await cargarPedidos();
  });
  elementos.cerrar?.addEventListener("click", () => elementos.modal?.close());
  window.addEventListener("pedidos:actualizados", () => {
    if (elementos.modal?.open) cargarPedidos();
  });
}
