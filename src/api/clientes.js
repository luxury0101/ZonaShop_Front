import { solicitar } from "./cliente.js";


export function registrarCliente(datos) {
  return solicitar("/clientes/registro/", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}


export function iniciarSesionCliente(email, password) {
  return solicitar("/clientes/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}


export function consultarCliente() {
  return solicitar("/clientes/me/");
}


export function cerrarSesionCliente() {
  return solicitar("/clientes/logout/", { method: "POST" });
}


export function obtenerDirecciones() {
  return solicitar("/clientes/direcciones/");
}


export function crearDireccion(datos) {
  return solicitar("/clientes/direcciones/", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}


export function crearCheckout(direccion, items) {
  return solicitar("/pedidos/checkout/", {
    method: "POST",
    body: JSON.stringify({ direccion, items }),
  });
}


export function obtenerPedidos() {
  return solicitar("/pedidos/");
}
