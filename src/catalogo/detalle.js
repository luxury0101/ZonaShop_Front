const elementos = {
  modal: document.querySelector("#modal-detalle-producto"),
  botonCerrar: document.querySelector(
    "#boton-cerrar-detalle-producto",
  ),
  imagen: document.querySelector("#detalle-producto-imagen"),
  sinImagen: document.querySelector(
    "#detalle-producto-sin-imagen",
  ),
  categoria: document.querySelector(
    "#detalle-producto-categoria",
  ),
  nombre: document.querySelector("#detalle-producto-nombre"),
  descripcion: document.querySelector(
    "#detalle-producto-descripcion",
  ),
  precio: document.querySelector("#detalle-producto-precio"),
  stock: document.querySelector("#detalle-producto-stock"),
  tallas: document.querySelector("#detalle-producto-tallas"),
  opcionesTalla: document.querySelector("#detalle-producto-opciones-talla"),
  stockBajo: document.querySelector("#detalle-producto-stock-bajo"),
  error: document.querySelector("#detalle-producto-error"),
  botonAgregar: document.querySelector(
    "#detalle-producto-agregar",
  ),
};

let manejadorAgregar = null;
let productoActual = null;
let tallaSeleccionada = "";


function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor));
}


export function abrirDetalleProducto(
  producto,
  alAgregar,
) {
  productoActual = producto;
  tallaSeleccionada = "";
  elementos.error.textContent = "";
  elementos.categoria.textContent =
    producto.categoria_nombre;
  elementos.nombre.textContent = producto.nombre;
  elementos.descripcion.textContent =
    producto.descripcion || "Sin descripción.";
  elementos.precio.textContent =
    formatearPrecio(producto.precio);
  const tallas = Array.isArray(producto.tallas) ? producto.tallas : [];
  const usaTallas = tallas.length > 0;
  elementos.stock.textContent = producto.agotado
    ? "Agotado"
    : usaTallas
      ? "Elige una talla para consultar disponibilidad"
      : `${producto.existencias} disponible(s)`;

  elementos.stock.classList.toggle(
    "detalle-producto__stock--agotado",
    producto.agotado,
  );

  const tieneImagen = Boolean(producto.imagen);

  elementos.imagen.hidden = !tieneImagen;
  elementos.sinImagen.hidden = tieneImagen;
  elementos.sinImagen.textContent = "ZS";

  if (tieneImagen) {
    elementos.imagen.src = producto.imagen;
    elementos.imagen.alt = producto.nombre;
  } else {
    elementos.imagen.removeAttribute("src");
    elementos.imagen.alt = "";
  }

  elementos.tallas.hidden = !usaTallas;
  elementos.opcionesTalla.replaceChildren();
  elementos.stockBajo.hidden = true;
  elementos.stockBajo.textContent = "";

  tallas.forEach((item) => {
    const boton = document.createElement("button");
    const stock = Number(item.stock) || 0;
    boton.type = "button";
    boton.className = "detalle-producto__talla";
    boton.textContent = item.talla;
    boton.disabled = stock < 1;
    boton.setAttribute("aria-pressed", "false");
    boton.setAttribute(
      "aria-label",
      stock < 1 ? `Talla ${item.talla}, agotada` : `Seleccionar talla ${item.talla}`,
    );
    boton.addEventListener("click", () => {
      tallaSeleccionada = item.talla;
      elementos.error.textContent = "";
      elementos.opcionesTalla.querySelectorAll("button").forEach((opcion) => {
        opcion.setAttribute("aria-pressed", String(opcion === boton));
      });
      elementos.stock.textContent = `${stock} disponible(s) en talla ${item.talla}`;
      elementos.stockBajo.textContent = stock <= 5 ? `Quedan ${stock} unidades` : "";
      elementos.stockBajo.hidden = stock > 5;
    });
    elementos.opcionesTalla.append(boton);
  });

  elementos.botonAgregar.disabled = producto.agotado;
  elementos.botonAgregar.textContent = producto.agotado
    ? "No disponible"
    : "Agregar al carrito";

  manejadorAgregar = () => {
    if (usaTallas && !tallaSeleccionada) {
      elementos.error.textContent = "Elige una talla";
      elementos.tallas.focus();
      return;
    }
    const talla = tallas.find((item) => item.talla === tallaSeleccionada);
    alAgregar({
      ...productoActual,
      talla: tallaSeleccionada,
      existencias: talla ? Number(talla.stock) : producto.existencias,
      agotado: talla ? Number(talla.stock) < 1 : producto.agotado,
    });
    elementos.modal.close();
  };
  elementos.modal.showModal();
}


export function iniciarDetalleProducto() {
  elementos.botonCerrar?.addEventListener(
    "click",
    () => elementos.modal?.close(),
  );

  elementos.botonAgregar?.addEventListener(
    "click",
    () => {
      manejadorAgregar?.();
    },
  );

  elementos.modal?.addEventListener(
    "click",
    (evento) => {
      if (evento.target === elementos.modal) {
        elementos.modal.close();
      }
    },
  );

  elementos.modal?.addEventListener("close", () => {
    productoActual = null;
    tallaSeleccionada = "";
    manejadorAgregar = null;
    elementos.error.textContent = "";
  });
}
