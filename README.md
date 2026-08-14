# Gestor de Negocio

Sistema de gestión de inventario y ventas para pequeños negocios, construido en JavaScript vanilla. Nació de la necesidad real de organizar el inventario de una bodega y de la idea de aplicar en un caso concreto lo aprendido sobre consumo de APIs y persistencia con `localStorage`.

##  Motivación

Quería practicar JavaScript aplicándolo a un problema real, no a un ejercicio abstracto. Pensé en la bodega de un conocido y en cómo un sistema simple podría ayudarle a llevar el control de sus productos, ventas y compras, considerando además la doble moneda (USD/Bs) con la que se maneja el comercio en Venezuela.

##  Funcionalidades

- **Inventario**: registro de productos con nombre, stock y precio en USD.
- **Conversión automática a bolívares** usando la tasa oficial del BCV, obtenida en tiempo real desde [DolarAPI](https://dolarapi.com/).
- **Transacciones**: registro de ventas (salida de stock) y compras (entrada de stock) mediante un sistema de "ticket" con carrito.
- **Historial de movimientos**: cada transacción queda registrada con fecha, tipo y detalle de los productos involucrados.
- **Panel principal**: resumen de ventas totales, stock disponible y alertas de productos con bajo inventario.
- **Persistencia local**: los datos de productos e historial se guardan en `localStorage`, por lo que la información no se pierde al recargar la página.

##  Tecnologías

- JavaScript (ES6+, módulos, clases)
- HTML5 / CSS3
- [DolarAPI](https://dolarapi.com/) para la tasa de cambio
- `localStorage` como capa de persistencia

##  Estructura del proyecto

```
├── index.html
├── styles/
│   └── styles.css
└── js/
    ├── principal.js       # Lógica de la app, eventos y renderizado
    ├── Cl_Producto.js      # Clase Producto
    └── Cl_Inventario.js    # Clase Inventario
```

##  Cómo probarlo

No requiere instalación ni dependencias. Basta con abrir `index.html` en el navegador, o servirlo con cualquier servidor estático (por ejemplo, la extensión "Live Server" de VS Code).

##  Limitaciones conocidas

Este es un proyecto personal de práctica. Cosas que ya identifiqué y que están pendientes:

- El inventario permite **crear** productos, pero aún no **editar** ni **eliminar** desde la interfaz.
- Es un sistema **mono-usuario** (el campo "Usuario" está fijo por ahora, sin login).
- El renderizado de tablas usa `innerHTML` de forma poco eficiente para el tamaño de datos; funciona bien a esta escala pero no está optimizado para crecer.
- Si la API de la tasa de cambio falla, el sistema usa un valor de respaldo que no refleja una tasa real — está pendiente guardar la última tasa válida conocida como fallback.

##  Qué aprendí

- Consumo de APIs externas con `fetch` y manejo de errores con `try/catch`.
- Persistencia de datos en el navegador con `localStorage`.
- Organización de código en módulos y clases de JavaScript.
- Diseño de un flujo de datos consistente entre estado en memoria, interfaz y almacenamiento.
- Validar antes de mutar: en las transacciones, primero se valida todo el carrito y solo después se aplican los cambios, para evitar que los datos queden en un estado inconsistente si algo falla a mitad de camino.

Proyecto personal de aprendizaje — Estudiante de Ingeniería Informática.

