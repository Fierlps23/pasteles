#!/usr/bin/env bash
# Script de ayuda para probar el backend localmente exportando MYSQL_URL
# USO: copia y pega (o haz `chmod +x scripts/set_local_backend.sh` y ejecútalo)

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Uso: $0 '<MYSQL_URL>'"
  echo "Ejemplo: $0 'mysql://root:PASS@shuttle.proxy.rlwy.net:36862/railway'"
  exit 1
fi

MYSQL_URL="$1"

export MYSQL_URL
export FLASK_APP=backend/app.py
export FLASK_ENV=development

echo "MYSQL_URL set to: ${MYSQL_URL}"
echo "Arrancando backend (Flask) en http://127.0.0.1:5000 ..."

python3 -m flask run --host=127.0.0.1 --port=5000
