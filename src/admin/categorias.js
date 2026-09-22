import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  obtenerCategorias,
} from "../api/catalogo.js";


const elementos = {
  formulario: document.querySelector(
    "#formulario-categoria",
  ),
  categoriaId: document.querySelector(
    "#categoria-id",
  ),
  nombre: document.querySelector(
    "#categoria-nombre",
  ),
  descripcion: document.querySelector(
    "#categoria-descripcion",
  ),
  botonGuardar: document.querySelector(
    "#boton-guardar-categoria",
  ),
  botonCancelar: document.querySelector(
    "#boton-cancelar-edicion",
  ),
  mensaje: document.querySelector(
    "#mensaje-categoria",
  ),
  lista: document.querySelector(
    "#lista-categorias",
  ),
  modalEliminar: document.querySelector(
  "#modal-eliminar-categoria",
),

mensajeEliminar: document.querySelector(
  "#mensaje-eliminar-categoria",
),

botonCancelarEliminacion:
  document.querySelector(
    "#boton-cancelar-eliminacion",
  ),

botonConfirmarEliminacion:
  document.querySelector(
    "#boton-confirmar-eliminacion",
  ),
};


let categoriasActuales = [];
let categoriaPendienteDeEliminar = null;


function mostrarMensaje(
  mensaje,
  esError = false,
) {
  elementos.mensaje.textContent = mensaje;

  elementos.mensaje.classList.toggle(
    "mensaje-error",
    esError,
  );

  elementos.mensaje.classList.toggle(
    "mensaje-exito",
    !esError,
  );
}


function limpiarFormulario() {
  elementos.formulario.reset();
  elementos.categoriaId.value = "";

  elementos.botonGuardar.textContent =
    "Crear categoría";

  elementos.botonCancelar.hidden = true;
}


function crearBoton(
  texto,
  clase,
  manejador,
) {
  const boton = document.createElement("button");

  boton.type = "button";
  boton.textContent = texto;
  boton.className = clase;

  boton.addEventListener(
    "click",
    manejador,
  );

  return boton;
}


function crearFilaCategoria(categoria) {
  const fila = document.createElement("tr");

  const celdaNombre =
    document.createElement("td");

  celdaNombre.textContent = categoria.nombre;

  const celdaDescripcion =
    document.createElement("td");

  celdaDescripcion.textContent =
    categoria.descripcion ||
    "Sin descripción";

  const celdaProductos =
    document.createElement("td");

  celdaProductos.textContent =
    categoria.cantidad_productos ?? 0;

  const celdaAcciones =
    document.createElement("td");

  celdaAcciones.className =
    "tabla-categorias__acciones";

  const botonEditar = crearBoton(
    "Editar",
    "boton-editar",
    () => seleccionarCategoria(categoria),
  );

  const botonEliminar = crearBoton(
    "Eliminar",
    "boton-eliminar",
    () => confirmarEliminacion(categoria),
  );

  celdaAcciones.append(
    botonEditar,
    botonEliminar,
  );

  fila.append(
    celdaNombre,
    celdaDescripcion,
    celdaProductos,
    celdaAcciones,
  );

  return fila;
}


function mostrarCategorias(categorias) {
  elementos.lista.replaceChildren();

  if (categorias.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = 4;
    celda.textContent =
      "No existen categorías registradas.";

    fila.append(celda);
    elementos.lista.append(fila);

    return;
  }

  categorias.forEach((categoria) => {
    elementos.lista.append(
      crearFilaCategoria(categoria),
    );
  });
}


async function cargarCategoriasAdministrativas() {
  try {
    categoriasActuales =
      await obtenerCategorias();

    mostrarCategorias(categoriasActuales);
  } catch (error) {
    console.error(error);

    mostrarMensaje(
      "No fue posible cargar las categorías.",
      true,
    );
  }
}


function seleccionarCategoria(categoria) {
  elementos.categoriaId.value =
    categoria.id;

  elementos.nombre.value =
    categoria.nombre;

  elementos.descripcion.value =
    categoria.descripcion || "";

  elementos.botonGuardar.textContent =
    "Guardar cambios";

  elementos.botonCancelar.hidden = false;

  elementos.nombre.focus();
}


function confirmarEliminacion(categoria) {
  categoriaPendienteDeEliminar = categoria;

  elementos.mensajeEliminar.textContent =
    `¿Deseas eliminar la categoría ` +
    `"${categoria.nombre}"? Esta acción ` +
    `no se puede deshacer.`;

  elementos.modalEliminar.showModal();
}


async function manejarFormulario(evento) {
  evento.preventDefault();

  const categoriaId =
    elementos.categoriaId.value;

  const nombre =
    elementos.nombre.value.trim();

  const descripcion =
    elementos.descripcion.value.trim();

  if (!nombre) {
    mostrarMensaje(
      "El nombre es obligatorio.",
      true,
    );

    elementos.nombre.focus();

    return;
  }

  elementos.botonGuardar.disabled = true;

  try {
    if (categoriaId) {
      await actualizarCategoria(
        categoriaId,
        {
          nombre,
          descripcion,
        },
      );

      mostrarMensaje(
        "Categoría actualizada correctamente.",
      );
    } else {
      await crearCategoria({
        nombre,
        descripcion,
      });

      mostrarMensaje(
        "Categoría creada correctamente.",
      );
    }

    limpiarFormulario();

    await cargarCategoriasAdministrativas();

    window.dispatchEvent(
      new CustomEvent(
        "categorias:actualizadas",
      ),
    );
  } catch (error) {
    console.error(error);

    mostrarMensaje(
      error.message ||
      "No fue posible guardar la categoría.",
      true,
    );
  } finally {
    elementos.botonGuardar.disabled = false;
  }
}


export async function iniciarAdministracionCategorias() {
  elementos.formulario?.addEventListener(
    "submit",
    manejarFormulario,
  );

  elementos.botonCancelar?.addEventListener(
    "click",
    () => {
      limpiarFormulario();
      mostrarMensaje("");
    },
  );

  elementos.botonCancelarEliminacion
  ?.addEventListener(
    "click",
    () => {
      categoriaPendienteDeEliminar = null;
      elementos.modalEliminar.close();
    },
  );

elementos.botonConfirmarEliminacion
  ?.addEventListener(
    "click",
    ejecutarEliminacion,
  );

  await cargarCategoriasAdministrativas();
}

async function ejecutarEliminacion() {
  if (!categoriaPendienteDeEliminar) {
    return;
  }

  const categoria =
    categoriaPendienteDeEliminar;

  elementos.botonConfirmarEliminacion.disabled =
    true;

  elementos.botonConfirmarEliminacion.textContent =
    "Eliminando...";

  try {
    await eliminarCategoria(categoria.id);

    elementos.modalEliminar.close();

    mostrarMensaje(
      "Categoría eliminada correctamente.",
    );

    limpiarFormulario();

    await cargarCategoriasAdministrativas();

    window.dispatchEvent(
      new CustomEvent(
        "categorias:actualizadas",
      ),
    );
  } catch (error) {
    elementos.modalEliminar.close();

    mostrarMensaje(
      error.message ||
      "No fue posible eliminar la categoría.",
      true,
    );
  } finally {
    categoriaPendienteDeEliminar = null;

    elementos.botonConfirmarEliminacion.disabled =
      false;

    elementos.botonConfirmarEliminacion.textContent =
      "Sí, eliminar";
  }
} 