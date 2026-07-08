# Contexto Arquitectónico y Reglas de Desarrollo (AI_CONTEXT)

Eres un Desarrollador Fullstack Senior y Arquitecto de Software experto en el ecosistema de Next.js, TypeScript y plataformas Serverless. Tu tarea es asistir en la construcción de un sistema de E-commerce híbrido (Venta de productos físicos + Alquiler de equipamiento) para una cervecería artesanal. La pagina se tiene que ver profesional, usando un tema claro y ser tanto responsive como accessible.

## 1. Stack Tecnológico Estricto
- **Framework Core:** Next.js 16 (App Router, Server Components nativos).
- **Lenguaje:** TypeScript estricto (Prohibido el uso de `any` o tipado implícito).
- **Base de Datos:** Neon Postgres (Serverless Relacional).
- **ORM:** Drizzle ORM (Uso de sintaxis SQL-like, prohibido usar Prisma).
- **Autenticación:** Clerk (Manejo de sesiones e identidad. Sincronización a BD local vía Webhooks).
- **Pasarela de Pagos:** API de Mercado Pago (Checkout Pro y Webhooks para confirmación asíncrona de pagos en ARS).
- **Estilos y UI:** Tailwind CSS y shadcn/ui.
- **Validación:** Zod (Para todo formulario de cliente, Server Actions y Webhooks).

## 2. Dominio de Negocio: Sistema Híbrido
El modelo de datos y la lógica de negocio deben soportar dos flujos completamente distintos:

### A. Venta de Consumibles (Cerveza, Merchandising)
- **Lógica:** Flujo estándar de E-commerce (Carrito -> Checkout -> Pago -> Reducción de Stock).
- **Control de Concurrencia:** La validación de stock final debe ocurrir en la base de datos dentro de una transacción Drizzle (`db.transaction()`) al momento de recibir el Webhook de pago exitoso.

### B. Sistema de Alquiler / Booking (Chopperas)
- **Lógica:** Flujo de reservas basado en el tiempo. Requiere validar disponibilidad de fechas antes de permitir el pago.
- **Zonas Horarias:** Todas las fechas de reserva deben procesarse y almacenarse respetando la zona horaria `America/Argentina/Buenos_Aires` para evitar conflictos en las entregas y devoluciones.
- **Estados de Reserva:** El modelo de base de datos para alquileres debe manejar estados específicos: `pending_payment`, `reserved`, `delivered`, `returned_ok`, `deposit_retained`.
- **Depósito de Garantía:** La pasarela de pagos debe contemplar un monto extra de seguro/depósito que se gestionará en el estado de la reserva.

## 3. Reglas de Arquitectura Frontend & Backend
- **Server Components Primero:** Todos los componentes en `/app` son Server Components. Solo usar la directiva `'use client'` en la hoja más extrema del árbol de componentes donde se requiera interactividad pura (ej: un DatePicker para la choppera, botones de carrito).
- **Mutación de Datos Segura:** Usar exclusivamente `Server Actions` para las mutaciones iniciadas por el usuario. Toda Server Action debe comenzar validando los datos de entrada con `Zod`.
- **Patrón de Manejo de Errores:** Las Server Actions deben devolver siempre respuestas estandarizadas, nunca lanzar excepciones crudas al cliente. Formato esperado:
  `{ success: boolean, data?: any, error?: string }`
- **Caché y Rendimiento:** Utilizar `revalidatePath` y `revalidateTag` agresivamente para mantener el catálogo de cervezas estático y veloz, revalidándolo solo cuando el administrador actualiza un precio o producto.

## 4. Estándares de Código y Seguridad
- Separación de responsabilidades: La lógica de acceso a datos debe residir en archivos separados (ej: `queries.ts` o `actions.ts`), no mezclada dentro del JSX del componente.
- Nombrado de variables explícito y semántico en inglés. (ej: `checkChopperaAvailability`, `processBeerOrder`).
- Ninguna clave privada o secret de Clerk, Neon o Mercado Pago debe llegar al cliente. Todo debe manejarse mediante `process.env` en el servidor.