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
  botonAgregar: document.querySelector(
    "#detalle-producto-agregar",
  ),
};

let manejadorAgregar = null;


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
  elementos.categoria.textContent =
    producto.categoria_nombre;
  elementos.nombre.textContent = producto.nombre;
  elementos.descripcion.textContent =
    producto.descripcion || "Sin descripción.";
  elementos.precio.textContent =
    formatearPrecio(producto.precio);
  elementos.stock.textContent = producto.agotado
    ? "Agotado"
    : `${producto.existencias} disponible(s)`;

  elementos.stock.classList.toggle(
    "detalle-producto__stock--agotado",
    producto.agotado,
  );

  const tieneImagen = Boolean(producto.imagen);

  elementos.imagen.hidden = !tieneImagen;
  elementos.sinImagen.hidden = tieneImagen;

  if (tieneImagen) {
    elementos.imagen.src = producto.imagen;
    elementos.imagen.alt = producto.nombre;
  } else {
    elementos.imagen.removeAttribute("src");
    elementos.imagen.alt = "";
  }

  elementos.botonAgregar.disabled = producto.agotado;
  elementos.botonAgregar.textContent = producto.agotado
    ? "No disponible"
    : "Agregar al carrito";

  manejadorAgregar = () => alAgregar(producto);
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
}
