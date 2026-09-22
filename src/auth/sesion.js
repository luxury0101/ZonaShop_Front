import {
  cerrarSesion,
  consultarSesion,
  iniciarSesion,
} from "../api/autenticacion.js";


let usuarioActual = null;


function obtenerElementos() {
  return {
    botonAbrirLogin: document.querySelector(
      "#boton-abrir-login",
    ),
    
    botonCerrarSesion: document.querySelector(
      "#boton-cerrar-sesion",
    ),
    formularioLogin: document.querySelector(
      "#formulario-login",
    ),
    modalLogin: document.querySelector(
      "#modal-login",
    ),
    mensajeLogin: document.querySelector(
      "#mensaje-login",
    ),
    nombreUsuario: document.querySelector(
      "#nombre-usuario",
    ),
    zonaInvitado: document.querySelector(
      "#zona-invitado",
    ),
    zonaAdministrador: document.querySelector(
      "#zona-administrador",
    ),
  };
}


function mostrarMensaje(
  elemento,
  mensaje,
  esError = false,
) {
  if (!elemento) {
    return;
  }

  elemento.textContent = mensaje;

  elemento.classList.toggle(
    "mensaje-error",
    esError,
  );

  elemento.classList.toggle(
    "mensaje-exito",
    !esError,
  );
}


function actualizarInterfaz(usuario) {
  const elementos = obtenerElementos();

  usuarioActual = usuario;

  const autenticado = Boolean(usuario);

  if (elementos.zonaInvitado) {
    elementos.zonaInvitado.hidden = autenticado;
  }

  if (elementos.zonaAdministrador) {
    elementos.zonaAdministrador.hidden =
      !autenticado;
  }

  if (elementos.nombreUsuario) {
    elementos.nombreUsuario.textContent =
      usuario?.username || "";
  }
}


async function manejarLogin(evento) {
  evento.preventDefault();

  const elementos = obtenerElementos();
  const formulario = evento.currentTarget;
  const datosFormulario = new FormData(formulario);

  const username = String(
    datosFormulario.get("username") || "",
  ).trim();

  const password = String(
    datosFormulario.get("password") || "",
  );

  mostrarMensaje(
    elementos.mensajeLogin,
    "Iniciando sesión...",
  );

  try {
    const respuesta = await iniciarSesion(
      username,
      password,
    );

    actualizarInterfaz(respuesta.usuario);

    mostrarMensaje(
      elementos.mensajeLogin,
      respuesta.detail,
    );

    formulario.reset();

    elementos.modalLogin?.close();
  } catch (error) {
    console.error(
      "Error al iniciar sesión:",
      error,
    );

    mostrarMensaje(
      elementos.mensajeLogin,
      error.message,
      true,
    );
  }
}


async function manejarLogout() {
  const elementos = obtenerElementos();

  if (elementos.botonCerrarSesion) {
    elementos.botonCerrarSesion.disabled = true;
    elementos.botonCerrarSesion.textContent =
      "Cerrando...";
  }

  try {
    await cerrarSesion();

    actualizarInterfaz(null);

    window.location.reload();
  } catch (error) {
    console.error(
      "Error al cerrar sesión:",
      error,
    );

    alert(
      `No se pudo cerrar sesión: ${error.message}`,
    );
  } finally {
    if (elementos.botonCerrarSesion) {
      elementos.botonCerrarSesion.disabled = false;
      elementos.botonCerrarSesion.textContent =
        "Cerrar sesión";
    }
  }
}


function registrarEventos() {
  const elementos = obtenerElementos();

  elementos.botonAbrirLogin?.addEventListener(
    "click",
    () => {
      elementos.modalLogin?.showModal();
    },
  );

  elementos.formularioLogin?.addEventListener(
    "submit",
    manejarLogin,
  );

  elementos.botonCerrarSesion?.addEventListener(
    "click",
    manejarLogout,
  );
}


export async function restaurarSesion() {
  registrarEventos();

  try {
    const respuesta = await consultarSesion();

    actualizarInterfaz(
      respuesta.autenticado
        ? respuesta.usuario
        : null,
    );
  } catch (error) {
    console.error(
      "No se pudo consultar la sesión:",
      error,
    );

    actualizarInterfaz(null);
  }
}


export function obtenerUsuarioActual() {
  return usuarioActual;
}