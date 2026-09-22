import {
  cerrarSesionCliente,
  consultarCliente,
  crearCheckout,
  crearDireccion,
  iniciarSesionCliente,
  obtenerDirecciones,
  obtenerPedidos,
  registrarCliente,
} from "../api/clientes.js";
import {
  obtenerItemsCarrito,
} from "../carrito/carrito.js";


let clienteActual = null;

const elementos = {
  abrir: document.querySelector("#boton-cuenta-cliente"),
  modal: document.querySelector("#modal-cliente"),
  cerrar: document.querySelector("#boton-cerrar-cliente"),
  login: document.querySelector("#formulario-cliente-login"),
  registro: document.querySelector("#formulario-cliente-registro"),
  alternar: document.querySelector("#alternar-formulario-cliente"),
  mensaje: document.querySelector("#mensaje-cliente"),
  sesion: document.querySelector("#cliente-sesion"),
  nombre: document.querySelector("#cliente-nombre"),
  salir: document.querySelector("#boton-salir-cliente"),
  direccion: document.querySelector("#formulario-direccion"),
  selectorDireccion: document.querySelector("#direccion-checkout"),
  pagar: document.querySelector("#boton-pagar-wompi"),
  pedidos: document.querySelector("#lista-pedidos-cliente"),
};


function mensaje(texto, error = false) {
  elementos.mensaje.textContent = texto;
  elementos.mensaje.classList.toggle("mensaje-error", error);
}


function actualizarCliente(usuario) {
  clienteActual = usuario;
  elementos.login.hidden = Boolean(usuario);
  elementos.registro.hidden = true;
  elementos.alternar.hidden = Boolean(usuario);
  elementos.sesion.hidden = !usuario;
  elementos.nombre.textContent = usuario
    ? `${usuario.nombre} ${usuario.apellido}`.trim() || usuario.email
    : "Mi cuenta";
  elementos.abrir.textContent = usuario ? "Mi cuenta" : "Ingresar";
}


async function cargarDirecciones() {
  const direcciones = await obtenerDirecciones();
  elementos.selectorDireccion.replaceChildren();

  const opcion = document.createElement("option");
  opcion.value = "";
  opcion.textContent = direcciones.length
    ? "Selecciona una dirección"
    : "Registra una dirección";
  elementos.selectorDireccion.append(opcion);

  direcciones.forEach((direccion) => {
    const item = document.createElement("option");
    item.value = direccion.id;
    item.textContent =
      `${direccion.nombre}: ${direccion.direccion}, ${direccion.ciudad}`;
    elementos.selectorDireccion.append(item);
  });
}


async function cargarPedidos() {
  const pedidos = await obtenerPedidos();
  elementos.pedidos.replaceChildren();

  if (!pedidos.length) {
    elementos.pedidos.textContent = "Aún no tienes pedidos.";
    return;
  }

  pedidos.slice(0, 5).forEach((pedido) => {
    const item = document.createElement("li");
    item.textContent =
      `${pedido.referencia} — ${pedido.estado} — $${Number(pedido.total).toLocaleString("es-CO")}`;
    elementos.pedidos.append(item);
  });
}


async function prepararCuenta() {
  if (!clienteActual) {
    return;
  }
  await Promise.all([cargarDirecciones(), cargarPedidos()]);
}


async function manejarLogin(evento) {
  evento.preventDefault();
  const datos = new FormData(evento.currentTarget);

  try {
    const respuesta = await iniciarSesionCliente(
      String(datos.get("email")),
      String(datos.get("password")),
    );
    actualizarCliente(respuesta.usuario);
    mensaje("");
    await prepararCuenta();
  } catch (error) {
    mensaje(error.message, true);
  }
}


async function manejarRegistro(evento) {
  evento.preventDefault();
  const datos = Object.fromEntries(
    new FormData(evento.currentTarget).entries(),
  );

  try {
    const respuesta = await registrarCliente(datos);
    actualizarCliente(respuesta.usuario);
    mensaje("");
    await prepararCuenta();
  } catch (error) {
    mensaje(error.message, true);
  }
}


async function manejarDireccion(evento) {
  evento.preventDefault();
  const datos = Object.fromEntries(
    new FormData(evento.currentTarget).entries(),
  );
  datos.principal = true;

  try {
    await crearDireccion(datos);
    evento.currentTarget.reset();
    mensaje("Dirección guardada correctamente.");
    await cargarDirecciones();
  } catch (error) {
    mensaje(error.message, true);
  }
}


async function iniciarPago() {
  const direccion = elementos.selectorDireccion.value;
  const items = obtenerItemsCarrito();

  if (!direccion) {
    mensaje("Selecciona o registra una dirección.", true);
    return;
  }

  if (!items.length) {
    mensaje("El carrito está vacío.", true);
    return;
  }

  elementos.pagar.disabled = true;

  try {
    const respuesta = await crearCheckout(direccion, items);
    window.location.assign(respuesta.checkoutUrl);
  } catch (error) {
    mensaje(error.message, true);
    elementos.pagar.disabled = false;
  }
}


export async function iniciarModuloClientes() {
  elementos.abrir?.addEventListener("click", async () => {
    elementos.modal.showModal();
    await prepararCuenta();
  });
  elementos.cerrar?.addEventListener(
    "click",
    () => elementos.modal.close(),
  );
  elementos.login?.addEventListener("submit", manejarLogin);
  elementos.registro?.addEventListener("submit", manejarRegistro);
  elementos.direccion?.addEventListener("submit", manejarDireccion);
  elementos.pagar?.addEventListener("click", iniciarPago);

  elementos.alternar?.addEventListener("click", () => {
    const mostrarRegistro = elementos.registro.hidden;
    elementos.registro.hidden = !mostrarRegistro;
    elementos.login.hidden = mostrarRegistro;
    elementos.alternar.textContent = mostrarRegistro
      ? "Ya tengo una cuenta"
      : "Crear una cuenta";
  });

  elementos.salir?.addEventListener("click", async () => {
    await cerrarSesionCliente();
    actualizarCliente(null);
    elementos.modal.close();
  });

  try {
    const respuesta = await consultarCliente();
    actualizarCliente(respuesta.usuario);
  } catch {
    actualizarCliente(null);
  }
}
