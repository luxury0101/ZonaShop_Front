import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  obtenerCategorias,
  obtenerProductos,
} from "../api/catalogo.js";


const elementos = {
  formulario: document.querySelector(
    "#formulario-producto",
  ),
  productoId: document.querySelector(
    "#producto-id",
  ),
  categoria: document.querySelector(
    "#producto-categoria",
  ),
  nombre: document.querySelector(
    "#producto-nombre",
  ),
  descripcion: document.querySelector(
    "#producto-descripcion",
  ),
  precio: document.querySelector(
    "#producto-precio",
  ),
  existencias: document.querySelector(
    "#producto-existencias",
  ),
  botonGuardar: document.querySelector(
    "#boton-guardar-producto",
  ),
  botonCancelar: document.querySelector(
    "#boton-cancelar-producto",
  ),
  mensaje: document.querySelector(
    "#mensaje-producto",
  ),
  lista: document.querySelector(
    "#lista-productos-admin",
  ),
  modalEliminar: document.querySelector(
    "#modal-eliminar-producto",
  ),
  mensajeEliminar: document.querySelector(
    "#mensaje-eliminar-producto",
  ),
  botonCancelarEliminacion:
    document.querySelector(
      "#boton-cancelar-eliminacion-producto",
    ),
  botonConfirmarEliminacion:
    document.querySelector(
      "#boton-confirmar-eliminacion-producto",
    ),
};


let productoPendienteDeEliminar = null;


function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor));
}


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
  elementos.productoId.value = "";

  elementos.botonGuardar.textContent =
    "Crear producto";

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
  boton.addEventListener("click", manejador);

  return boton;
}


function seleccionarProducto(producto) {
  elementos.productoId.value = producto.id;
  elementos.categoria.value =
    String(producto.categoria);
  elementos.nombre.value = producto.nombre;
  elementos.descripcion.value =
    producto.descripcion || "";
  elementos.precio.value = producto.precio;
  elementos.existencias.value =
    producto.existencias;

  elementos.botonGuardar.textContent =
    "Guardar cambios";

  elementos.botonCancelar.hidden = false;
  elementos.nombre.focus();
}


function abrirConfirmacion(producto) {
  productoPendienteDeEliminar = producto;

  elementos.mensajeEliminar.textContent =
    `¿Deseas eliminar el producto "${producto.nombre}"? ` +
    "Esta acción no se puede deshacer.";

  elementos.modalEliminar.showModal();
}


function crearFilaProducto(producto) {
  const fila = document.createElement("tr");

  const valores = [
    producto.nombre,
    producto.categoria_nombre,
    formatearPrecio(producto.precio),
    producto.existencias,
  ];

  valores.forEach((valor) => {
    const celda = document.createElement("td");
    celda.textContent = valor;
    fila.append(celda);
  });

  const celdaAcciones =
    document.createElement("td");

  celdaAcciones.className =
    "tabla-productos__acciones";

  celdaAcciones.append(
    crearBoton(
      "Editar",
      "boton-editar",
      () => seleccionarProducto(producto),
    ),
    crearBoton(
      "Eliminar",
      "boton-eliminar",
      () => abrirConfirmacion(producto),
    ),
  );

  fila.append(celdaAcciones);

  return fila;
}


function mostrarProductos(productos) {
  elementos.lista.replaceChildren();

  if (productos.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = 5;
    celda.textContent =
      "No existen productos registrados.";

    fila.append(celda);
    elementos.lista.append(fila);

    return;
  }

  productos.forEach((producto) => {
    elementos.lista.append(
      crearFilaProducto(producto),
    );
  });
}


async function cargarCategoriasDelFormulario() {
  const categoriaSeleccionada =
    elementos.categoria.value;

  const categorias = await obtenerCategorias();

  elementos.categoria.replaceChildren();

  const opcionInicial =
    document.createElement("option");

  opcionInicial.value = "";
  opcionInicial.textContent =
    "Selecciona una categoría";

  elementos.categoria.append(opcionInicial);

  categorias.forEach((categoria) => {
    const opcion =
      document.createElement("option");

    opcion.value = categoria.id;
    opcion.textContent = categoria.nombre;

    elementos.categoria.append(opcion);
  });

  const seleccionExiste = Array.from(
    elementos.categoria.options,
  ).some(
    (opcion) =>
      opcion.value === categoriaSeleccionada,
  );

  elementos.categoria.value =
    seleccionExiste
      ? categoriaSeleccionada
      : "";
}


async function cargarProductosAdministrativos() {
  const productos = await obtenerProductos();
  mostrarProductos(productos);
}


async function manejarFormulario(evento) {
  evento.preventDefault();

  const productoId = elementos.productoId.value;
  const categoria = elementos.categoria.value;
  const nombre = elementos.nombre.value.trim();
  const descripcion =
    elementos.descripcion.value.trim();
  const precio = Number(elementos.precio.value);
  const existencias = Number(
    elementos.existencias.value,
  );

  if (!categoria || !nombre) {
    mostrarMensaje(
      "La categoría y el nombre son obligatorios.",
      true,
    );
    return;
  }

  if (!Number.isFinite(precio) || precio <= 0) {
    mostrarMensaje(
      "El precio debe ser mayor que cero.",
      true,
    );
    return;
  }

  if (
    !Number.isInteger(existencias) ||
    existencias < 0
  ) {
    mostrarMensaje(
      "Las existencias deben ser un entero mayor o igual a cero.",
      true,
    );
    return;
  }

  elementos.botonGuardar.disabled = true;

  const datos = {
    categoria,
    nombre,
    descripcion,
    precio,
    existencias,
  };

  try {
    if (productoId) {
      await actualizarProducto(
        productoId,
        datos,
      );

      mostrarMensaje(
        "Producto actualizado correctamente.",
      );
    } else {
      await crearProducto(datos);

      mostrarMensaje(
        "Producto creado correctamente.",
      );
    }

    limpiarFormulario();
    await cargarProductosAdministrativos();

    window.dispatchEvent(
      new CustomEvent(
        "productos:actualizados",
      ),
    );
  } catch (error) {
    mostrarMensaje(
      error.message ||
      "No fue posible guardar el producto.",
      true,
    );
  } finally {
    elementos.botonGuardar.disabled = false;
  }
}


async function ejecutarEliminacion() {
  if (!productoPendienteDeEliminar) {
    return;
  }

  elementos.botonConfirmarEliminacion.disabled =
    true;

  try {
    await eliminarProducto(
      productoPendienteDeEliminar.id,
    );

    elementos.modalEliminar.close();
    limpiarFormulario();

    mostrarMensaje(
      "Producto eliminado correctamente.",
    );

    await cargarProductosAdministrativos();

    window.dispatchEvent(
      new CustomEvent(
        "productos:actualizados",
      ),
    );
  } catch (error) {
    elementos.modalEliminar.close();

    mostrarMensaje(
      error.message ||
      "No fue posible eliminar el producto.",
      true,
    );
  } finally {
    productoPendienteDeEliminar = null;

    elementos.botonConfirmarEliminacion.disabled =
      false;
  }
}


export async function iniciarAdministracionProductos() {
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
        productoPendienteDeEliminar = null;
        elementos.modalEliminar.close();
      },
    );

  elementos.botonConfirmarEliminacion
    ?.addEventListener(
      "click",
      ejecutarEliminacion,
    );

  window.addEventListener(
    "categorias:actualizadas",
    async () => {
      await cargarCategoriasDelFormulario();
      await cargarProductosAdministrativos();
    },
  );

  await Promise.all([
    cargarCategoriasDelFormulario(),
    cargarProductosAdministrativos(),
  ]);
}
