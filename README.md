# TicketTren — Examen JS

## Autor
- **Nombre:** Rodrigo Benavides Grajeda
- **Fecha:** 12/10/2026 - 14/10/2026

## Descripción del proyecto

TicketTren es una aplicación web para la búsqueda de viajes en tren y la gestión de reservaciones. Permite consultar viajes disponibles, verificar la disponibilidad de asientos, reservar boletos, consultar los detalles de una reservación y cancelar boletos.

El proyecto utiliza JavaScript tanto en el backend como en el frontend, una base de datos relacional y servicios API para la comunicación entre los componentes de la aplicación y la consulta de tipos de cambio.

## 1. Tecnologías utilizadas

**Backend**
- Node.js: entorno de ejecución de JavaScript.
- Express.js: creación del servidor y las rutas de la API REST.
- SQL Server: almacenamiento de viajes, estaciones, trenes, asientos y boletos.
- `mssql` y `msnodesqlv8`: conexión con SQL Server mediante autenticación integrada de Windows.

**Frontend**
- HTML5: estructura de la interfaz.
- CSS3: estilos y presentación.
- JavaScript puro (ES modules): búsqueda de viajes, selección de asientos, reservaciones, consulta y cancelación de boletos, y cambio de idioma entre español e inglés.

**Integración de API**
- API REST propia desarrollada con Express para comunicar el frontend con el backend.
- [Frankfurter API](https://frankfurter.dev/): consulta de tipos de cambio para mostrar una conversión aproximada de MXN a USD.

## 2. Forma práctica de levantar el servicio en un ambiente local

### Requisitos previos

- Node.js versión 18 o posterior.
- Microsoft SQL Server instalado y en ejecución.
- Microsoft ODBC Driver 17 for SQL Server.
- Una base de datos SQL Server configurada con el esquema requerido por la aplicación.
- Una base de datos SQL Server configurada con el esquema requerido por la aplicación.

### Paso 1. Obtener el proyecto

Clonar el repositorio de Git y acceder a la carpeta del proyecto:

```bash
git clone https://github.com/mausodev/RodrigoJSExamen.git
cd RodrigoJSExamen
```

### Paso 2. Instalar las dependencias

Ejecutar en la terminal, desde la raíz del proyecto:

```bash
npm install
```

### Paso 3. Configurar la base de datos

Crear la base de datos `TicketTren` en SQL Server si todavía no existe.

El proyecto incluye los siguientes scripts SQL en la carpeta `database/`:

- **`schema.sql`:** crea la estructura de la base de datos, incluyendo las tablas y sus relaciones.
- **`seed.sql`:** inserta los datos iniciales necesarios para probar la aplicación.

Desde SQL Server Management Studio (SSMS), ejecutar los scripts en el siguiente orden:

1. Abrir y ejecutar `database/schema.sql` para crear la estructura de la base de datos.
2. Abrir y ejecutar `database/seed.sql` para insertar los datos iniciales.

Verificar que ambos scripts se ejecuten correctamente y que los datos se hayan insertado en las tablas correspondientes.

### Paso 4. Configurar la conexión a la base de datos

Crear un archivo `.env` en la raíz del proyecto con los siguientes parámetros:

```env
DB_SERVER=localhost
DB_NAME=TicketTren
```

Si SQL Server utiliza una instancia distinta, sustituir `localhost` por el nombre correspondiente.

La conexión está configurada para utilizar autenticación integrada de Windows (`Trusted_Connection=yes`). Por ello, la cuenta de Windows que ejecuta Node.js debe tener permisos para acceder a la base de datos.

La base de datos debe contar con las tablas y relaciones necesarias para las estaciones, trenes, viajes, asientos y boletos.

### Paso 5. Iniciar el servidor

Ejecutar el comando siguiente desde la raíz del proyecto:

```bash
node src/server.js
```

Si el proyecto tiene configurado un script `dev` en `package.json`, también se puede iniciar en modo desarrollo con:

```bash
npm run dev
```

Si el archivo `package.json` cuenta con un script de inicio configurado, también puede utilizarse el comando correspondiente.

### Paso 6. Abrir la aplicación

Abrir en el navegador la dirección local configurada por el servidor. Si utiliza el puerto 3000, ingresar a:

```text
http://localhost:3000
```

Para comprobar que el servidor está funcionando, se puede consultar el endpoint de salud:

```text
http://localhost:3000/api/health
```

### Integraciones y consideraciones

- El frontend consume la API REST del backend para consultar viajes, obtener asientos disponibles y gestionar reservaciones.
- El backend consulta la Frankfurter API para obtener el tipo de cambio MXN/USD.
- La conversión de moneda depende de la disponibilidad del servicio externo. Si no está disponible, la reservación puede completarse sin mostrar la conversión.
- Para ejecutar las funciones que dependen de datos, es necesario contar con SQL Server en ejecución y con la base de datos configurada.
- El archivo `.env` contiene la configuración local y no debe subirse al repositorio.

## 3. Tiempo real invertido en el ejercicio

**Tiempo total de desarrollo:** Aproximadamente entre 6 y 8 horas.
