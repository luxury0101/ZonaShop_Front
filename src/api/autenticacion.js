import { clienteApi } from "./cliente.js";


export function iniciarSesion(
  username,
  password,
) {
  return clienteApi("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}


export function consultarSesion() {
  return clienteApi("/api/auth/me/");
}


export function cerrarSesion() {
  return clienteApi("/api/auth/logout/", {
    method: "POST",
  });
}