# ISERA Portal (PrintTech Systems) — versión Google Apps Script

Este directorio contiene el port completo del proyecto original (React + Express +
`db.json`) a **Google Apps Script**, usando la hoja de cálculo de Google indicada
como base de datos real (reemplaza el archivo `db.json`).

- Hoja de cálculo principal (ID): `1nDzrYnIQ-OoTwWpLwWBYrQGWA0WwTEs7u3wYm__S8FE`
- `Code.gs`: backend (equivalente a `server.ts`): lee/escribe la hoja de cálculo,
  valida datos, aplica permisos por rol y expone funciones al cliente.
- `Index.html`: frontend de una sola página (equivalente a los componentes React),
  hecho en HTML/CSS (Tailwind vía CDN) + JavaScript vanilla, usando
  `google.script.run` en vez de `fetch`.
- `appsscript.json`: manifiesto del proyecto.

## Qué se conserva del proyecto original

- Los 5 módulos: Dashboard, Gestión de Casos, Biblioteca de Instructivos,
  Capacitación y Configuración (Sheets & Roles).
- Las reglas de validación de captura de casos (regex de ID, longitud mínima de
  cliente, caracteres especiales, modelo obligatorio, descripción obligatoria),
  editables desde la pestaña de Configuración.
- Los 3 roles simulados y sus permisos:
  - **Admin Tech**: acceso total (crear/editar/eliminar casos, configurar Sheets,
    modificar reglas de validación).
  - **Técnico Nvl 3**: crear y editar cualquier caso, sin eliminar ni configurar.
  - **Técnico Nvl 1**: crear casos y editar únicamente los que reportó él mismo.
- El historial de auditoría por caso (quién y cuándo lo creó/modificó).
- La consola de logs de sincronización y el visualizador de la hoja de cálculo.

## Diferencia clave con el original

En el proyecto original, "Google Sheets" era **simulado** (un arreglo en memoria
dentro de `db.json`); nunca se leía/escribía una hoja real. En esta versión de
Apps Script, la hoja de cálculo indicada **es** la base de datos real: cada caso,
manual, curso, usuario, regla y log de sincronización vive en una pestaña de esa
hoja de cálculo.

Pestañas que se crean automáticamente en la hoja de cálculo (si no existen):

| Pestaña            | Contenido                                             |
|---------------------|--------------------------------------------------------|
| `Casos`             | Casos técnicos (id, cliente, modelo, estado, etc.)     |
| `HistorialCasos`    | Bitácora de auditoría por caso                         |
| `Manuales`          | Biblioteca de instructivos                             |
| `Cursos`            | Cursos de capacitación y su progreso                   |
| `Usuarios`          | Usuarios/roles simulados                               |
| `Config`            | Config. de Sheets (nombre hoja, rango, auto-sync, etc.)|
| `ReglasValidacion`  | Reglas de validación del formulario de casos           |
| `LogsSync`          | Logs de sincronización (máx. 80 más recientes)         |

## Cómo desplegarlo

1. Ve a [script.google.com](https://script.google.com) y crea un **proyecto
   nuevo** (standalone), o usa `clasp` si prefieres línea de comandos.
2. Copia el contenido de `appsscript.json`, `Code.gs` e `Index.html` de esta
   carpeta a los archivos correspondientes del proyecto de Apps Script
   (`Code.gs` e `Index.html` deben llamarse exactamente así).
3. Verifica que la constante `SPREADSHEET_ID` en `Code.gs` sea el ID de tu hoja
   de cálculo (ya viene configurado con el ID indicado).
4. En el editor de Apps Script, selecciona la función `initializeSpreadsheet`
   y ejecútala una vez (botón ▶). La primera vez te pedirá autorizar el acceso
   a Google Sheets. Esto crea las pestañas y siembra datos de ejemplo (5 casos,
   4 manuales, 3 cursos, 3 usuarios) igual que el `db.json` original — solo si
   la hoja `Casos` está vacía, así que es seguro volver a ejecutarla.
5. Despliega como aplicación web: **Implementar → Nueva implementación →
   Aplicación web**.
   - Ejecutar como: **Yo (tu cuenta)** — así todos los usuarios comparten el
     mismo acceso a la hoja de cálculo sin necesitar permisos individuales.
   - Quién tiene acceso: elige **Cualquier usuario** (o **Cualquier usuario de
     [tu dominio]** si es uso interno de una organización con Google
     Workspace).
6. Abre la URL de la aplicación web: ahí está el portal funcionando, leyendo y
   escribiendo directamente en tu hoja de cálculo.

## Notas y limitaciones

- Los "roles" siguen siendo **simulados** (como en el proyecto original): no
  hay login real, cualquier persona con acceso a la app puede cambiar de
  usuario activo desde el menú lateral o la pestaña de Configuración. Si se
  necesita autenticación real, se puede extender `Code.gs` usando
  `Session.getActiveUser()` para mapear el correo real a un usuario/rol de la
  pestaña `Usuarios`.
- La app hace polling cada ~9 segundos (`google.script.run`) para reflejar
  cambios hechos por otros usuarios, similar al polling de 3s del original
  (se ajustó el intervalo porque cada llamada a Apps Script es más costosa que
  una petición HTTP local).
- Las escrituras (crear/editar/eliminar caso, subir progreso, etc.) usan
  `LockService` para evitar condiciones de carrera cuando varios usuarios
  escriben al mismo tiempo.
- El campo "Google Spreadsheet ID" que se ve en Configuración es informativo
  (igual que en el original); la app siempre usa la hoja definida en la
  constante `SPREADSHEET_ID` de `Code.gs`.
