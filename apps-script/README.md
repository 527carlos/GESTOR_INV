# ISERA Portal (PrintTech Systems) — versión Google Apps Script

Este directorio contiene el port completo del proyecto original (React + Express +
`db.json`) a **Google Apps Script**, usando la hoja de cálculo de Google indicada
como base de datos real (reemplaza el archivo `db.json`), con **login real**
(usuario/contraseña), **gestión de contenido** (instructivos, controladores y
videos de capacitación con carga de archivos a Google Drive) y **administración
de usuarios**.

- Hoja de cálculo principal (ID): `1nDzrYnIQ-OoTwWpLwWBYrQGWA0WwTEs7u3wYm__S8FE`
- `Code.gs`: backend (equivalente a `server.ts`): lee/escribe la hoja de cálculo,
  valida datos, aplica permisos por rol, gestiona sesiones y archivos de Drive.
- `Index.html`: frontend de una sola página (equivalente a los componentes React),
  hecho en HTML/CSS (Tailwind vía CDN) + JavaScript vanilla, usando
  `google.script.run` en vez de `fetch`.
- `appsscript.json`: manifiesto del proyecto.

## Módulos

- **Login**: pantalla de inicio de sesión con usuario y contraseña (ver
  credenciales por defecto abajo). No hay acceso a ningún dato sin iniciar sesión.
- **Dashboard**: resumen de casos, instructivos populares y accesos rápidos.
- **Gestión de Casos**: alta/edición/eliminación de casos técnicos con
  validaciones configurables, permisos por rol e historial de auditoría.
- **Instructivos**: biblioteca de manuales **y controladores (drivers)**, con
  pestañas separadas, búsqueda y categorías.
  - **Ver**: abre el instructivo en una **ventana emergente** (modal con vista
    previa embebida) sin necesidad de autorización — cualquier usuario logueado
    puede consultarlo.
  - **Descargar**: requiere que un Admin Tech haya marcado al usuario como
    "Autorizado para descargar" en Gestión de Usuarios; si no, el botón queda
    bloqueado con un aviso.
  - Los **controladores (drivers)** siempre se entregan **comprimidos en
    .zip**, tanto si se subieron directamente como si se vinculó un archivo de
    Drive existente (el backend lo comprime automáticamente al guardarlo).
- **Capacitación**: cursos con progreso simulado y una sección de **videos de
  capacitación** — al seleccionar un video se reproduce en una ventana
  emergente (modal), soportando video subido a Drive, YouTube o URL directa.
- **Contenido** (solo Admin Tech): módulo de configuración para **crear y
  cargar instructivos, controladores y videos**, subiendo el archivo
  directamente (hasta ~20 MB) o pegando un enlace de Google Drive / URL externa
  ya existente.
- **Sheets & Roles**: configuración de la sincronización con Sheets, reglas de
  validación de captura, **Mi Cuenta** (cualquier usuario puede cambiar su
  nombre y contraseña) y **Gestión de Usuarios** (Admin Tech crea usuarios,
  edita rol/nivel, restablece contraseña, elimina usuarios y controla, por
  usuario: **a qué módulos tiene acceso** en el menú — Dashboard, Instructivos,
  Capacitación, Gestión de Casos — y si está **autorizado para descargar**
  instructivos/controladores).
- **Contraste claro/oscuro**: botón (ícono de sol/luna) en el header y en la
  pantalla de inicio de sesión que alterna el tema; la preferencia se guarda
  en el navegador de cada usuario.

## Credenciales por defecto (¡cámbialas de inmediato!)

Al inicializar una hoja de cálculo nueva se crean 3 usuarios de ejemplo:

| Usuario     | Contraseña   | Rol             |
|-------------|--------------|-----------------|
| `admin`     | `admin123`   | Admin Tech      |
| `tecnico3`  | `tecnico123` | Técnico Nvl 3   |
| `tecnico1`  | `tecnico123` | Técnico Nvl 1   |

Inicia sesión y cambia estas contraseñas desde **Sheets & Roles → Mi Cuenta**
tan pronto como despliegues la app. Si ya tenías una hoja de cálculo de una
versión anterior de este proyecto (sin usuario/contraseña), al abrir la app se
les asigna automáticamente un usuario generado a partir de su nombre y la
contraseña temporal `cambiar123`; revisa el log de sincronización para ver a
quién se le generaron credenciales.

## Diferencia clave con el original

En el proyecto original, "Google Sheets" era **simulado** (un arreglo en memoria
dentro de `db.json`); nunca se leía/escribía una hoja real, y los "roles" eran
un simple selector sin contraseña. En esta versión de Apps Script, la hoja de
cálculo indicada **es** la base de datos real, y el acceso requiere iniciar
sesión con una cuenta real guardada en la pestaña `Usuarios` (contraseñas
guardadas como hash SHA-256, nunca en texto plano).

Pestañas que se crean automáticamente en la hoja de cálculo (si no existen):

| Pestaña             | Contenido                                                  |
|---------------------|-------------------------------------------------------------|
| `Casos`             | Casos técnicos (id, cliente, modelo, estado, etc.)          |
| `HistorialCasos`    | Bitácora de auditoría por caso                               |
| `Manuales`          | Instructivos y controladores (con tipo, enlace, drive id)    |
| `Cursos`            | Cursos de capacitación y su progreso                         |
| `VideosCapacitacion`| Videos de capacitación (Drive, YouTube o URL externa)        |
| `Usuarios`          | Usuarios reales (usuario, hash de contraseña, rol)           |
| `Config`            | Config. de Sheets (nombre hoja, rango, auto-sync, etc.)      |
| `ReglasValidacion`  | Reglas de validación del formulario de casos                 |
| `LogsSync`          | Logs de sincronización (máx. 80 más recientes)               |

Los archivos subidos desde el módulo **Contenido** se guardan en Google Drive,
dentro de una carpeta `ISERA Portal - Archivos` (con subcarpetas `Manuales`,
`Controladores` y `Videos`) en el Drive de la cuenta con la que se desplegó la
aplicación.

## Cómo desplegarlo

1. Ve a [script.google.com](https://script.google.com) y crea un **proyecto
   nuevo** (standalone), o usa `clasp` si prefieres línea de comandos.
2. Copia el contenido de `Code.gs` e `Index.html` de esta carpeta a los
   archivos correspondientes del proyecto de Apps Script (deben llamarse
   exactamente así). Para copiar `appsscript.json`, primero actívalo: en el
   editor ve a **⚙️ Configuración del proyecto** y marca "Mostrar el archivo
   de manifiesto 'appsscript.json' en el editor"; luego reemplaza su
   contenido con el de este repositorio (incluye los scopes de Sheets y
   Drive que necesita el módulo de Contenido).
3. Verifica que la constante `SPREADSHEET_ID` en `Code.gs` sea el ID de tu hoja
   de cálculo (ya viene configurado con el ID indicado).
4. En el editor de Apps Script, selecciona la función `initializeSpreadsheet`
   y ejecútala una vez (botón ▶). La primera vez te pedirá autorizar el acceso
   a Google Sheets y Google Drive (necesario para subir instructivos,
   controladores y videos): acepta el diálogo de permisos completo, sin
   omitir el de Drive. Esto crea las pestañas y siembra datos de ejemplo
   — solo rellena las tablas que estén vacías, así que es seguro volver a
   ejecutarla en cualquier momento.
5. Despliega como aplicación web: **Implementar → Nueva implementación →
   Aplicación web**.
   - Ejecutar como: **Yo (tu cuenta)** — así todos los usuarios comparten el
     mismo acceso a la hoja de cálculo y a Drive sin necesitar permisos
     individuales.
   - Quién tiene acceso: elige **Cualquier usuario** (o **Cualquier usuario de
     [tu dominio]** si es uso interno de una organización con Google
     Workspace). El acceso real a los datos lo sigue controlando el login.
6. Abre la URL de la aplicación web, inicia sesión con `admin` / `admin123` y
   cambia la contraseña de inmediato desde Mi Cuenta.

## Solución de problemas

**`Exception: No tienes permiso para llamar a DriveApp.Folder.createFolder`
(o cualquier método de `DriveApp`)**: el proyecto se autorizó antes de tener
el scope de Drive en el manifiesto, o `appsscript.json` no incluye el bloque
`oauthScopes` de este repositorio. Para corregirlo:

1. Muestra el manifiesto (⚙️ Configuración del proyecto → "Mostrar el archivo
   de manifiesto") y confirma que `appsscript.json` tiene:
   ```json
   "oauthScopes": [
     "https://www.googleapis.com/auth/spreadsheets",
     "https://www.googleapis.com/auth/drive"
   ]
   ```
   Si no lo tiene, pégalo desde este repo y guarda.
2. En el editor, selecciona la función `initializeSpreadsheet` (o cualquier
   función) en el desplegable de funciones y ejecútala con ▶. Debe aparecer
   un nuevo diálogo de autorización pidiendo acceso a Google Drive además de
   Sheets — acéptalo completo.
3. Si la app web sigue fallando después de autorizar en el editor, crea una
   **nueva versión** de la implementación: Implementar → Gestionar
   implementaciones → ✏️ (editar) → Versión: **Nueva versión** → Implementar.
   Esto asegura que la app web publicada use la autorización más reciente.
4. Si el error persiste, revisa que la cuenta con la que autorizaste sea la
   misma configurada como "Ejecutar como" (**Yo**) en la implementación, y
   que esa cuenta no tenga restricciones de administrador de Google
   Workspace que bloqueen el scope `drive` para Apps Script (en ese caso, un
   administrador del dominio debe aprobarlo en la consola de administración).

## Notas y limitaciones de seguridad

- Las contraseñas se guardan como **hash SHA-256** en la pestaña `Usuarios`,
  nunca en texto plano. No hay recuperación de contraseña por correo: si un
  usuario la olvida, un Admin Tech debe restablecerla desde **Gestión de
  Usuarios**.
- Las sesiones son tokens aleatorios guardados en `CacheService` (memoria del
  proyecto, no en la hoja) con una duración máxima de 6 horas; pasado ese
  tiempo la app pide iniciar sesión de nuevo automáticamente.
- Los archivos subidos o vinculados desde **Contenido** se comparten como
  "Cualquiera con el enlace puede ver" para que todos los técnicos puedan
  abrirlos sin tener acceso individual al Drive de la cuenta que despliega la
  app. Solo Admin Tech puede subir o vincular archivos.
- Archivo subido directamente: límite de ~20 MB (limitación práctica de
  `google.script.run`). Para videos o archivos más grandes, sube el archivo a
  tu Google Drive manualmente y pega el enlace para compartir en el formulario
  ("Enlace / Drive") en vez de usar "Subir archivo".
- La app hace polling cada ~9 segundos (`google.script.run`) para reflejar
  cambios hechos por otros usuarios.
- Las escrituras (crear/editar/eliminar caso, subir progreso, guardar
  contenido, gestionar usuarios, etc.) usan `LockService` para evitar
  condiciones de carrera cuando varios usuarios escriben al mismo tiempo.
- El campo "Google Spreadsheet ID" que se ve en Configuración es informativo;
  la app siempre usa la hoja definida en la constante `SPREADSHEET_ID` de
  `Code.gs`.
- El **acceso por módulo** (qué pestañas ve cada usuario) oculta las pestañas
  en el menú y evita entrar a ellas desde la interfaz; la autorización de
  **descarga** sí se valida también en el servidor (`downloadManual`
  rechaza la petición si el usuario no está autorizado), igual que todas las
  acciones de administrador (crear/editar/eliminar contenido y usuarios, que
  ya estaban protegidas por rol). Sigue siendo una herramienta interna: no
  hay una capa de permisos por fila en la hoja de cálculo en sí.
- Vincular un archivo de Drive existente como **controlador** descarga su
  contenido, lo comprime y sube una copia nueva a la carpeta del portal —
  para archivos grandes esto puede tardar más que solo compartir el enlace
  original.
