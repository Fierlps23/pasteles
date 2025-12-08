# Instrucciones rápidas para añadir variables en Railway

Nota: no puedo modificar tu proyecto Railway desde aquí. Sigue estos pasos en la UI de Railway para añadir las variables necesarias al *Web Service* que ejecuta tu backend.

1) Abre Railway → selecciona tu proyecto → en la lista de servicios elige el servicio *Web Service* (no el plugin de MySQL).

2) En el Web Service ve a la pestaña **Settings** → **Environment** (o **Variables**).

3) Añadir Variable Reference (recomendado):
   - Haz clic en **Add Variable Reference**.
   - Selecciona el recurso **MySQL** (tu plugin) y la variable `MYSQL_URL` o `MYSQL_PUBLIC_URL` que Railway expone.
   - Guarda.

   Esto crea una referencia segura para que el Web Service use la URL de la base de datos interna sin exponerla manualmente.

4) Alternativa: copiar manualmente la cadena completa (menos recomendable):
   - En la sección Variables añade una nueva variable con Key `MYSQL_URL` y Value `mysql://user:pass@host:port/db` (usa la cadena que Railway te mostró en el plugin).
   - O añade `SQLALCHEMY_DATABASE_URI` con valor `mysql+mysqlconnector://user:pass@host:port/db`.

5) Otras variables (opcional):
   - `MERCADOPAGO_ACCESS_TOKEN` — token privado de Mercado Pago
   - `MERCADOPAGO_PUBLIC_KEY` — clave pública
   - `MERCADOPAGO_BACK_URL_BASE` — URL base de tu frontend (p.ej. `https://mi-tienda.com`)

6) Guardar y redeployar
   - Guarda los cambios y redeploya / reinicia el Web Service.
   - Mira la pestaña **Logs** del Web Service para confirmar que la app arranca y se conecta a MySQL.

7) Comprobación desde tu máquina (opcional)
   - Si tu backend tiene URL pública, prueba:
     ```bash
     curl -i https://TU_BACKEND_DOMAIN/api/productos
     ```

Problemas comunes
 - `Access denied`: contraseña/usuario incorrecto.
 - `Lost connection` / `Broken pipe`: asegúrate de usar Variable Reference o que el Web Service y la DB estén en la misma región y proyecto.
 - `ModuleNotFoundError: mysql.connector`: instala `mysql-connector-python` (está en `backend/requirements.txt`).

Si quieres, puedo generar un pequeño script para Railway CLI, pero necesitarás ejecutar los comandos desde tu máquina (o darme un token de Railway si quieres que lo haga por ti — no recomendado por seguridad).
