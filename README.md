# ModaApp — *Fashion Manager*

Aplicación móvil para la **gestión de un emprendimiento de indumentaria**: permite administrar un catálogo de productos, registrar ventas con carrito, ver estadísticas del negocio y trabajar con un tablero de inicio con alertas de stock. Está construida con **React Native + Expo** y escrita íntegramente en **TypeScript**.

La app corre en **Expo Go** (Android / iOS) y también en el navegador (**Expo Web**).

---

## Índice

- [Demo y credenciales](#-demo-y-credenciales)
- [Stack tecnológico](#-stack-tecnológico)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y ejecución](#-instalación-y-ejecución)
- [Estructura de carpetas](#-estructura-de-carpetas)
- [Arquitectura](#-arquitectura)
- [Funcionalidades](#-funcionalidades)
- [Validaciones del formulario](#-validaciones-del-formulario)
- [Parámetros y configuración](#-parámetros-y-configuración)
- [Dependencias y por qué se usan](#-dependencias-y-por-qué-se-usan)
- [Declaración de uso de IA](#-declaración-de-uso-de-ia)

---

## Demo y credenciales

Al iniciar, la app muestra una pantalla de **Login / Registro**. Viene con un usuario de demostración cargado:

| Usuario | Contraseña |
|---------|------------|
| `ludmi` | `1234`     |

También se pueden crear cuentas nuevas desde la pantalla de registro.

---

## Stack tecnológico

| Herramienta | Versión | Rol |
|-------------|---------|-----|
| Expo SDK | `~54.0.34` | Framework y tooling (Metro, Expo Go, build web) |
| React Native | `0.81.5` | Motor de UI multiplataforma |
| React | `19.1.0` | Librería base |
| TypeScript | `~5.9.2` | Tipado estático en todo el proyecto |
| React Navigation | `7.x` | Navegación (Stack + Bottom Tabs) |
| AsyncStorage | `3.x` | Persistencia local |
| expo-image-picker | `~17.0.11` | Acceso a cámara y galería |
| lucide-react-native | `1.x` | Iconografía |

El proyecto usa **componentes funcionales con Hooks** (`useState`, `useEffect`, `useRef`, `useContext`) en su totalidad; no hay componentes de clase.

---

## Requisitos previos

- **Node.js** 18 o superior.
- **npm** (se instala junto con Node).
- La app **Expo Go** en tu teléfono, o un emulador Android / iOS.
- Opcional: navegador moderno para la versión web.

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el proyecto
npx expo start
```

Con el servidor de Expo corriendo:

- **En el teléfono:** escaneá el **QR** con la app *Expo Go*.
- **Android emulador:** presioná `a`.
- **iOS simulador (macOS):** presioná `i`.
- **Navegador web:** presioná `w` (o `npx expo start --web`).

### Backend de desarrollo (solo para la versión web)

Para que los datos persistan de forma compartida cuando se prueba en el navegador, hay un pequeño servidor Node incluido (`server.js`) que guarda todo en `db.json`:

```bash
node server.js       # escucha en http://localhost:3000
```

> En Android/iOS (Expo Go) **no hace falta** este servidor: la persistencia se resuelve con AsyncStorage en el dispositivo. El servidor de desarrollo es únicamente un apoyo para probar la versión web.

---

## Estructura de carpetas

```
ModaApp/
├── App.tsx                     # Punto de entrada: envuelve la app con el ThemeProvider
├── index.ts                    # registerRootComponent (bootstrap de Expo)
├── app.json                    # Configuración de Expo (nombre, iconos, splash, plataformas)
│
├── navigation/
│   ├── AppNavigator.tsx        # Stack raíz (Login → Principal + pantallas sueltas)
│   └── BottomTabs.tsx          # Navegación por pestañas inferiores
│
├── screens/
│   ├── LoginScreen.tsx         # Login y registro de usuarios
│   ├── HomeScreen.tsx          # Tablero: accesos rápidos, alertas y actividad
│   ├── CatalogScreen.tsx      # Listado (FlatList) + ABM de productos y categorías
│   ├── SalesScreen.tsx         # Registro de ventas con carrito
│   ├── StatisticsScreen.tsx    # Métricas del negocio
│   └── SettingsScreen.tsx      # Preferencias (modo oscuro, filtros)
│
├── components/
│   ├── ProductCard.tsx         # Tarjeta de producto (item del catálogo)
│   ├── ProductForm.tsx         # Formulario de alta/edición con validaciones
│   ├── SaleCard.tsx            # Tarjeta de venta
│   ├── CustomDialog.tsx        # Diálogo de confirmación reutilizable y animado
│   └── LoadingOverlay.tsx      # Overlay de carga con frases y spinner
│
├── context/
│   └── ThemeContext.tsx        # Estado global: tema oscuro y visibilidad de categorías
│
├── services/
│   └── storage.tsx             # Capa de datos (AsyncStorage + sync con el server web)
│
├── data/
│   └── productos.ts            # (Semilla vacía; los datos viven en el storage)
│
├── server.js                   # Backend de desarrollo para la versión web
└── db.json                     # "Base de datos" en JSON del server de desarrollo
```

---

## Arquitectura

La aplicación se organiza en cuatro capas bien separadas:

### 1. Navegación (`navigation/`)

Se combinan **dos estrategias de navegación**:

- Un **Stack Navigator** raíz (`AppNavigator.tsx`) que controla el flujo general: primero el **Login** y, tras autenticarse, la sección **Principal**. La pantalla de **Configuración** también vive en este stack y se abre desde el ícono de engranaje del tablero.
- Un **Bottom Tabs Navigator** (`BottomTabs.tsx`) anidado dentro de "Principal", con las secciones de uso diario: **Inicio, Catálogo, Ventas y Estadísticas**, cada una con su ícono.

La barra de pestañas calcula su alto usando los *safe-area insets* del dispositivo (`useSafeAreaInsets`), de modo que las etiquetas no se corten ni queden tapadas por la barra de gestos —ni en teléfonos con notch/home-indicator ni en la vista móvil del navegador.

### 2. Estado global (`context/`)

`ThemeContext` centraliza las preferencias que afectan a varias pantallas: **modo oscuro** y **mostrar/ocultar el filtro de categorías**. El contexto persiste estas opciones en AsyncStorage, así se recuerdan entre sesiones. Cada pantalla consume el contexto con `useContext` y adapta sus estilos de forma condicional.

### 3. Capa de datos (`services/storage.tsx`)

Toda la lectura/escritura pasa por dos funciones, `getData(key)` y `saveData(key, value)`, que abstraen el origen de los datos. Esto permite que las pantallas no sepan *dónde* se guarda la información:

- En **móvil**, usan AsyncStorage.
- En **web**, además sincronizan contra el servidor de desarrollo (`db.json`) para poder compartir el estado entre recargas.

Gracias a esta abstracción, cambiar el origen de datos más adelante solo implica modificar este archivo, sin tocar las pantallas.

Las cuatro "colecciones" que maneja son: `productos`, `ventas`, `categorias` y `usuarios`.

### 4. Presentación (`screens/` + `components/`)

Las pantallas orquestan datos y estado; los componentes son piezas reutilizables (tarjetas, formulario, diálogos, overlay de carga). Todo el layout se resuelve con **Flexbox** (`flexDirection`, `flex`, `justifyContent`, `flexWrap`), lo que da un diseño responsive que se adapta a distintos anchos de pantalla —por ejemplo, la grilla de productos a dos columnas o las filas de inputs del formulario.

---

## Funcionalidades

### Catálogo — listado dinámico con ABM completo
La pantalla de catálogo usa una **`FlatList`** a dos columnas que soporta el ciclo completo:

- **Alta** de productos mediante un formulario en modal.
- **Edición** de cualquier producto (mismo formulario precargado).
- **Baja** con diálogo de confirmación.
- **Búsqueda** en vivo por nombre y **filtro por categorías**.
- **Gestión de categorías**: crear, renombrar y eliminar (mantené presionado un chip de categoría). Las categorías son **dinámicas**: se arman a partir de las que el usuario crea y de las que ya usan los productos existentes; no hay listas fijas escritas en el código.

Mientras cargan los datos se muestra un **skeleton** animado, y el listado aparece con una transición de *fade + slide*.

### Ventas — carrito y descuento de stock
Permite buscar productos (con un panel de búsqueda que se **despliega con una animación de deslizamiento**), agregarlos a un carrito, ajustar cantidades, y registrar la venta. Al confirmar, la venta queda registrada y **se descuenta automáticamente el stock** del catálogo. Incluye control de stock insuficiente y un campo de observaciones.

### Inicio — tablero con alertas
Muestra un saludo, accesos rápidos a las acciones más comunes, **alertas de stock bajo o agotado** calculadas en tiempo real, y la actividad reciente de ventas. Desde acá, con el **ícono de engranaje** arriba a la derecha, se accede a la Configuración.

### Estadísticas
Resume el negocio: total de productos, stock total, cantidad de ventas, ingresos acumulados, producto más vendido y listado de productos con stock bajo.

### Configuración
Permite activar el **modo oscuro** (que se aplica de forma consistente en toda la app) y mostrar/ocultar el filtro de categorías del catálogo.

### Interacción con el hardware del teléfono
El formulario de producto permite **agregar una foto** eligiendo la fuente: **cámara** o **galería**. La app pide los permisos correspondientes antes de abrir cada una (`requestCameraPermissionsAsync` / `requestMediaLibraryPermissionsAsync`).

### Feedback visual y estados
La interfaz reacciona a cada situación: spinners y skeletons de carga, diálogos de confirmación animados, mensajes de error, estados vacíos ("no hay productos / ventas") y microanimaciones al presionar botones. Todo se resuelve con **renderizado condicional** según el estado.

---

## Validaciones del formulario

El alta/edición de productos valida cada campo y muestra el error **debajo del campo** (con el borde en rojo) antes de guardar:

| Campo | Regla | Motivo |
|-------|-------|--------|
| **Nombre** | Obligatorio | Todo producto necesita identificarse |
| **Categoría** | Obligatoria (debe seleccionarse) | Permite filtrar y ordenar el catálogo |
| **Talle** | Obligatorio, **alfanumérico mixto** (letras y números, ej. `M`, `42`, `XL`) | Los talles varían entre numéricos y por letra |
| **Color** | Obligatorio, **solo letras** (sin números ni símbolos) | Un color no lleva dígitos ni caracteres raros |
| **Cantidad** | Obligatoria, **número entero** ≥ 0 | El stock se cuenta en unidades |
| **Precio** | Obligatorio, **numérico** mayor a 0 | El precio debe ser un valor válido |

---

## Parámetros y configuración

- **`app.json`** — configuración de Expo: nombre (`ModaApp`), orientación `portrait`, íconos, splash, `newArchEnabled: true` (Nueva Arquitectura de RN) y opciones por plataforma (iOS/Android/web).
- **`BACKEND_URL`** (en `services/storage.tsx`) — URL del servidor de desarrollo web: `http://localhost:3000/api/db`.
- **Puerto del server de desarrollo** — `3000` (definido en `server.js`).
- **Usuario por defecto** — `ludmi` / `1234` (sembrado en `server.js` y en el fallback del login).
- **Color de marca** — `#7B2CBF` (violeta), usado de forma consistente en toda la UI.
- **`metro.config.js`** — agrega la extensión `.mjs` a las soportadas por Metro.

---

## Dependencias y por qué se usan

| Dependencia | Justificación |
|-------------|---------------|
| `@react-navigation/native`, `native-stack`, `bottom-tabs` | Navegación estándar de React Native; permite combinar Stack + Tabs. |
| `react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler` | Requeridas por React Navigation; los *safe-area insets* evitan que la UI quede tapada por notches/barras. |
| `@react-native-async-storage/async-storage` | Persistencia local del catálogo, ventas y preferencias (valor agregado sobre "datos en memoria"). |
| `expo-image-picker` | Acceso nativo a **cámara y galería** para las fotos de producto. |
| `expo-camera` | Soporte de cámara en Expo. |
| `lucide-react-native` + `react-native-svg` | Set de íconos coherente y liviano (SVG). |
| `react-native-web`, `react-dom` | Habilitan la ejecución en navegador (Expo Web). |
| `@expo/vector-icons` | Íconos adicionales del ecosistema Expo. |

Ninguna librería es imprescindible más allá de lo que aporta React Navigation y Expo; se eligieron por ser el estándar del ecosistema y estar mantenidas oficialmente.

## Declaración de uso de IA

Durante el desarrollo se utilizaron herramientas de asistencia por IA (modelos tipo GPT / Claude / Gemini) como apoyo para:

- Refactors y organización de código.
- Redacción de esta documentación.
- Depuración de detalles de UI (safe-area en la barra de pestañas, animación del buscador) y de las validaciones.

Todas las decisiones técnicas fueron revisadas, comprendidas y ajustadas manualmente. El código puede explicarse y justificarse en su totalidad.