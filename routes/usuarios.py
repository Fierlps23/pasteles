from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import secrets
from . import db

usuarios_bp = Blueprint('usuarios', __name__)

class Usuario(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='user')
    email_verified = db.Column(db.Boolean, default=False)
    reset_token = db.Column(db.String(100), unique=True)
    reset_token_expires = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

@usuarios_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validar datos requeridos
    required_fields = ['email', 'password', 'first_name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'El campo {field} es requerido'}), 400
    
    # Verificar si el email ya existe
    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El correo electrónico ya está registrado'}), 400
    
    # Crear nuevo usuario
    nuevo_usuario = Usuario(
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        first_name=data['first_name'],
        last_name=data.get('last_name', ''),
        role='user'
    )
    
    try:
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'user': {
                'id': nuevo_usuario.id,
                'email': nuevo_usuario.email,
                'first_name': nuevo_usuario.first_name
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al registrar el usuario'}), 500

@usuarios_bp.route('/solicitar-reset', methods=['POST'])
def solicitar_reset():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'El correo electrónico es requerido'}), 400
    
    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        # Por seguridad, no revelamos si el email existe o no
        return jsonify({'message': 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña'}), 200
    
    # Generar token único
    token = secrets.token_urlsafe(32)
    usuario.reset_token = token
    usuario.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    
    try:
        db.session.commit()
        # Generar URL de restablecimiento
        reset_url = f'http://localhost:4200/reset-password?token={token}'
        
        # En desarrollo, devolver el link en la respuesta
        # En producción, enviar por email
        print(f'[RESET PASSWORD URL] {reset_url}')
        
        return jsonify({
            'message': 'Se han enviado las instrucciones a tu correo electrónico',
            'reset_url': reset_url  # Para desarrollo/pruebas
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

@usuarios_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')
    
    if not token or not new_password:
        return jsonify({'error': 'Token y nueva contraseña son requeridos'}), 400
    
    usuario = Usuario.query.filter_by(reset_token=token).first()
    if not usuario or not usuario.reset_token_expires or usuario.reset_token_expires < datetime.utcnow():
        return jsonify({'error': 'Token inválido o expirado'}), 400
    
    try:
        usuario.password_hash = generate_password_hash(new_password)
        usuario.reset_token = None
        usuario.reset_token_expires = None
        db.session.commit()
        
        return jsonify({
            'message': 'Contraseña actualizada exitosamente'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al actualizar la contraseña'}), 500