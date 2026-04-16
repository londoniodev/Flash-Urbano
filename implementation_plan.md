# Plan de Implementación y Arquitectura: Flash Urbano 🚀

## 1. Visión General
**Flash Urbano** será una plataforma B2B para e-commerce encargada de la última milla (recepción, traslados y despachos/salidas).
Tras discutir y perfilar el negocio, el desarrollo se alinea en estos principios inquebrantables:
- Cajas ingresan al sistema **mediante formulario** manual en Web/Móvil.
- **Trazabilidad Pura:** Operarios imprimen código QR de Flash Urbano y lo adhieren a la carga.
- La App Móvil (offline-first) es de **uso exclusivo** para el equipo de bodegas de Flash Urbano (ingreso e inicio del traslado).

---

## 2. Stack Tecnológico Aprobado (El "Dream Stack" para VPS)

Hemos acordado utilizar el siguiente bloque de tecnologías. Esto garantiza un **código impecable (nivel Enterprise)**, un costo operativo hiper-optimizado en tu VPS mediante **Dokploy**, y despliegues sin interrupciones:

| Componente | Capa de Hardware/Engine | Capa de Software (Framework) | Razón en Arquitectura B2B Logística |
| :--- | :--- | :--- | :--- |
| **API Backend** | Entorno **Bun** (Bajísimo consumo RAM) | **NestJS** (TypeScript) | Otorga una inyección de dependencias robusta. Reglas de negocio claras e indestructibles. Ideal si el software logístico crece a cientos de reglas. |
| **Base de Datos** | **PostgreSQL** Nativo (Acelerado en Dokploy) | **Drizzle ORM** | Drizzle permite modelar los datos sin magias oscuras, controlando exactamente el SQL subyacente para no matar el VPS. |
| **Panel Web B2B** | Servidor Estático / Nginx (Dokploy) | **React + Vite** + **Shadcn UI** | Las empresas verán sus estadísticas al instante. Separar el Front (Vite) del Back (NestJS) protege los servidores. **Shadcn UI** garantiza interfaces profesionales bajo la filosofía DRY (Don't Repeat Yourself), instalando solo los componentes necesarios vía MCP. |
| **App Bodegueros**| Servidor local del Smartphone | **React Native (Expo)** | Offline-first. SQLite local y Vision Camera para leer los QR de manera fluida y ultra rápida. |

> [!INFLUENCIA EN COSTOS]
> Todo (Web, API y PostgreSQL) correrá dentro de tu Hostinger VPS de 16GB por medio de Dokploy. Al usar Bun en lugar de Node, el servidor API NestJS consumirá entre un 30% a 50% menos recursos respecto a un stack tradicional.

---

## 3. Arquitectura del Modelo de Datos (B2B Multisede)

Nuestra base de datos en Postgres tendrá la siguiente estructura inicial vía Drizzle:
1. `companies` (Clientes e-commerce B2B).
2. `hubs` (Sedes físicas: Cali, Bogotá, Medellín).
3. `packages` (Cajas/paquetes. Se crean manualmente en el sistema).
4. `package_movements` (Historial/Kardex de Entradas, Traslados y Salidas).
5. `users` (Roles: Admin, Operario de Bodega, y Cliente E-commerce).

---

## 4. Diseño del Monorepo Estructural

Tener 3 aplicaciones independientes (Web, Móvil, API) es difícil de mantener si no viven juntas. Construiremos un **Monorepo gestionado por Bun y npm workspaces**:

```text
/flash-urbano
├── /apps
│   ├── /api              # Nuevo microservicio en NestJS + Bun + Drizzle
│   ├── /movil            # App React Native Expo (consumiendo API NestJS)
│   └── /web              # Panel B2B React + Vite + TailwindCSS + Shadcn UI
├── /packages
│   ├── /shared           # Tipos TypeScript comunes: (ej. Interface `KardexEntry`)
│   └── /ui               # (Posible espacio futuro para componentes Shadcn compartidos si escala)
└── package.json          # Raíz del Monorepo
```

---

## User Review Required

Álvaro, la integración de **Shadcn UI** está formalizada en el stack. Apalancaremos el MCP que tengo integrado para interactuar con la CLI de shadcn, evitar reinventar la rueda (DRY) y diseñar un panel B2B que luzca costoso y premium.

**Plan de Ejecución Inmediato (Fase 1):**
1. Reestructurar las carpetas `/Web` y `/Movil` e inyectarlas dentro de `/apps/`.
2. Remover dependencias sobrantes (Supabase) en Web y Móvil.
3. Crear el entorno del Monorepo y el proyecto `/apps/api` (NestJS).
4. **Inicializar TailwindCSS y Shadcn UI** en la carpeta de la Web usando comandos automatizados (MCP) para dejar el entorno de UI listo.

*Si todo está perfecto, dame la luz verde final diciendo "Aprobado" y lanzamos los comandos.*
