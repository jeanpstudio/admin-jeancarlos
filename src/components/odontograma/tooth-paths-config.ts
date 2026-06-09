export interface ToothPaths {
  toothPath: string; // El dibujo completo del diente (corona + raíz)
  crownPath: string; // Solo el contorno de la corona (para colorearla por piezas)
}

// =========================================================================
// GUÍA DE REEMPLAZO DE SVGs:
// =========================================================================
// Si deseas reemplazar el dibujo de algún diente específico por tu propio diseño SVG:
// 1. Dibuja tu diente en un software vectorial (ej: Figma, Illustrator).
// 2. Exporta el diente en formato SVG con un viewBox de "0 0 40 52" (es el tamaño de cuadrícula usado).
// 3. Obtén las etiquetas <path> del dibujo completo del diente y de su corona por separado.
// 4. Copia las cadenas de texto correspondientes al atributo 'd="..."' y agrégalas al mapa
//    'TOOTH_PATHS_OVERRIDES' debajo con el número del diente correspondiente.
// =========================================================================

// Dibujos por defecto de los dientes (Agrupados por anatomía y orientación)
export const DEFAULT_TOOTH_PATHS: Record<
  "upper_molar" | "upper_premolar" | "upper_incisivo" | "lower_molar" | "lower_premolar" | "lower_incisivo",
  ToothPaths
> = {
  upper_molar: {
    toothPath: "M 8,32 L 10,10 C 11,8 13,8 15,20 L 18,6 C 20,4 22,4 23,20 L 26,8 C 27,6 29,6 32,32 C 32,32 34,50 30,50 L 10,50 C 6,50 8,32 8,32 Z",
    crownPath: "M 8,32 C 8,32 6,50 10,50 L 30,50 C 34,50 32,32 32,32 Z"
  },
  upper_premolar: {
    toothPath: "M 10,32 L 13,10 C 14,8 16,8 18,20 L 20,10 C 21,8 23,8 27,32 C 27,32 32,48 28,48 L 12,48 C 8,48 10,32 10,32 Z",
    crownPath: "M 10,32 C 10,32 8,48 12,48 L 28,48 C 32,48 30,32 30,32 Z"
  },
  upper_incisivo: {
    toothPath: "M 11,30 L 18,6 C 19,4 21,4 22,6 L 29,30 C 29,30 31,48 27,50 L 13,50 C 9,48 11,30 11,30 Z",
    crownPath: "M 11,30 C 11,30 9,48 13,50 L 27,50 C 31,48 29,30 29,30 Z"
  },
  lower_molar: {
    toothPath: "M 8,18 C 8,18 6,0 10,0 L 30,0 C 34,0 32,18 32,18 L 28,40 C 29,42 31,42 25,28 L 22,42 C 20,44 18,44 16,28 L 11,40 C 10,42 9,42 8,18 Z",
    crownPath: "M 8,18 C 8,18 6,0 10,0 L 30,0 C 34,0 32,18 32,18 Z"
  },
  lower_premolar: {
    toothPath: "M 10,16 C 10,16 8,0 12,0 L 28,0 C 32,0 30,16 30,16 L 28,40 C 27,42 25,42 21,40 L 19,26 C 18,26 17,26 14,40 C 13,42 12,42 10,16 Z",
    crownPath: "M 10,16 C 10,16 8,0 12,0 L 28,0 C 32,0 30,16 30,16 Z"
  },
  lower_incisivo: {
    toothPath: "M 11,18 C 11,18 9,0 13,0 L 27,0 C 31,0 29,18 29,18 L 22,42 C 21,44 19,44 18,42 L 11,18 Z",
    crownPath: "M 11,18 C 11,18 9,0 13,0 L 27,0 C 31,0 29,18 29,18 Z"
  }
};

// =========================================================================
// LISTA DE REEMPLAZO POR DIENTE:
// =========================================================================
// Agrega el número de la pieza dental y define sus rutas personalizadas.
// Si hay un diente configurado aquí, se mostrará en lugar del diseño estándar.
// =========================================================================
export const TOOTH_PATHS_OVERRIDES: Record<number, ToothPaths> = {
  // Ejemplo de personalización para la pieza 11:
  // 11: {
  //   toothPath: "M 11,30 L 18,6 C 19,4 21,4 22,6 ...",
  //   crownPath: "M 11,30 C 11,30 9,48 13,50 ..."
  // }
};
