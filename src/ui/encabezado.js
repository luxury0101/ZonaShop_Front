import { abrirLogin, obtenerUsuarioActual } from "../auth/sesion.js";

const SELECTOR_INTERACTIVOS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function iniciarEncabezado() {
  const cuerpo = document.body;
  const botonMenu = document.querySelector("#boton-menu");
  const botonCerrarMenu = document.querySelector("#boton-cerrar-menu");
  const menu = document.querySelector("#menu-lateral");
  const overlay = document.querySelector("#overlay-menu");
  const botonFiltros = document.querySelector("#boton-filtros-header");
  const panelFiltros = document.querySelector("#panel-filtros-header");
  const formularioFiltros = document.querySelector("#formulario-filtros");
  const botonCuenta = document.querySelector("#boton-cuenta-header");

  if (!botonMenu || !menu || !overlay || !botonFiltros || !panelFiltros) return;

  let focoAnterior = null;

  function filtrosAbiertos() {
    return !panelFiltros.hidden;
  }

  function establecerFiltros(abiertos, enfocar = false) {
    panelFiltros.hidden = !abiertos;
    botonFiltros.setAttribute("aria-expanded", String(abiertos));
    botonFiltros.setAttribute(
      "aria-label",
      abiertos ? "Cerrar búsqueda y filtros" : "Abrir búsqueda y filtros",
    );
    if (abiertos && enfocar) {
      requestAnimationFrame(() => document.querySelector("#busqueda")?.focus());
    }
  }

  function menuAbierto() {
    return menu.getAttribute("aria-hidden") === "false";
  }

  function establecerMenu(abierto) {
    menu.setAttribute("aria-hidden", String(!abierto));
    overlay.setAttribute("aria-hidden", String(!abierto));
    menu.inert = !abierto;
    botonMenu.setAttribute("aria-expanded", String(abierto));
    botonMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    cuerpo.classList.toggle("menu-publico-abierto", abierto);

    if (abierto) {
      focoAnterior = document.activeElement;
      establecerFiltros(false);
      requestAnimationFrame(() => botonCerrarMenu?.focus());
    } else if (focoAnterior instanceof HTMLElement) {
      focoAnterior.focus();
      focoAnterior = null;
    }
  }

  botonMenu.addEventListener("click", () => establecerMenu(!menuAbierto()));
  botonCerrarMenu?.addEventListener("click", () => establecerMenu(false));
  overlay.addEventListener("click", () => establecerMenu(false));
  botonFiltros.addEventListener("click", () => establecerFiltros(!filtrosAbiertos(), true));

  botonCuenta?.addEventListener("click", () => {
    if (!obtenerUsuarioActual()) {
      establecerMenu(false);
      abrirLogin();
      return;
    }
    establecerMenu(true);
    requestAnimationFrame(() => document.querySelector("#nombre-usuario")?.focus());
  });

  formularioFiltros?.addEventListener("submit", () => establecerFiltros(false));

  menu.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => establecerMenu(false));
  });

  menu.querySelectorAll("button:not(#boton-cerrar-menu)").forEach((boton) => {
    boton.addEventListener("click", () => establecerMenu(false));
  });

  window.addEventListener("sesion:cambiada", (evento) => {
    botonCuenta?.setAttribute(
      "aria-label",
      evento.detail?.usuario ? "Abrir mi cuenta" : "Iniciar sesión",
    );
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      if (menuAbierto()) establecerMenu(false);
      else if (filtrosAbiertos()) {
        establecerFiltros(false);
        botonFiltros.focus();
      }
      return;
    }

    if (evento.key !== "Tab" || !menuAbierto()) return;
    const interactivos = Array.from(menu.querySelectorAll(SELECTOR_INTERACTIVOS))
      .filter((elemento) => !elemento.closest("[hidden]") && elemento.offsetParent !== null);
    if (!interactivos.length) return;
    const primero = interactivos[0];
    const ultimo = interactivos.at(-1);
    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  });
}
