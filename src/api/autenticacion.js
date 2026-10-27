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
      items: items.map(({ id, cantidad, talla = "" }) => ({ id, cantidad, talla })),
      fusionar,
    }),
  });
}


export function completarCompra(items, envio, guardarDireccion = false) {
  return clienteApi("/api/auth/pedidos/", {
    method: "POST",
    body: JSON.stringify({
      items: items.map(({ id, cantidad, talla = "" }) => ({ id, cantidad, talla })),
      envio,
      guardarDireccion,
    }),
  });
}


export function obtenerPedidos() {
  return clienteApi("/api/auth/pedidos/");
}


export function obtenerPerfil() {
  return clienteApi("/api/auth/perfil/");
}


export function actualizarPerfil(datos) {
  return clienteApi("/api/auth/perfil/", {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
}


export function obtenerPedidosAdministracion(estado = "") {
  const consulta = estado ? `?estado=${encodeURIComponent(estado)}` : "";
  return clienteApi(`/api/auth/admin/pedidos/${consulta}`);
}


export function actualizarEstadoPedido(numero, estado) {
  return clienteApi(`/api/auth/admin/pedidos/${numero}/`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}
