# ZonaShop Frontend

Interfaz web de ZonaShop construida con HTML, JavaScript, SCSS y Vite. Consume exclusivamente la API REST del backend.

## Requisitos

- Node.js 20.19 o superior.
- Backend de ZonaShop configurado y en ejecución.

## Instalación

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

La interfaz estará disponible en `http://localhost:5173`.

## Configuración

`VITE_API_BASE_URL` define la dirección del backend:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Las variables que comienzan por `VITE_` se incorporan al código compilado y, por tanto, son públicas. No deben contener contraseñas, secretos ni cadenas de conexión a PostgreSQL.

## Comandos

```powershell
npm run dev
npm test
npm run build
npm run preview
```

- `npm run dev`: inicia el servidor local de Vite.
- `npm test`: ejecuta las pruebas automatizadas.
- `npm run build`: genera la versión optimizada en `dist/`.
- `npm run preview`: permite revisar localmente la compilación.

## Estructura principal

- `src/api/`: cliente HTTP y operaciones de la API.
- `src/admin/`: gestión administrativa de categorías y productos.
- `src/auth/`: sesión administrativa.
- `src/carrito/`: carrito y persistencia local.
- `src/catalogo/`: detalle de productos.
- `src/styles/`: estilos SCSS adaptables.
