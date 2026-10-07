import {
  actualizarEstadoPedido,
  obtenerPedidosAdministracion,
} from "../api/autenticacion.js";
import { obtenerUsuarioActual } from "../auth/sesion.js";
import { mensajeDeError, notificar } from "../ui/notificaciones.js";


const ESTADOS = ["pagado", "preparando", "enviado", "entregado", "cancelado"];
const elementos = {
  filtro: document.querySelector("#filtro-estado-pedidos"),
  estado: document.querySelector("#estado-pedidos-admin"),
  lista: document.querySelector("#lista-pedidos-admin"),
};


function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor));
}


function texto(etiqueta, valor) {
  const linea = document.createElement("p");
  const fuerte = document.createElement("strong");
  fuerte.textContent = `${etiqueta}: `;
  linea.append(fuerte, document.createTextNode(valor || "—"));
  return linea;
}


function crearTarjeta(pedido) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "pedido-admin";
  const encabezado = document.createElement("div");
  encabezado.className = "pedido-admin__encabezado";
  const titulo = document.createElement("h3");
  titulo.textContent = `Pedido #${pedido.numero.slice(0, 8).toUpperCase()}`;
  const total = document.createElement("strong");
  total.textContent = formatearPrecio(pedido.total);
  encabezado.append(titulo, total);

  const datos = document.createElement("div");
  datos.className = "pedido-admin__datos";
  const cliente = document.createElement("div");
  cliente.append(
    texto("Cliente", pedido.cliente.nombre),
    texto("Correo", pedido.cliente.email),
    texto("Fecha", new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(pedido.creado_en))),
  );
  const envio = document.createElement("div");
  const direccionCompleta = [
    pedido.envio.direccion,
    pedido.envio.ciudad,
    pedido.envio.departamento,
  ].filter(Boolean).join(", ") || "Sin dirección registrada";
  envio.append(
    texto("Recibe", pedido.envio.destinatario),
    texto("Teléfono", pedido.envio.telefono),
    texto("Dirección", direccionCompleta),
    texto("Indicaciones", pedido.envio.instrucciones),
  );
  datos.append(cliente, envio);

  const productos = document.createElement("ul");
  productos.className = "pedido-admin__productos";
  pedido.items.forEach((item) => {
    const producto = document.createElement("li");
    producto.textContent = `${item.nombre_producto} × ${item.cantidad} — ${formatearPrecio(item.subtotal)}`;
    productos.append(producto);
  });

  const acciones = document.createElement("div");
  acciones.className = "pedido-admin__acciones";
  const selector = document.createElement("select");
  selector.setAttribute("aria-label", `Estado del pedido ${pedido.numero}`);
  ESTADOS.forEach((estado) => {
    const opcion = document.createElement("option");
    opcion.value = estado;
    opcion.textContent = estado[0].toUpperCase() + estado.slice(1);
    opcion.selected = estado === pedido.estado;
    selector.append(opcion);
  });
  const guardar = document.createElement("button");
  guardar.type = "button";
  guardar.textContent = "Actualizar estado";
  guardar.addEventListener("click", async () => {
    guardar.disabled = true;
    guardar.classList.add("boton--cargando");
    try {
      await actualizarEstadoPedido(pedido.numero, selector.value);
      notificar("Estado del pedido actualizado", "exito");
      window.dispatchEvent(new CustomEvent("pedidos:actualizados"));
    } catch (error) {
      notificar(mensajeDeError(error), "error");
    } finally {
      guardar.disabled = false;
      guardar.classList.remove("boton--cargando");
    }
  });
  acciones.append(selector, guardar);
  tarjeta.append(encabezado, datos, productos, acciones);
  return tarjeta;
}


async function cargarPedidos() {
  if (!elementos.lista) return;
  elementos.estado.textContent = "Cargando pedidos...";
  elementos.lista.replaceChildren();
  try {
    const pedidos = await obtenerPedidosAdministracion(elementos.filtro?.value || "");
    elementos.estado.textContent = pedidos.length
      ? `${pedidos.length} pedido(s) encontrado(s).`
      : "No hay pedidos con este estado.";
    pedidos.forEach((pedido) => elementos.lista.append(crearTarjeta(pedido)));
  } catch (error) {
    elementos.estado.textContent = "No fue posible cargar los pedidos.";
    if (error.status !== 403) notificar(mensajeDeError(error), "error");
  }
}


export function iniciarAdministracionPedidos() {
  elementos.filtro?.addEventListener("change", cargarPedidos);
  window.addEventListener("sesion:cambiada", (evento) => {
    if (evento.detail?.usuario?.rol === "administrador" && window.location.pathname.startsWith("/admin")) {
      cargarPedidos();
    }
  });
  window.addEventListener("pedidos:actualizados", () => {
    if (obtenerUsuarioActual()?.rol === "administrador") cargarPedidos();
  });
  if (obtenerUsuarioActual()?.rol === "administrador") cargarPedidos();
}
