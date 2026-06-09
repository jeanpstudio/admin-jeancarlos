# Contexto de Avances - Dashboard Clínico Dental

Este archivo contiene el historial de cambios y avances realizados en el proyecto para asegurar una correcta sincronización entre computadoras cuando se suban los cambios a GitHub.

## Avances del Día (08/06/2026)

### 1. Corrección de Sincronización y Carga de Sesiones
*   **Limpieza de Estado Stale:** Se corrigió un bug por el cual, al cambiar de paciente, el historial y tratamientos del paciente anterior aparecían durante un instante antes de cargar los nuevos (o desaparecer si estaba vacío). Ahora, al seleccionar un paciente se limpian inmediatamente los estados de `tratamientos`, `saldosIndependientes` y `selectedTratamientoDetalle`.
*   **Logs en Base de Datos:** Se habilitaron mensajes de error (`console.error`) en la consola del desarrollador al fallar las consultas remota de Supabase, facilitando la depuración (ej: detectar tablas inexistentes como `saldos_independientes`).
*   **Autoselección de Tratamientos Aceptados:** Al pasar a la pestaña de **Control de Sesiones**, el sistema ahora auto-selecciona automáticamente el primer plan de tratamiento aceptado de ese paciente para mostrar su historial y formulario de inmediato, en lugar de aparecer vacío.
*   **Sincronización de Aceptación en Vivo:** Al hacer clic en el botón "Aceptar Presupuesto", el estado de `selectedTratamientoDetalle` se actualiza reactivamente en la interfaz sin necesidad de recargar la página.

### 2. Rediseño del Odontograma Digital (Alineación y Simetría)
*   **Siluetas Anatómicas Vectoriales:** Se reemplazaron las cajas cuadradas por siluetas SVG de dientes reales (diferenciando molares con múltiples raíces, premolares y caninos/incisivos de una sola raíz).
*   **Simetría Vertical de Arcada:** Los dientes superiores tienen raíces hacia arriba (corona hacia abajo) y los dientes inferiores tienen raíces hacia abajo (corona hacia arriba).
*   **Controles de 5 Caras Centrales:** Se reposicionó el control interactivo (cruz de 5 cuadraditos para marcar caries/curados) de manera que se dibuja **debajo** de los superiores y **arriba** de los inferiores. Esto junta todos los botones de clic en el centro del odontograma.
*   **Capas de Tratamiento Visuales:**
    *   **Coronas:** Pintan la corona del diente anatómico de color dorado/ámbar.
    *   **Endodoncias:** Dibujan una línea discontinua (canal radicular) azul o roja dentro de las raíces del diente.
    *   **Implantes:** Reemplazan la raíz natural por un tornillo de titanio metálico texturizado.
    *   **Ausente/Extracción:** Dibujan una gran aspa "X" (azul o roja) sobre el diente y reducen su opacidad.
    *   **Giroversiones, Fracturas y Diastemas:** Dibujados directamente en sus posiciones correctas sobre la pieza dental.

### 3. Layout en 2 Líneas y Mejoras de Usabilidad
*   **Layout Continuo:** Se unificaron los cuadrantes izquierdo y derecho en una sola fila. El odontograma adulto completo se muestra en exactamente **2 filas continuas** (una superior, otra inferior) separadas por una línea central, facilitando la lectura en un solo golpe de vista.
*   **Desplazamiento Horizontal:** Si la pantalla es pequeña (ej. tabletas), las filas no se rompen en varias líneas, sino que permiten scroll horizontal suave (`overflow-x-auto`).
*   **Visibilidad de Caras:** Se incrementó el grosor de los bordes del control interactivo a `stroke-[1.5]` y se oscurecieron a `stroke-slate-400` para que las divisiones sean visibles en todo momento en lugar de ocultarse hasta pasar el mouse.

### 4. Configuración para Reemplazo de SVGs
*   **Configuración Modular:** Se creó el archivo `src/components/odontograma/tooth-paths-config.ts` que almacena todos los trazados SVG. Permite a cualquier desarrollador modificar o reemplazar el dibujo de cualquier diente individualmente modificando la lista `TOOTH_PATHS_OVERRIDES`.
*   **Guía paso a paso:** Se redactó `src/components/odontograma/TOOTH_REPLACEMENT_GUIDE.md` explicando cómo diseñar y reemplazar los SVGs.

### 5. Auditoría y Limpieza de Archivos
*   **Archivos Eliminados:** Se removieron del repositorio los scripts de pruebas antiguos de la raíz (`test-all.mjs`, `test-insert.mjs`, `test-old-data.mjs`, `test-rls.mjs`, `test-supabase.mjs`, `test-update.mjs`), el helper de proxy en desuso (`src/proxy.ts`) y el middleware raíz (`src/middleware.ts`) que no se utilizaba al operar con llamadas directas desde componentes de cliente.
*   **Limpieza de Estructuras:** Se auditó todo el árbol de carpetas confirmando que no quedan restos de archivos temporales de testeo.

### 6. Diseño Responsivo y Optimización para Tabletas
*   **Sidebar Colapsable en Tabletas:** El menú lateral de navegación (`aside`) ahora se oculta de forma responsiva en pantallas con ancho menor a 1024px (`-translate-x-full lg:translate-x-0`).
*   **Header y Botón Hamburguesa:** Se implementó una cabecera superior visible sólo en dispositivos móviles y tabletas (`lg:hidden`) con el título del consultorio y un botón de hamburguesa (`Menu` icon) para desplegar el menú lateral de forma fluida.
*   **Fondo Semitransparente (Backdrop):** Al abrir el menú en tabletas, se genera un fondo oscuro difuminado (`backdrop-blur-sm`) que permite cerrar el sidebar haciendo clic fuera de él.
*   **Cierre Automático en Navegación:** Al seleccionar cualquier opción de navegación en el sidebar, este se auto-colapsa de inmediato para optimizar el espacio de trabajo en pantalla.
*   **Cuadrícula de Inicio Fluida:** El grid de la página principal ahora permite visualizar las tarjetas y listas en 2 columnas paralelas en tabletas de forma balanceada (`md:grid-cols-3` y `md:col-span-2`), en lugar de colapsar forzosamente a una columna vertical simple como en celulares.

