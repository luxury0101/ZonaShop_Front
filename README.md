# ZonaShop Frontend

Interfaz de ZonaShop construida con HTML, JavaScript, SCSS y Vite. Incluye la
tienda pública, autenticación, carrito, pago simulado y panel administrativo.

## Guía rápida para trabajar en Windows

Configura primero el backend siguiendo el README de
[`ZonaShop_Backend`](https://github.com/luxury0101/ZonaShop_Backend).

### 1. Instalar los programas necesarios

- [Git](https://git-scm.com/download/win).
- [Node.js 22 LTS](https://nodejs.org/).

Comprueba las instalaciones desde PowerShell:

```powershell
git --version
node --version
npm --version
```

El proyecto requiere Node.js 20.19 o superior. Node.js 22 LTS es la opción
recomendada para desarrollo.

### 2. Clonar los dos repositorios

Si todavía no los tienes, ejecuta:

```powershell
New-Item -ItemType Directory -Path ZonaShop -Force
Set-Location ZonaShop
git clone https://github.com/luxury0101/ZonaShop_Backend.git
git clone https://github.com/luxury0101/ZonaShop_Front.git
```

La estructura debe quedar así:

```text
ZonaShop/
├── ZonaShop_Backend/
└── ZonaShop_Front/
```

### 3. Instalar las dependencias del frontend

```powershell
Set-Location ZonaShop_Front
npm install
```

### 4. Crear el archivo `.env`

Desde la carpeta `ZonaShop_Front`, ejecuta:

```powershell
"VITE_API_BASE_URL=http://localhost:8000" | Set-Content -Encoding utf8 .env
```

No guardes contraseñas ni claves privadas en variables `VITE_`: Vite incorpora
esas variables al código que recibe el navegador.

### 5. Comprobar que el backend esté funcionando

En la terminal del backend debe estar ejecutándose:

```powershell
python manage.py runserver
```

Comprueba en el navegador que abre `http://localhost:8000/api/docs/`.

### 6. Iniciar el frontend

```powershell
npm run dev
```

Abre la dirección que muestra Vite, normalmente:

```text
http://localhost:5173
```

Mantén abiertas dos terminales: una con Django en el puerto 8000 y otra con Vite
en el puerto 5173.

### 7. Probar el proyecto

1. Abre `http://localhost:5173`.
2. Crea una cuenta de cliente o inicia sesión.
3. Agrega un producto al carrito.
4. Completa el pago simulado.
5. Revisa el pedido desde **Mis pedidos**.
6. Inicia sesión con el superusuario creado en el backend.
7. Abre `/admin` para gestionar categorías, productos y pedidos.

Si el catálogo está vacío, entra como administrador y crea primero una categoría
y después un producto con existencias.

## Comandos de uso diario

```powershell
Set-Location ZonaShop_Front
npm install
npm run dev
```

Antes de subir cambios ejecuta:

```powershell
npm test
npm run build
```

Otros comandos disponibles:

```powershell
npm run preview
npm run test:e2e
npm run check
```

- `npm test`: ejecuta las pruebas automatizadas.
- `npm run build`: genera la compilación optimizada en `dist/`.
- `npm run test:e2e`: prueba catálogo, carrito y rutas administrativas en Chromium.
- `npm run check`: ejecuta todas las comprobaciones locales.
- `npm run preview`: sirve localmente la última compilación.

## Configuración

`VITE_API_BASE_URL` indica dónde está la API:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Si ejecutas Django en otro puerto, actualiza esa dirección y reinicia Vite.

## Despliegue en Vercel

Despliega primero el backend para conocer su URL pública y luego importa este
repositorio como un segundo proyecto de Vercel. Vercel detecta Vite y usa los
comandos y la carpeta de salida del proyecto automáticamente.

Configura esta variable en **Production**, y también en **Preview** si vas a
probar ramas:

```dotenv
VITE_API_BASE_URL=https://tu-backend.vercel.app
```

Después vuelve a desplegar el frontend. El archivo `vercel.json` incluido hace
que las rutas `/admin`, `/admin/productos` y las demás rutas internas carguen
`index.html` al abrirlas directamente.

No guardes secretos en variables `VITE_`: su contenido queda visible en el
JavaScript enviado al navegador.

## Estructura principal

- `src/api/`: cliente HTTP y operaciones de la API.
- `src/admin/`: categorías, productos, pedidos y navegación administrativa.
- `src/auth/`: registro, login, sesión y roles.
- `src/carrito/`: carrito local y carrito asociado a la cuenta.
- `src/catalogo/`: catálogo y detalle de productos.
- `src/pedidos/`: historial de compras.
- `src/perfil/`: datos personales, dirección y cambio de contraseña.
- `src/ui/`: notificaciones compartidas.
- `src/styles/`: estilos SCSS responsive.

## Rutas principales

- `/`: tienda pública.
- `/admin`: inicio del panel administrativo.
- `/admin/categorias`: gestión de categorías.
- `/admin/productos`: gestión de productos.
- `/admin/pedidos`: gestión de pedidos.

En producción, el hosting debe redirigir estas rutas hacia `index.html` para que
Vite pueda servir la aplicación correctamente.

## Solución de problemas

- **`npm` no se reconoce:** instala Node.js 22 LTS y vuelve a abrir PowerShell.
- **No aparecen productos:** confirma que Django esté activo y que existan
  productos creados desde el panel administrativo.
- **Error de red o CORS:** usa exactamente `http://localhost:5173` para el
  frontend y `http://localhost:8000` para el backend.
- **Puerto 5173 ocupado:** Vite puede elegir otro puerto. Añade esa nueva URL a
  `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` del `.env` del backend.
- **No abre una ruta `/admin/...` directamente:** el servidor de producción debe
  tener configurado el fallback hacia `index.html`.

## Información que GitHub no incluye

El repositorio no contiene el `.env`, la base PostgreSQL ni las imágenes locales
del backend. Cada desarrollador debe preparar esos elementos siguiendo las guías
de ambos repositorios.
