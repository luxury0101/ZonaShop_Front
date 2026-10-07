import {
  cerrarSesion,
  consultarSesion,
  iniciarSesion,
  registrarUsuario,
} from "../api/autenticacion.js";


let usuarioActual = null;


function elementos() {
  return {
    accionesHeader: document.querySelector("#acciones-header"),
    botonMenu: document.querySelector("#boton-menu"),
    botonAbrirLogin: document.querySelector("#boton-abrir-login"),
    botonAbrirRegistro: document.querySelector("#boton-abrir-registro"),
    botonCancelarLogin: document.querySelector("#boton-cancelar-login"),
    botonCancelarRegistro: document.querySelector("#boton-cancelar-registro"),
    botonCerrarSesion: document.querySelector("#boton-cerrar-sesion"),
    formularioLogin: document.querySelector("#formulario-login"),
    formularioRegistro: document.querySelector("#formulario-registro"),
    modalLogin: document.querySelector("#modal-login"),
    modalRegistro: document.querySelector("#modal-registro"),
    mensajeLogin: document.querySelector("#mensaje-login"),
    mensajeRegistro: document.querySelector("#mensaje-registro"),
    nombreUsuario: document.querySelector("#nombre-usuario"),
    zonaInvitado: document.querySelector("#zona-invitado"),
    menuUsuario: document.querySelector("#menu-usuario"),
    enlaceAdministracion: document.querySelector("#enlace-administracion"),
    panelAdministracion: document.querySelector("#panel-administracion"),
  };
}


function mostrarMensaje(elemento, mensaje, esError = false) {
  if (!elemento) return;
  elemento.textContent = mensaje;
  elemento.classList.toggle("mensaje-error", esError);
  elemento.classList.toggle("mensaje-exito", !esError && Boolean(mensaje));
}


function emitirCambioSesion(usuario) {
  window.dispatchEvent(new CustomEvent("sesion:cambiada", {
    detail: { usuario },
  }));
}


function actualizarInterfaz(usuario) {
  const ui = elementos();
  usuarioActual = usuario;
  const autenticado = Boolean(usuario);
  const esAdministrador = usuario?.rol === "administrador";
  const rutaAdmin = window.location.pathname.startsWith("/admin");

  ui.zonaInvitado.hidden = autenticado;
  ui.menuUsuario.hidden = !autenticado;
  ui.enlaceAdministracion.hidden = !esAdministrador;
  ui.panelAdministracion.hidden = !(rutaAdmin && esAdministrador);
  ui.nombreUsuario.textContent = usuario?.nombre || "Mi cuenta";
  document.body.classList.toggle("ruta-admin", rutaAdmin && esAdministrador);

  if (rutaAdmin && autenticado && !esAdministrador) {
    window.history.replaceState({}, "", "/");
    document.body.classList.remove("ruta-admin");
    ui.panelAdministracion.hidden = true;
  }

  emitirCambioSesion(usuario);
}


async function manejarLogin(evento) {
  evento.preventDefault();
  const ui = elementos();
  const formulario = evento.currentTarget;
  const datos = new FormData(formulario);
  const email = String(datos.get("email") || "").trim();
  const password = String(datos.get("password") || "");
  mostrarMensaje(ui.mensajeLogin, "Iniciando sesión...");

  try {
    const respuesta = await iniciarSesion(email, password);
    actualizarInterfaz(respuesta.usuario);
    formulario.reset();
    ui.modalLogin.close();
    if (respuesta.usuario.rol === "administrador") {
      window.location.assign("/admin");
    }
  } catch (error) {
    mostrarMensaje(ui.mensajeLogin, error.message, true);
  }
}


async function manejarRegistro(evento) {
  evento.preventDefault();
  const ui = elementos();
  const formulario = evento.currentTarget;
  const datos = Object.fromEntries(new FormData(formulario));

  if (datos.password !== datos.passwordConfirmacion) {
    mostrarMensaje(ui.mensajeRegistro, "Las contraseñas no coinciden.", true);
    return;
  }

  mostrarMensaje(ui.mensajeRegistro, "Creando cuenta...");
  try {
    const respuesta = await registrarUsuario(datos);
    actualizarInterfaz(respuesta.usuario);
    formulario.reset();
    ui.modalRegistro.close();
  } catch (error) {
    mostrarMensaje(ui.mensajeRegistro, error.message, true);
  }
}


async function manejarLogout() {
  const ui = elementos();
  ui.botonCerrarSesion.disabled = true;
  try {
    await cerrarSesion();
    actualizarInterfaz(null);
    window.location.assign("/");
  } catch (error) {
    window.alert(`No se pudo cerrar sesión: ${error.message}`);
    ui.botonCerrarSesion.disabled = false;
  }
}


function registrarEventos() {
  const ui = elementos();
  ui.botonAbrirLogin?.addEventListener("click", () => ui.modalLogin.showModal());
  ui.botonAbrirRegistro?.addEventListener("click", () => ui.modalRegistro.showModal());
  ui.botonCancelarLogin?.addEventListener("click", () => ui.modalLogin.close());
  ui.botonCancelarRegistro?.addEventListener("click", () => ui.modalRegistro.close());
  ui.formularioLogin?.addEventListener("submit", manejarLogin);
  ui.formularioRegistro?.addEventListener("submit", manejarRegistro);
  ui.botonCerrarSesion?.addEventListener("click", manejarLogout);
  ui.botonMenu?.addEventListener("click", () => {
    const abierto = ui.accionesHeader.classList.toggle("acciones-header--abierto");
    ui.botonMenu.setAttribute("aria-expanded", String(abierto));
  });
}


export async function restaurarSesion() {
  registrarEventos();
  try {
    const respuesta = await consultarSesion();
    const usuario = respuesta.autenticado ? respuesta.usuario : null;
    actualizarInterfaz(usuario);
    if (!usuario && window.location.pathname.startsWith("/admin")) {
      elementos().modalLogin.showModal();
    }
    return usuario;
  } catch (error) {
    console.error("No se pudo consultar la sesión:", error);
    actualizarInterfaz(null);
    return null;
  }
}


export function obtenerUsuarioActual() {
  return usuarioActual;
}
