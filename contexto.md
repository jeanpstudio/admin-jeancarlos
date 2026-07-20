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


## Avances del Día (09/07/2026)

### 1. Flexibilidad en Datos del Paciente (DNI Opcional y Corrección de Claves Duplicadas)
*   **DNI Opcional:** Se eliminó la validación Javascript y el atributo HTML `required` del campo de DNI / Pasaporte en el formulario de registro de paciente ([historia-clinica-form.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/components/pacientes/historia-clinica-form.tsx)), permitiendo guardar historias clínicas sin obligar a registrar un documento.
*   **Tratamiento de Nulos contra Unicidad:** Para prevenir que múltiples pacientes sin DNI colisionaran en Supabase arrojando un error de clave duplicada (`pacientes_dni_key` UNIQUE constraint), se implementó una limpieza en `handleCreatePaciente` y `handleUpdateHistory` en [page.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/app/page.tsx) para transformar cualquier cadena de DNI vacía o con espacios en `null` antes de enviarla a la base de datos.
*   **Corrección de Sesiones Clínicas:** Esto solucionó un error por el cual la creación de pacientes y la proforma fallaban en Supabase (cayendo silenciosamente al localStorage local con IDs temporales) y provocaba que las sesiones de evolución no se reflejaran correctamente en el panel de control de sesiones al recargar.

### 2. Edición Inline e Impresión de Saldos Independientes
*   **Edición Directa en Fila:** Se agregaron estados reactivos para edición inline (`editingSaldoId`, `editingSaldoFecha`, `editingSaldoProcedimiento`, `editingSaldoMonto`) en la tabla de saldos independientes dentro de la ficha de paciente. Ahora, las filas se transforman en inputs editables permitiendo corregir conceptos, montos o fechas, persistiendo los datos de inmediato en Supabase (y en `localStorage` como respaldo).
*   **Impresión de Reporte de Saldos:** Se agregó un botón de **Imprimir Reporte** en la cabecera del registro de saldos. Este genera un formato de impresión HTML estilizado y elegante con membrete del consultorio, datos filiatorios del paciente (Nombre, DNI, teléfono), fecha de reporte, tabla detallada de saldos independientes, suma totalizada de saldo pendiente y área de firma/sello clínico, disparando la ventana de impresión nativa y auto-cerrándose tras finalizar.

### 3. Antecedentes Médicos Dinámicos y Resaltado de Alertas
*   **Tarjetas de Alerta Roja:** Se estandarizó el diseño de los antecedentes médicos del expediente del paciente (Alergias, Enfermedades Sistémicas, Medicamentos Consumidos y Hemorragias) en [page.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/app/page.tsx).
*   **Detección Inteligente de Anamnesis Positiva:** Mediante un validador dinámico, el sistema de detección revisa si el paciente registra alguna condición clínica real (ignorando textos vacíos o palabras clave como "ninguna", "ninguno", "no", "no presenta") y pinta la tarjeta del antecedente con bordes y fondo rojos translúcidos llamativos, manteniendo un tono gris sutil si el antecedente está libre de alertas.

### 4. Odontograma Simultáneo (Adulto + Infantil) y Ampliación a Pantalla Completa
*   **Visualización Paralela de Dentición:** Se modificó [odontograma.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/components/odontograma/odontograma.tsx) para omitir la reducción automática de arcadas basada en edad. Por defecto, ahora se muestran la arcada Permanente (Adulto) y Temporal (Niño) al mismo tiempo en el lienzo, ideal para pacientes con dentición mixta.
*   **Modal Portalizado a Pantalla Completa:** Se implementó una función de maximización interactiva ("Ampliar") en todos los odontogramas de la aplicación. Al hacer clic, se proyecta el componente odontograma completo a través de un **React Portal** directo sobre el `document.body` dentro de un modal fixed con fondo translúcido desenfocado (`backdrop-blur-md`), asegurando máxima escala de trabajo y comodidad visual para el odontólogo.

### 5. Corrección de Visualización de Estados Iniciales y Sellantes
*   **Endodoncia de Ingreso Dibujada:** Se corrigió en [diente-svg.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/components/odontograma/diente-svg.tsx) el cálculo radicular para incluir `diag.endodoncia_inicial`, logrando que las endodoncias marcadas en el estado inicial de ingreso se dibujen visualmente en los conductos del diente. Las endodoncias calificadas como "buenas" se representan en azul, y las "malas" en rojo.
*   **Macrodoncia y Microdoncia Reales:** Se implementaron clases de escala Tailwind dinámicas (`scale-110` / `scale-90`) en la anatomía del diente que agrandan o encogen el gráfico del diente en respuesta directa a si tiene marcada macrodoncia o microdoncia.
*   **Inicial de Sellante "S":** Se incorporó el tratamiento de **Sellante** (`proc.sellante`) como inicial de texto `"S"` debajo de las piezas dentales en el odontograma de plan de tratamiento.

### 6. Homogeneización Estética de Botones (Verde Esmeralda)
*   **Estilo Premium Unificado:** Se reemplazó el color turquesa/azul de los botones de acción principal (como registrar paciente, guardar diagnóstico inicial, registrar sesión de evolución, imprimir y guardar proformas) por un color verde esmeralda premium (`bg-emerald-600 hover:bg-emerald-700 text-white`) con sombreados adaptativos, mejorando la coherencia visual con la identidad de marca de la clínica.

### 7. Reset de Piezas al Cambiar Procedimiento en Proformas
*   **Limpieza de Selección en Proformas:** Se modificó la selección de procedimientos en el calculador de proformas ([presupuesto-calculador.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/components/tratamientos/presupuesto-calculador.tsx)) para que, si el odontólogo cambia de procedimiento en el dropdown select, se limpien automáticamente las piezas dentales seleccionadas activamente, previniendo errores involuntarios al estructurar presupuestos compuestos.


## Avances del Día (20/07/2026)

### 1. Optimizaciones del Odontograma y Diseño Clínico
*   **Eliminación de la Leyenda:** Se removió la barra de "Leyenda de Estados Clave" de [odontograma.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/components/odontograma/odontograma.tsx) para limpiar y maximizar el área de visualización.
*   **Arcadas de Niño al Centro:** Se reordenaron las arcadas dentales de manera que la dentición temporal (infantil) quede posicionada en las filas centrales (Filas 2 y 3) y la permanente (adulto) en las exteriores (Filas 1 y 4), mejorando la lógica visual y simetría anatómica.
*   **Unificación y Alineación de Corona-Raíz:** En [diente-svg.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/components/odontograma/diente-svg.tsx), se alinearon la cruz interactiva (caras de la corona) siempre arriba y el gráfico anatómico (diente/raíz) abajo. Para los dientes superiores, se aplicó un flip vertical (`scale-y-[-1]`) logrando que todas las coronas del odontograma queden arriba (pegadas a la cruz de caras) y las raíces apunten hacia abajo uniformemente.
*   **Siglas y Letras más Grandes:** Se agrandó el tamaño de letra de las mini-etiquetas e iniciales de diagnósticos y procedimientos ubicadas debajo del diente a `text-[10px]` para mejorar la legibilidad.

### 2. Buscador Dinámico de Diagnósticos y Procedimientos
*   **Buscador en Estado Inicial:** Se reemplazó la rejilla estática de botones dentro del modal de pieza por un buscador dinámico que filtra patologías en tiempo real. Los diagnósticos aplicados se muestran abajo en forma de tags con botón de eliminación individual `✕`, manteniendo en la base el botón para **Restaurar Pieza Sana**.
*   **Buscador en Calculadora de Presupuestos:** Se reemplazó el select clásico de procedimientos en [presupuesto-calculador.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/components/tratamientos/presupuesto-calculador.tsx) por una entrada de autocompletado dinámica reactiva.
*   **Teclado Dinámico de Piezas:** Se actualizó la lógica de parseo en el campo de piezas para que el odontólogo pueda teclear directamente números separados por comas, espacios o punto y coma de forma libre.

### 3. Lógica Financiera de Presupuestos
*   **Precios Manuales:** Se eliminaron las referencias a precios base preestablecidos en el catálogo. Ahora, cada selección inicia en `0.00` y el odontólogo digita manualmente el costo unitario por cada tratamiento.
*   **Aceptación Automática:** Se configuró el sistema en [page.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/app/page.tsx) para que, si un presupuesto se guarda con un adelanto mayor a `0` (`adelanto > 0`), este sea guardado automáticamente con el estado de `presupuesto_aceptado` (Aceptado).

### 4. Soporte Histórico para Pacientes Antiguos
*   **Toggle de Paciente Antiguo:** Se integró un control switch en el registro del paciente para marcarlo como antiguo. Al activarse, permite ingresar una fecha de registro histórica (pasada).
*   **Fechas Históricas Generales:** Si el paciente es antiguo, se habilita la asignación de fechas pasadas tanto para presupuestos de tratamientos en la calculadora como para la adición de sesiones clínicas en el historial.

### 5. Finalización de Lógica de Persistencia, Fechas Pasadas y Auto-Aceptación
*   **Fechas Históricas Guardadas:** Se completó la lógica de persistencia en [page.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/app/page.tsx) para recibir y guardar la fecha histórica en la ficha del paciente (en fallbacks offline), el presupuesto (tratamientos) y los logs de sesiones de evolución clínica si el paciente está configurado como antiguo.
*   **Auto-Aceptación de Presupuestos Activa:** Se integró la lógica en [page.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/app/page.tsx) para guardar de forma automatizada en estado "Aceptado" todo presupuesto que registre un pago/adelanto inicial mayor a `0` (`adelanto > 0`), agilizando el flujo de trabajo.
*   **Alineación de Base de Datos:** Se actualizó [schema.sql](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/supabase/schema.sql) para reflejar los campos reales utilizados por el dashboard de pacientes y presupuestos.

### 6. Ajustes Visuales del Odontograma y Observaciones de Pieza
*   **Acoplamiento de Corona y Raíz:** Se rediseñó en [diente-svg.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/components/odontograma/diente-svg.tsx) el espaciado vertical (`gap-0`) y se alinearon los anchos (`w-[32px]`) y solapes para que la corona (cruz) y el dibujo anatómico del diente queden perfectamente juntos y alineados.
*   **Observaciones Clínicas por Pieza:** Se integró un cuadro de observaciones en el modal de diagnóstico inicial de [odontograma.tsx](file:///Users/jeanpstudio/Desktop/Apps/admin-jeancarlos/src/components/odontograma/odontograma.tsx), guardándose directamente de manera reactiva en el objeto JSONB de cada diente.
*   **Representación Visual de Procedimientos y Diagnósticos:**
    *   **Fractura:** Dibujada con una línea recta diagonal roja sólida cruzando toda la pieza.
    *   **Radiografía (RX) y Remanente (RR):** Dibujados de manera superpuesta y recta en el centro de la pieza (sin invertirse en los superiores).
    *   **Corona Metálica:** Se muestra con la inicial `"CM"` en un recuadro con borde arriba del diente.
    *   **Endodoncia:** Línea sólida y gruesa (azul si es buen estado inicial, roja si es mal estado inicial o procedimiento).
    *   **Abreviaturas unificadas:** Perno Muñón como `"PM"`, Carillas como `"C"`, Resinas como `"R"`. Se limitaron las etiquetas inferiores a mostrar únicamente la inicial del primer tratamiento activo para evitar sobrecarga textual.


