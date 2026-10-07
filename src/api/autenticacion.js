import { clienteApi } from "./cliente.js";


export function registrarUsuario(datos) {
  return clienteApi("/api/auth/registro/", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}


export function iniciarSesion(email, password) {
  return clienteApi("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}


export function consultarSesion() {
  return clienteApi("/api/auth/me/");
}


export function cerrarSesion() {
  return clienteApi("/api/auth/logout/", { method: "POST" });
}


export function obtenerCarritoCuenta() {
  return clienteApi("/api/auth/carrito/");
}


export function guardarCarritoCuenta(items, fusionar = false) {
  return clienteApi("/api/auth/carrito/", {
    method: "PUT",
    body: JSON.stringify({
      items: items.map(({ id, cantidad }) => ({ id, cantidad })),
      fusionar,
    }),
  });
}
