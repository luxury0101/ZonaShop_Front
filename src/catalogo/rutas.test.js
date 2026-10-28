import { describe, expect, it } from "vitest";
import {
  analizarRutaCatalogo,
  crearConsultaFiltros,
  crearRutaCategoria,
  crearSlug,
  leerFiltrosBusqueda,
} from "./rutas.js";

describe("rutas del catálogo", () => {
  it("crea URLs legibles y estables para las categorías", () => {
    expect(crearSlug("Chaquetas y buzos")).toBe("chaquetas-y-buzos");
    expect(crearRutaCategoria({ id: 4, nombre: "Camisetas" }))
      .toBe("/categoria/4-camisetas");
  });

  it("reconoce la portada, productos y una categoría", () => {
    expect(analizarRutaCatalogo("/")).toEqual({ tipo: "inicio" });
    expect(analizarRutaCatalogo("/productos/")).toEqual({ tipo: "productos" });
    expect(analizarRutaCatalogo("/categoria/6-vestidos-y-faldas")).toEqual({
      tipo: "categoria",
      id: 6,
      slug: "vestidos-y-faldas",
    });
  });

  it("conserva los filtros en la URL", () => {
    const consulta = crearConsultaFiltros({
      busqueda: "camisa lino",
      orden: "-precio",
      talla: "M",
    });
    expect(consulta).toBe("?buscar=camisa+lino&orden=-precio&talla=M");
    expect(leerFiltrosBusqueda(consulta)).toEqual({
      busqueda: "camisa lino",
      orden: "-precio",
      talla: "M",
    });
  });
});
