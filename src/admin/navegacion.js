const MODULOS = {
  "/admin": { clave: "inicio", titulo: "Inicio" },
  "/admin/categorias": { clave: "categorias", titulo: "Categorías" },
  "/admin/productos": { clave: "productos", titulo: "Productos" },
  "/admin/pedidos": { clave: "pedidos", titulo: "Pedidos" },
};


function rutaActual() {
  const ruta = window.location.pathname.replace(/\/+$/, "") || "/";
  return MODULOS[ruta] ? ruta : "/admin";
}


function mostrarModulo(usuario) {
  if (usuario?.rol !== "administrador") return;
  const ruta = rutaActual();
  const modulo = MODULOS[ruta];
  if (window.location.pathname.replace(/\/+$/, "") !== ruta) {
    window.history.replaceState({}, "", ruta);
  }
  document.querySelectorAll("[data-vista-admin]").forEach((vista) => {
    vista.hidden = vista.dataset.vistaAdmin !== modulo.clave;
  });
  document.querySelectorAll("[data-ruta-admin]").forEach((enlace) => {
    const activo = enlace.dataset.rutaAdmin === modulo.clave;
    enlace.classList.toggle("navegacion-admin__activo", activo);
    if (activo) enlace.setAttribute("aria-current", "page");
    else enlace.removeAttribute("aria-current");
  });
  const miga = document.querySelector("#miga-actual");
  const nombre = document.querySelector("#nombre-admin");
  const saludo = document.querySelector("#saludo-admin");
  if (miga) miga.textContent = modulo.titulo;
  if (nombre) nombre.textContent = usuario.nombre;
  if (saludo) saludo.textContent = `Hola, ${usuario.nombre}. ¿Qué quieres gestionar hoy?`;
  document.title = `${modulo.titulo} | ZonaShop Admin`;
}


export function obtenerModuloAdminActual() {
  return MODULOS[rutaActual()].clave;
}


export function iniciarNavegacionAdmin() {
  const boton = document.querySelector("#boton-menu-admin");
  const navegacion = document.querySelector("#navegacion-admin");
  boton?.addEventListener("click", () => {
    const abierto = navegacion.classList.toggle("navegacion-admin--abierta");
    boton.setAttribute("aria-expanded", String(abierto));
  });
  window.addEventListener("sesion:cambiada", (evento) => {
    mostrarModulo(evento.detail?.usuario);
  });
}
