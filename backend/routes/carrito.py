from flask import Blueprint, jsonify, request
from models import db, CarritoItem
from datetime import datetime

carrito_bp = Blueprint('carrito', __name__)

@carrito_bp.route('/carrito', methods=['GET'])
def obtener_carrito():
    try:
        # Obtener el ID del usuario del token o sesión
        usuario_id = request.args.get('usuario_id')
        if not usuario_id:
            return jsonify({'error': 'Usuario no autenticado'}), 401

        # Obtener items del carrito
        items = CarritoItem.query.filter_by(usuario_id=usuario_id).all()
        
        # Convertir items a formato JSON
        carrito = [{
            'producto_id': item.producto_id,
            
            'cantidad': item.cantidad,
            'fecha_actualizacion': item.fecha_actualizacion.isoformat()
        } for item in items]
        
        return jsonify({'items': carrito}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@carrito_bp.route('/carrito', methods=['POST'])
def actualizar_carrito():
    try:
        # Obtener el ID del usuario del token o sesión
        usuario_id = request.json.get('usuario_id')
        if not usuario_id:
            return jsonify({'error': 'Usuario no autenticado'}), 401

        # Obtener los items del carrito del cuerpo de la petición
        items = request.json.get('items', [])

        # Eliminar items antiguos del usuario
        CarritoItem.query.filter_by(usuario_id=usuario_id).delete()

        # Insertar nuevos items
        for item in items:
            nuevo_item = CarritoItem(
                usuario_id=usuario_id,
                producto_id=item['id'],
                cantidad=item['quantity']
            )
            db.session.add(nuevo_item)

        db.session.commit()
        return jsonify({'message': 'Carrito actualizado exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@carrito_bp.route('/carrito', methods=['DELETE'])
def limpiar_carrito():
    try:
        usuario_id = request.args.get('usuario_id')
        if not usuario_id:
            return jsonify({'error': 'Usuario no autenticado'}), 401

        CarritoItem.query.filter_by(usuario_id=usuario_id).delete()
        db.session.commit()
        return jsonify({'message': 'Carrito eliminado exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500