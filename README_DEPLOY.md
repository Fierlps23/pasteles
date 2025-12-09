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
