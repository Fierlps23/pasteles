#!/bin/bash
# Script para iniciar backend en desarrollo

# Configurar variables de entorno (cambia los valores con tus credenciales reales)
export DB_USER="root"
export DB_PASS=""           # déjalo vacío si es XAMPP sin contraseña
export DB_HOST="localhost"
export DB_NAME="pasteleria_db"
export MERCADOPAGO_ACCESS_TOKEN="APP_USR-230244185445361-102018-b8a8cb8a3a1b18659692f304e04e5680-2937230999"
export MERCADOPAGO_BACK_URL_BASE="http://localhost:4200"
export FLASK_ENV="development"

# Crear virtualenv si no existe
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

# Activar virtualenv
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar Flask
python3 app.py
