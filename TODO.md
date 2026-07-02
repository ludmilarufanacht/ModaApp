# TODO — Tareas futuras

Lista de mejoras pendientes para próximas iteraciones de **ModaApp**.

## Funcionalidades

- [ ] **Detalle de venta al tocarla.** En la pantalla de *Ventas*, al tocar una
  venta de la lista "Ventas Realizadas", desplegar un detalle de la misma
  (producto/s, talle y color, cantidad, precio unitario, total, fecha y
  observaciones). Puede resolverse con un modal o una pantalla de detalle,
  reutilizando el estilo de `CustomDialog` / las tarjetas existentes.

## Mejoras técnicas

- [ ] **Persistencia de las fotos.** Las imágenes tomadas quedan como URI
  (`file:` / `blob:`) que no sobrevive a una recarga en web. Guardar la imagen
  (por ejemplo en base64) o en un almacenamiento de archivos para que la
  miniatura persista siempre.
- [ ] **Seguridad de usuarios.** Hoy las contraseñas se guardan en texto plano.
  Migrar a un esquema con hash (o a un proveedor de autenticación).
- [ ] **Editar / anular ventas.** Permitir corregir o revertir una venta,
  devolviendo el stock correspondiente al catálogo.
- [ ] **Ordenar y filtrar el catálogo** por precio o stock, además del filtro
  por categoría ya existente.
