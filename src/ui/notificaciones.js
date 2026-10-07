const DURACION_PREDETERMINADA = 3800;


function obtenerContenedor() {
  let contenedor = document.querySelector("#contenedor-notificaciones");

  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "contenedor-notificaciones";
    contenedor.className = "notificaciones";
    contenedor.setAttribute("aria-live", "polite");
    contenedor.setAttribute("aria-atomic", "false");
    document.body.append(contenedor);
  }

  return contenedor;
}


export function notificar(mensaje, tipo = "informacion", opciones = {}) {
  const tipos = ["exito", "error", "advertencia", "informacion"];
  const tipoSeguro = tipos.includes(tipo) ? tipo : "informacion";
  const notificacion = document.createElement("div");
  const texto = document.createElement("p");
  const cerrar = document.createElement("button");

  notificacion.className = `notificacion notificacion--${tipoSeguro}`;
  notificacion.classList.toggle("notificacion--grande", Boolean(opciones.grande));
  notificacion.setAttribute("role", tipoSeguro === "error" ? "alert" : "status");
  texto.textContent = mensaje;
  cerrar.type = "button";
  cerrar.className = "notificacion__cerrar";
  cerrar.textContent = "×";
  cerrar.setAttribute("aria-label", "Cerrar notificación");
  notificacion.append(texto, cerrar);
  obtenerContenedor().append(notificacion);

  let temporizador;
  const retirar = () => {
    window.clearTimeout(temporizador);
    notificacion.classList.add("notificacion--saliendo");
    window.setTimeout(() => notificacion.remove(), 220);
  };

  cerrar.addEventListener("click", retirar);
  temporizador = window.setTimeout(
    retirar,
    opciones.duracion || DURACION_PREDETERMINADA,
  );

  return { cerrar: retirar, elemento: notificacion };
}


export function mensajeDeError(error, alternativo = "Algo salió mal, intenta de nuevo") {
  if (!error || error.name === "TypeError" || /fetch|network|conexión/i.test(error.message)) {
    return alternativo;
  }
  return error.message || alternativo;
}
