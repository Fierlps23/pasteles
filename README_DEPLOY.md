Despliegue rápido (Render + Vercel)
=================================

Paso rápido para poner tu proyecto en Internet usando Vercel (frontend) y Render (backend):

1) Preparar repo
 - Asegúrate de subir el repo a GitHub.

2) Backend (Render)
 - Crear nuevo "Web Service" en Render y conectar con tu repo.
 - Build Command: (no hace build) dejar vacío o `pip install -r requirements.txt`.
 - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
 - Env Vars: añade variables desde `.env.example` llenándolas con tus valores reales.
 - Database: crea un MySQL gestionado o usa el host/usuario/clave de tu DB; añade las variables `DB_*`.
 - Deploy: Render detectará cambios y desplegará.

3) Frontend (Vercel)
 - Crear nuevo proyecto en Vercel, conectar repo y seleccionar el directorio raíz.
 - Build Command: `npm run build -- --configuration production` o `ng build --configuration production`.
 - Output Directory: `dist` (o `dist/<project-name>` según angular.json).
 - En Settings -> Environment Variables define `MERCADOPAGO_PUBLIC_KEY` para usar en frontend production.

4) Mercado Pago
 - En tu cuenta de Mercado Pago añade el webhook: `https://TU_DOMINIO/api/webhook/mercadopago`.
 - En los `back_urls` de la preferencia se usará la variable `MERCADOPAGO_BACK_URL_BASE` (p.ej. `https://mi-tienda.com`).

5) Pruebas locales con ngrok
 - `ngrok http 4200` para exponer frontend y `ngrok http 5000` para backend. Configura `MERCADOPAGO_BACK_URL_BASE` con la URL pública de ngrok.

Notas
 - No incluyas tokens en el repo. Usa variables de entorno en los dashboards.
 - Si quieres, puedo crear un pequeño script de deploy o un `Dockerfile`.

Railway (nota rápida)
--------------------

- Si usas Railway, crea primero el servicio MySQL (plugin). En la pantalla del plugin
	Railway mostrará variables como `MYSQL_URL`, `MYSQL_PUBLIC_URL`, `MYSQLPASSWORD`, `MYSQLUSER`, etc.
- Abre tu *Web Service* (el servicio que ejecuta el backend) → Settings → Environment.
	- Añade una **Variable Reference** apuntando a `MYSQL_URL` o copia el valor a una variable
		del Web Service llamada `MYSQL_URL` (recomendado: Variable Reference para mantenerlo secreto).
	- Alternativamente puedes añadir `SQLALCHEMY_DATABASE_URI` con el valor `mysql+mysqlconnector://user:pass@host:port/db`.

- En el repo existe `backend/.env.example` con los nombres de variables recomendadas.
	Copia ese archivo a `backend/.env` para pruebas locales (no subas `.env` al repo).

Si quieres, te guío paso a paso en la UI de Railway para añadir la Variable Reference.
