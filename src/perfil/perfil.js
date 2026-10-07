import { actualizarPerfil, obtenerPerfil } from "../api/autenticacion.js";
import { mensajeDeError, notificar } from "../ui/notificaciones.js";


const elementos = {
  abrir: document.querySelector("#boton-mi-perfil"),
  cerrar: document.querySelector("#boton-cerrar-perfil"),
  modal: document.querySelector("#modal-perfil"),
  formulario: document.querySelector("#formulario-perfil"),
  guardar: document.querySelector("#boton-guardar-perfil"),
  mensaje: document.querySelector("#mensaje-perfil"),
};


function llenarFormulario(perfil) {
  Object.entries(perfil).forEach(([campo, valor]) => {
    if (elementos.formulario?.elements[campo]) {
      elementos.formulario.elements[campo].value = valor || "";
    }
  });
  ["passwordActual", "passwordNueva", "passwordConfirmacion"].forEach((campo) => {
    if (elementos.formulario?.elements[campo]) elementos.formulario.elements[campo].value = "";
  });
}


function validar(datos) {
  if (String(datos.nombre).trim().length < 2) return "Escribe un nombre válido.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(datos.email))) {
    return "Escribe un correo electrónico válido.";
  }
  const direccionIniciada = [
    datos.telefono,
    datos.direccion,
    datos.ciudad,
    datos.departamento,
  ].some((valor) => String(valor || "").trim());
  if (direccionIniciada && [
    datos.telefono,
    datos.direccion,
    datos.ciudad,
    datos.departamento,
  ].some((valor) => !String(valor || "").trim())) {
    return "Completa teléfono, dirección, ciudad y departamento.";
  }
  const cambiaPassword = datos.passwordActual || datos.passwordNueva || datos.passwordConfirmacion;
  if (cambiaPassword) {
    if (!datos.passwordActual) return "Escribe tu contraseña actual.";
    if (String(datos.passwordNueva).length < 8) {
      return "La nueva contraseña debe tener al menos 8 caracteres.";
    }
    if (datos.passwordNueva !== datos.passwordConfirmacion) {
      return "Las contraseñas nuevas no coinciden.";
    }
  }
  return "";
}


async function abrirPerfil() {
  elementos.mensaje.textContent = "Cargando perfil...";
  elementos.modal.showModal();
  try {
    const perfil = await obtenerPerfil();
    llenarFormulario(perfil);
    elementos.mensaje.textContent = "";
  } catch (error) {
    const mensaje = mensajeDeError(error);
    elementos.mensaje.textContent = mensaje;
    notificar(mensaje, "error");
  }
}


async function guardarPerfil(evento) {
  evento.preventDefault();
  const datos = Object.fromEntries(new FormData(elementos.formulario));
  const errorValidacion = validar(datos);
  if (errorValidacion) {
    elementos.mensaje.textContent = errorValidacion;
    elementos.mensaje.className = "mensaje-formulario mensaje-error";
    return;
  }
  elementos.guardar.disabled = true;
  elementos.guardar.classList.add("boton--cargando");
  elementos.mensaje.textContent = "Guardando cambios...";
  try {
    const perfil = await actualizarPerfil(datos);
    llenarFormulario(perfil);
    elementos.mensaje.textContent = "Perfil actualizado correctamente.";
    elementos.mensaje.className = "mensaje-formulario mensaje-exito";
    notificar("Perfil y datos de envío actualizados", "exito");
    window.dispatchEvent(new CustomEvent("perfil:actualizado", {
      detail: { perfil },
    }));
  } catch (error) {
    const mensaje = mensajeDeError(error);
    elementos.mensaje.textContent = mensaje;
    elementos.mensaje.className = "mensaje-formulario mensaje-error";
    notificar(mensaje, "error");
  } finally {
    elementos.guardar.disabled = false;
    elementos.guardar.classList.remove("boton--cargando");
  }
}


export function iniciarPerfil() {
  elementos.abrir?.addEventListener("click", abrirPerfil);
  elementos.cerrar?.addEventListener("click", () => elementos.modal?.close());
  elementos.formulario?.addEventListener("submit", guardarPerfil);
}
