# Guía de Reemplazo Personalizado de Dientes (SVGs)

Esta guía te explica cómo puedes cambiar el dibujo anatómico de cualquier diente del odontograma por tu propio diseño SVG personalizado.

## Archivo de Configuración
Todo el mapeo de los dibujos de los dientes se maneja en el archivo:
[tooth-paths-config.ts](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/components/odontograma/tooth-paths-config.ts)

## Pasos para Reemplazar un Diente por tu propio SVG:

1. **Diseña o descarga tu diente**:
   * Asegúrate de crearlo o escalarlo a una cuadrícula de tamaño **`viewBox="0 0 40 52"`** (ancho 40px, alto 52px) para que cuadre exactamente con la alineación vertical.
   * Diseña el diente en orientación según su arcada:
     * Para **dientes superiores** (piezas que empiezan con 1, 2, 5, 6): raíces apuntando hacia arriba, corona hacia abajo.
     * Para **dientes inferiores** (piezas que empiezan con 3, 4, 7, 8): raíces apuntando hacia abajo, corona hacia arriba.

2. **Separa los trazados en el SVG**:
   Necesitas identificar dos partes de tu diseño SVG:
   * **Trazado Completo del Diente (Raíz + Corona)**: Para dibujar la silueta exterior del diente.
   * **Trazado de la Corona**: Es necesario para que cuando registres un procedimiento de tipo "Corona", el sistema pueda pintar únicamente la corona de color dorado/ámbar en lugar de todo el diente.

3. **Copia las cadenas `path`**:
   Extrae el atributo `d="..."` de las etiquetas de tu SVG.

4. **Regístralo en la lista de reemplazo (`TOOTH_PATHS_OVERRIDES`)**:
   Abre el archivo [tooth-paths-config.ts](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/components/odontograma/tooth-paths-config.ts) y añade el número de la pieza con su configuración.
   
   *Ejemplo para personalizar el diente central incisivo superior derecho (#11):*
   ```typescript
   export const TOOTH_PATHS_OVERRIDES: Record<number, ToothPaths> = {
     11: {
       toothPath: "M 11,30 L 18,6 C 19,4 21,4 22,6 ... (aquí va tu trazado completo)",
       crownPath: "M 11,30 C 11,30 9,48 13,50 ... (aquí va tu trazado de corona)"
     }
   };
   ```

5. **¡Listo!** El sistema cargará automáticamente tu diseño personalizado para ese diente en específico en lugar del diseño estándar.
