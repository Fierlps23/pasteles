from flask import Blueprint, jsonify, request, current_app
from flask_cors import cross_origin
import mercadopago
from models import db, Producto, CarritoItem, PreferenciaPago
import os
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)

pagos_bp = Blueprint('pagos', __name__)

# Configura tu ACCESS_TOKEN de Mercado Pago desde variable de entorno
MERCADOPAGO_ACCESS_TOKEN = os.getenv('MERCADOPAGO_ACCESS_TOKEN', 'APP_USR-230244185445361-102018-b8a8cb8a3a1b18659692f304e04e5680-2937230999') 

@pagos_bp.route('/crear-preferencia', methods=['POST'])
@cross_origin()
def crear_preferencia():
    try:
        logging.info('Iniciando creación de preferencia de pago')
        # Obtener el ID del usuario y los items del carrito
        data = request.json
        usuario_id = data.get('usuario_id')
        
        if not usuario_id:
            return jsonify({'error': 'Usuario no autenticado'}), 401

        # Obtener items del carrito
        items_carrito = CarritoItem.query.filter_by(usuario_id=usuario_id).all()
        if not items_carrito:
            return jsonify({'error': 'Carrito vacío'}), 400

        # Crear el SDK de MercadoPago
        sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)

        # Preparar items para MercadoPago
        preference_items = []
        for item in items_carrito:
            producto = Producto.query.get(item.producto_id)
            if producto:
                preference_items.append({
                    "title": producto.nombre,
                    "quantity": item.cantidad,
                    "currency_id": "MXN",  # Ajusta según tu moneda
                    "unit_price": float(producto.precio)
                })

        # Crear la preferencia
        # Construir back_urls desde variable de entorno si está definida
        base_back = os.getenv('MERCADOPAGO_BACK_URL_BASE')
        if base_back:
            success_url = f"{base_back}/cart?status=success"
            failure_url = f"{base_back}/cart?status=failure"
            pending_url = f"{base_back}/cart?status=pending"
        else:
            # Fallback local (útil para desarrollo), pero puede causar rechazos en MP
            success_url = "http://localhost:4200/cart?status=success"
            failure_url = "http://localhost:4200/cart?status=failure"
            pending_url = "http://localhost:4200/cart?status=pending"

        preference_data = {
            "items": preference_items,
            "back_urls": {
                "success": success_url,
                "failure": failure_url,
                "pending": pending_url
            },
            "external_reference": str(usuario_id)
        }

        preference_response = sdk.preference().create(preference_data)
        logging.info(f'Preference response raw: {preference_response}')
        # El SDK devuelve un dict; inspeccionar la clave 'response'
        preference = preference_response.get("response") if isinstance(preference_response, dict) else None

        if not preference or 'id' not in preference or 'init_point' not in preference:
            logging.error(f'Preferencia creada inválida: {preference}')
            return jsonify({'error': 'invalid preference response from mercadopago', 'raw': preference_response}), 500

        # Guardar preferencia en la base de datos
        try:
            nueva_pref = PreferenciaPago(
                usuario_id=int(usuario_id),
                mp_preference_id=preference["id"],
                init_point=preference["init_point"]
            )
            db.session.add(nueva_pref)
            db.session.commit()
        except Exception as db_err:
            logging.error(f'Error guardando preferencia en DB: {db_err}')
            # No bloqueamos la respuesta al cliente: devolvemos la preferencia creada

        return jsonify({
            "id": preference["id"],
            "init_point": preference["init_point"]
        })

    except Exception as e:
        logging.error(f'Error al crear preferencia de pago: {str(e)}')
        return jsonify({'error': str(e)}), 500

@pagos_bp.route('/webhook/mercadopago', methods=['POST'])
def webhook_mercadopago():
    try:
        data = request.json
        
        if data["type"] == "payment":
            # Obtener información del pago
            sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)
            payment_info = sdk.payment().get(data["data"]["id"])
            
            if payment_info["status"] == 200:
                payment = payment_info["response"]
                
                if payment["status"] == "approved":
                    # Aquí puedes actualizar el estado del pedido en tu base de datos
                    usuario_id = int(payment["external_reference"])
                    
                    # Limpiar el carrito después de un pago exitoso
                    CarritoItem.query.filter_by(usuario_id=usuario_id).delete()
                    db.session.commit()

        return jsonify({'status': 'ok'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500