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

La dirección puede incluir opcionalmente el sufijo `/api`; el cliente evita duplicarlo al construir las rutas.

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
- `src/auth/`: registro, login unificado, roles y rutas protegidas.
- `src/carrito/`: carrito local para invitados y sincronizado para usuarios.
- `src/catalogo/`: detalle de productos.
- `src/pedidos/`: historial y detalle de compras del usuario.
- `src/perfil/`: datos personales, dirección principal y cambio de contraseña.
- `src/ui/`: notificaciones accesibles y componentes compartidos.
- `src/styles/`: estilos SCSS adaptables.

La arquitectura general, el modelo de datos y la matriz de aceptación se mantienen en el repositorio del backend.

## Flujo de autenticación

- Los invitados pueden registrarse o iniciar sesión desde el header.
- Los clientes ven su nombre, perfil, pedidos y cierre de sesión.
- Los administradores usan el mismo formulario y son enviados a `/admin`.
- El carrito local se fusiona con el carrito guardado al iniciar sesión.
- El pago es una simulación local: los datos de tarjeta se validan en el navegador,
  pero nunca se envían al backend ni se conservan en almacenamiento.
- Al completar la compra, el pedido queda disponible en **Mis pedidos**.
- El checkout permite reutilizar o guardar la dirección principal de entrega.
- El panel administrativo permite filtrar pedidos y actualizar su estado.

Vite atiende `/admin` durante desarrollo. En producción, el hosting del frontend
debe redirigir las rutas de la SPA hacia `index.html`.
