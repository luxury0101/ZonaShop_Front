import {
  cerrarSesion,
  consultarSesion,
  iniciarSesion,
  registrarUsuario,
} from "../api/autenticacion.js";
import { mensajeDeError, notificar } from "../ui/notificaciones.js";


let usuarioActual = null;


function elementos() {
  return {
    botonAbrirLogin: document.querySelector("#boton-abrir-login"),
    botonAbrirRegistro: document.querySelector("#boton-abrir-registro"),
    botonCancelarLogin: document.querySelector("#boton-cancelar-login"),
    botonCancelarRegistro: document.querySelector("#boton-cancelar-registro"),
    botonCerrarSesion: document.querySelector("#boton-cerrar-sesion"),
    botonCerrarSesionAdmin: document.querySelector("#boton-cerrar-sesion-admin"),
    botonLogin: document.querySelector("#boton-login"),
    botonRegistro: document.querySelector("#boton-registro"),
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


function mostrarErrorCampo(campo, mensaje) {
  const error = document.querySelector(`#error-${campo.id}`);
  if (error) error.textContent = mensaje;
  campo.setAttribute("aria-invalid", String(Boolean(mensaje)));
}


function validarCampo(campo, formulario) {
  let mensaje = "";
  const valor = campo.value.trim();
  if (!valor) mensaje = "Este campo es obligatorio.";
  else if (campo.type === "email" && !campo.validity.valid) {
    mensaje = "Escribe un correo electrónico válido.";
  } else if (campo.name === "nombre" && valor.length < 2) {
    mensaje = "El nombre debe tener al menos 2 caracteres.";
  } else if (campo.name === "password" && formulario.id === "formulario-registro" && campo.value.length < 8) {
    mensaje = "La contraseña debe tener al menos 8 caracteres.";
  } else if (campo.name === "passwordConfirmacion") {
    const password = formulario.elements.password?.value || "";
    if (campo.value !== password) mensaje = "Las contraseñas no coinciden.";
  }
  mostrarErrorCampo(campo, mensaje);
  return !mensaje;
}


function validarFormulario(formulario) {
  return Array.from(formulario.querySelectorAll("input"))
    .map((campo) => validarCampo(campo, formulario))
    .every(Boolean);
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
    sessionStorage.setItem(
      "zonashop_notificacion",
      "No tienes permisos para acceder al panel de administración.",
    );
    window.location.assign("/");
    return;
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
  if (!validarFormulario(formulario)) return;
  ui.botonLogin.disabled = true;
  ui.botonLogin.classList.add("boton--cargando");
  mostrarMensaje(ui.mensajeLogin, "Iniciando sesión...");

  try {
    const respuesta = await iniciarSesion(email, password);
    actualizarInterfaz(respuesta.usuario);
    formulario.reset();
    ui.modalLogin.close();
    notificar(`Bienvenido, ${respuesta.usuario.nombre}`, "exito");
    if (respuesta.usuario.rol === "administrador") {
      sessionStorage.setItem("zonashop_notificacion", `Bienvenido, ${respuesta.usuario.nombre}`);
      window.location.assign("/admin");
    }
  } catch (error) {
    const mensaje = mensajeDeError(error);
    mostrarMensaje(ui.mensajeLogin, mensaje, true);
    notificar(mensaje, "error");
  } finally {
    ui.botonLogin.disabled = false;
    ui.botonLogin.classList.remove("boton--cargando");
  }
}


async function manejarRegistro(evento) {
  evento.preventDefault();
  const ui = elementos();
  const formulario = evento.currentTarget;
  const datos = Object.fromEntries(new FormData(formulario));

  if (!validarFormulario(formulario)) return;

  ui.botonRegistro.disabled = true;
  ui.botonRegistro.classList.add("boton--cargando");
  mostrarMensaje(ui.mensajeRegistro, "Creando cuenta...");
  try {
    const respuesta = await registrarUsuario(datos);
    actualizarInterfaz(respuesta.usuario);
    formulario.reset();
    ui.modalRegistro.close();
    notificar("Registro exitoso. Tu cuenta está lista.", "exito");
  } catch (error) {
    const mensaje = mensajeDeError(error);
    mostrarMensaje(ui.mensajeRegistro, mensaje, true);
    notificar(mensaje, "error");
  } finally {
    ui.botonRegistro.disabled = false;
    ui.botonRegistro.classList.remove("boton--cargando");
  }
}


async function manejarLogout() {
  const ui = elementos();
  ui.botonCerrarSesion.disabled = true;
  try {
    await cerrarSesion();
    actualizarInterfaz(null);
    if (window.location.pathname !== "/") {
      sessionStorage.setItem("zonashop_notificacion", "Sesión cerrada correctamente.");
      window.location.assign("/");
    } else {
      notificar("Sesión cerrada correctamente.", "informacion");
    }
  } catch (error) {
    notificar(mensajeDeError(error), "error");
    ui.botonCerrarSesion.disabled = false;
  }
}


export function abrirLogin() {
  const ui = elementos();
  mostrarMensaje(ui.mensajeLogin, "");
  ui.modalLogin?.showModal();
  document.querySelector("#login-email")?.focus();
}


function registrarEventos() {
  const ui = elementos();
  ui.botonAbrirLogin?.addEventListener("click", abrirLogin);
  ui.botonAbrirRegistro?.addEventListener("click", () => ui.modalRegistro.showModal());
  ui.botonCancelarLogin?.addEventListener("click", () => ui.modalLogin.close());
  ui.botonCancelarRegistro?.addEventListener("click", () => ui.modalRegistro.close());
  ui.formularioLogin?.addEventListener("submit", manejarLogin);
  ui.formularioRegistro?.addEventListener("submit", manejarRegistro);
  [ui.formularioLogin, ui.formularioRegistro].forEach((formulario) => {
    formulario?.querySelectorAll("input").forEach((campo) => {
      campo.addEventListener("input", () => validarCampo(campo, formulario));
      campo.addEventListener("blur", () => validarCampo(campo, formulario));
    });
  });
  ui.botonCerrarSesion?.addEventListener("click", manejarLogout);
  ui.botonCerrarSesionAdmin?.addEventListener("click", manejarLogout);
  window.addEventListener("perfil:actualizado", (evento) => {
    if (!usuarioActual) return;
    actualizarInterfaz({
      ...usuarioActual,
      nombre: evento.detail?.perfil?.nombre || usuarioActual.nombre,
      email: evento.detail?.perfil?.email || usuarioActual.email,
    });
  });
}


export async function restaurarSesion() {
  registrarEventos();
  const notificacionPendiente = sessionStorage.getItem("zonashop_notificacion");
  if (notificacionPendiente) {
    sessionStorage.removeItem("zonashop_notificacion");
    notificar(notificacionPendiente, "exito");
  }
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
