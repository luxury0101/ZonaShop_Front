const PAGINAS = {
  "/politicas-de-envio": {
    titulo: "Políticas de envío",
    introduccion: "Consulta cómo preparamos, despachamos y acompañamos la entrega de tu pedido.",
    secciones: [
      {
        titulo: "Preparación del pedido",
        parrafos: [
          "Después de confirmar tu compra, preparamos el pedido en [tiempo de preparación]. Te avisaremos cuando esté listo para despacho.",
        ],
      },
      {
        titulo: "Tiempos y cobertura",
        parrafos: [
          "El tiempo estimado de entrega es [tiempo de entrega] y nuestra cobertura actual comprende [zonas de cobertura].",
          "Los tiempos pueden variar por la ciudad de destino, disponibilidad logística o temporadas de alta demanda.",
        ],
      },
      {
        titulo: "Costo y seguimiento",
        parrafos: [
          "El envío tiene un costo de [costo de envío]. Compartiremos el seguimiento mediante [canal de seguimiento].",
        ],
      },
      {
        titulo: "Datos de entrega",
        parrafos: [
          "Revisa que el nombre, teléfono y dirección estén completos antes de finalizar la compra. Si necesitas corregirlos, contáctanos cuanto antes por correo o WhatsApp.",
        ],
      },
    ],
  },
  "/cambios-y-devoluciones": {
    titulo: "Cambios y devoluciones",
    introduccion: "Queremos que puedas revisar tu compra con claridad y solicitar ayuda cuando algo no salga como esperabas.",
    secciones: [
      {
        titulo: "Plazo para solicitar un cambio",
        parrafos: [
          "Puedes solicitar un cambio dentro de [plazo para cambios] después de recibir el pedido.",
        ],
      },
      {
        titulo: "Condiciones del producto",
        parrafos: [
          "Para aceptar la solicitud, el producto debe cumplir [condiciones para cambios o devoluciones].",
          "No aplican cambios para [productos no elegibles para cambio].",
        ],
      },
      {
        titulo: "Cómo iniciar la solicitud",
        parrafos: [
          "Escríbenos a juancontre845@gmail.com o por WhatsApp e indícanos el número de pedido, el producto y el motivo. El proceso continuará con [pasos para gestionar el cambio].",
        ],
      },
      {
        titulo: "Costos y reembolsos",
        parrafos: [
          "El costo del envío de devolución será [costo de devolución]. Los reembolsos, cuando correspondan, se realizarán en [plazo y método de reembolso].",
        ],
      },
    ],
  },
  "/politica-de-privacidad": {
    titulo: "Política de privacidad",
    introduccion: "Esta política explica qué información utiliza ZonaShop y cómo puedes ejercer control sobre tus datos.",
    secciones: [
      {
        titulo: "Responsable de la información",
        parrafos: [
          "El responsable del tratamiento es [nombre o razón social], identificado con [NIT o documento], con domicilio en [dirección comercial].",
        ],
      },
      {
        titulo: "Datos que utilizamos",
        parrafos: [
          "Podemos recibir los datos de tu cuenta, contacto, dirección y pedido cuando te registras o realizas una compra. No almacenamos el número de tarjeta, su vencimiento ni el CVV.",
        ],
      },
      {
        titulo: "Para qué los utilizamos",
        parrafos: [
          "Usamos la información necesaria para administrar tu cuenta, preparar pedidos, coordinar entregas, responder solicitudes y proteger el funcionamiento de la tienda.",
        ],
      },
      {
        titulo: "Conservación y terceros",
        parrafos: [
          "Conservamos la información durante [periodo de conservación]. Podemos compartir lo estrictamente necesario con [proveedores que intervienen en la operación].",
        ],
      },
      {
        titulo: "Tus derechos",
        parrafos: [
          "Puedes solicitar consulta, corrección, actualización o eliminación de tus datos escribiendo a juancontre845@gmail.com. Atenderemos la solicitud dentro de [plazo de respuesta].",
        ],
      },
    ],
  },
  "/terminos-y-condiciones": {
    titulo: "Términos y condiciones",
    introduccion: "Estas condiciones establecen las reglas de uso del catálogo y de las compras realizadas en ZonaShop.",
    secciones: [
      {
        titulo: "Identificación de la tienda",
        parrafos: [
          "ZonaShop es operada por [nombre o razón social], identificada con [NIT o documento] y ubicada en [dirección comercial].",
        ],
      },
      {
        titulo: "Catálogo y disponibilidad",
        parrafos: [
          "Las imágenes y descripciones ayudan a identificar cada producto. La disponibilidad se confirma con el stock registrado al momento de completar la compra.",
        ],
      },
      {
        titulo: "Precios y pago",
        parrafos: [
          "Los precios se muestran en pesos colombianos. La pasarela actual es una simulación: los datos de tarjeta no se envían, procesan ni almacenan.",
          "Las condiciones definitivas de pago serán [medios de pago y condiciones aplicables].",
        ],
      },
      {
        titulo: "Pedidos y cancelaciones",
        parrafos: [
          "La confirmación y cancelación de pedidos se regirá por [condiciones de confirmación y cancelación]. Para solicitar ayuda, utiliza nuestros canales de contacto.",
        ],
      },
      {
        titulo: "Ley aplicable",
        parrafos: [
          "Estos términos se interpretarán de acuerdo con [legislación y jurisdicción aplicable].",
        ],
      },
    ],
  },
};


function normalizarRuta(ruta) {
  const limpia = ruta.replace(/\/+$/, "");
  return limpia || "/";
}


function crearPagina(configuracion) {
  const articulo = document.createElement("article");
  articulo.className = "pagina-informativa contenedor";

  const cabecera = document.createElement("header");
  cabecera.className = "pagina-informativa__cabecera";
  const titulo = document.createElement("h1");
  const introduccion = document.createElement("p");
  titulo.textContent = configuracion.titulo;
  introduccion.textContent = configuracion.introduccion;
  cabecera.append(titulo, introduccion);

  const cuerpo = document.createElement("div");
  cuerpo.className = "pagina-informativa__cuerpo";
  const indice = document.createElement("nav");
  indice.className = "pagina-informativa__indice";
  indice.setAttribute("aria-label", "Contenido de esta página");
  const tituloIndice = document.createElement("strong");
  tituloIndice.textContent = "En esta página";
  indice.append(tituloIndice);

  const contenido = document.createElement("div");
  contenido.className = "pagina-informativa__contenido";

  configuracion.secciones.forEach((seccion, indiceSeccion) => {
    const id = `seccion-${indiceSeccion + 1}`;
    const enlace = document.createElement("a");
    enlace.href = `#${id}`;
    enlace.textContent = seccion.titulo;
    indice.append(enlace);

    const bloque = document.createElement("section");
    bloque.id = id;
    const subtitulo = document.createElement("h2");
    subtitulo.textContent = seccion.titulo;
    bloque.append(subtitulo);
    seccion.parrafos.forEach((texto) => {
      const parrafo = document.createElement("p");
      parrafo.textContent = texto;
      bloque.append(parrafo);
    });
    contenido.append(bloque);
  });

  const volver = document.createElement("a");
  volver.className = "pagina-informativa__volver";
  volver.href = "/#productos-catalogo";
  volver.textContent = "Volver a la tienda";
  contenido.append(volver);
  cuerpo.append(indice, contenido);
  articulo.append(cabecera, cuerpo);
  return articulo;
}


export function iniciarPaginasInformativas() {
  const ruta = normalizarRuta(window.location.pathname);
  const configuracion = PAGINAS[ruta];
  if (!configuracion) return false;

  const contenedor = document.querySelector("#paginas-informativas");
  document.body.classList.add("ruta-informativa");
  document.title = `${configuracion.titulo} | ZonaShop`;
  contenedor.hidden = false;
  contenedor.replaceChildren(crearPagina(configuracion));
  window.scrollTo({ top: 0, behavior: "auto" });
  return true;
}
