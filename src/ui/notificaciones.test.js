// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { notificar } from "./notificaciones.js";


describe("notificaciones", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  it("apila mensajes accesibles de distintos tipos", () => {
    notificar("Guardado", "exito");
    notificar("Revisa el stock", "advertencia");

    const mensajes = document.querySelectorAll(".notificacion");
    expect(mensajes).toHaveLength(2);
    expect(mensajes[0].getAttribute("role")).toBe("status");
    expect(mensajes[1].classList.contains("notificacion--advertencia")).toBe(true);
  });

  it("permite cerrar manualmente una notificación", () => {
    vi.useFakeTimers();
    notificar("Error de prueba", "error");

    document.querySelector(".notificacion__cerrar").click();
    vi.advanceTimersByTime(250);

    expect(document.querySelector(".notificacion")).toBeNull();
  });
});
