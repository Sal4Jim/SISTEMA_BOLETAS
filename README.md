# 🍽️ PK2 - Sistema de Gestión de Restaurante

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-orange)

Este es un sistema que proporciona una solución integral diseñada para optimizar las operaciones diarias de un restaurante.
Originalmente diseñado para el restaurant PK2, sin embargo se puede modificar para diferentes tipos de restaurantes.
Permite la gestión eficiente de comandas, el control de inventario de productos y la generación de reportes detallados para la toma de decisiones.

## 🚀 Características Principales

### 🛒 Punto de Venta (Comandas)

- Envío directo de pedidos a cocina y barra.
- Selección dinámica de mesas.
- Lógica inteligente de precios: Aplicación automática de descuentos para combos (ej: Menú + Entrada = S/ 12.00).

###  Aplicación Móvil (Mozos)
- **IMPORTANTE**: Al momento de crear el APK del app, no olvides colocarle la ip de tu servidor en la configuración.
- **Pedidos desde el Celular**: Permite a los mozos realizar pedidos directamente desde sus dispositivos móviles ANDROID, agilizando el servicio.
- **Funcionalidad Completa**: Replica todas las funciones del módulo de comandas web.
- **Control de Disponibilidad**: Incluye un apartado para activar o desactivar productos (como el menú diario o las entradas) en tiempo real, sincronizado con todo el sistema.

### 📦 Gestión de Inventario

- CRUD completo de productos con soporte para imágenes.
- **Acceso Rápido**: Interruptores (Toggles) para activar/desactivar productos instantáneamente sin entrar al panel de edición.
- Clasificación por categorías dinámicas.

### 📊 Reportes y Seguridad

- Visualización de ventas diarias y total recaudado.
- Reimpresión de notas de venta y tickets de cocina.
- **Seguridad Robusta**: Acceso a reportes protegido mediante JWT (JSON Web Tokens) con sistema de "Token en Memoria" para evitar persistencia insegura en el navegador.

### 🖨️ Impresión Térmica

- Integración con impresoras térmicas de red (TCP/IP).
- Formateo profesional de tickets de comanda y reportes diarios.

## 🛠️ Stack Tecnológico

- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL / MariaDB
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Autenticación**: JSON Web Token (JWT) & Bcryptjs
- **Impresión**: ESC/POS para Node.js
- **Aplicación Móvil (Android)**:
  - **Lenguaje**: Java / Kotlin
  - **Arquitectura**: ViewBinding para vinculación de vistas.
  - **Comunicación**: Retrofit 2 + OkHttp (para peticiones a la API).
  - **Gestión de Imágenes**: Glide (visualización de fotos de productos).
  - **Diseño**: Material Components para una interfaz moderna y coherente.

## 📋 Requisitos del Sistema

### Servidor & Web

- **Node.js**: v16.0 o superior.
- **MySQL/MariaDB**: v5.7 o superior.
- **Navegador**: Google Chrome, Firefox o Edge (versiones recientes).

### Aplicación Móvil

- **SO**: Android 7.0 (API 24) o superior.
- **Hardware Requerido**:
  - Conexión a la misma red local (Wi-Fi) del servidor.
  - Cámara (si se desea integrar escaneo de códigos en el futuro).

### Impresión

- **Impresora**: Impresora térmica compatible con ESC/POS conectada a la red local (Ethernet/Wi-Fi).
- **Protocolo**: TCP/IP (Puerto 9100 por defecto).

## 🗄️ Base de Datos (MySQL)

El sistema utiliza una base de Datos relacional para gestionar la persistencia. Puedes encontrar el esquema completo en el archivo `boletera_bd.sql`.

### Tablas Principales:

- **`categoria`**: Clasificación de productos (Menú, Carta, Bebidas, etc.).
- **`producto`**: Catálogo de platos y bebidas con su precio y estado de disponibilidad.
- **`ticket`**: Cabecera de las comandas enviadas (Mesa, total estimado, fecha).
- **`detalle_ticket`**: Relación de productos incluidos en cada ticket.
- **`metodo_pago`**: Catálogo de medios de pago (Efectivo, Yape, Tarjeta).
- **`usuario`**: Credenciales de acceso para el panel de reportes.



## ⚙️ Configuración del Entorno (`.env`)

Crea un archivo llamado `.env` en la raíz del proyecto y configura las siguientes variables (puedes usar este ejemplo como plantilla):

```env
# Servidor
PORT=3000

# Base de Datos
DB_HOST=
DB_USER=root
DB_PASSWORD=
DB_NAME=boletera_bd

# Seguridad
JWT_SECRET=TuClaveSecretaMuyLargaYSeguraAquí
```

## 🛠️ Instalación y Uso

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/Sal4Jim/SISTEMA_BOLETAS.git
   cd SISTEMA_BOLETAS
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Configurar la base de Datos**:
   - Crea la base de datos `boletera_bd` en tu servidor MySQL.
   - Importa el esquema de base de datos (si se proporciona) o deja que el sistema lo gestione.

4. **Iniciar el servidor**:

   ```bash
   # Modo desarrollo (con recarga automática)
   npm run dev

   # Modo producción
   npm start
   ```

5. **Acceder al sistema**:
   - Abre tu navegador en `http://localhost:3000`.

## 📁 Estructura del Proyecto

```text
SISTEMA_BOLETAS/
├── config/             # Configuración de base de datos
├── controllers/        # Lógica de negocio
├── models/             # Esquemas y consultas de DB
├── public/             # Archivos estáticos (HTML, CSS, JS frontend)
│   ├── css/
│   ├── images/
│   └── js/
├── routes/             # Endpoints de la API
├── utils/              # Funciones auxiliares (Impresión, etc.)
├── server.js           # Punto de entrada de la aplicación
└── .env                # Variables de entorno
```

## ✍️ Autor

- **Jimmy** - [Sal4Jim](https://github.com/Sal4Jim)

---

© 2026 PK2 Restaurant - Desarrollado para optimizar el sabor y el servicio.
