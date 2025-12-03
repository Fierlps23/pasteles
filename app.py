from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import hashlib
from models import db, Producto, CarritoItem
from routes.carrito import carrito_bp
from routes.pagos import pagos_bp

# Asegurarse de que el modelo Pedido también use la misma instancia de db
from models import db as models_db

app = Flask(__name__)
CORS(app)  # Esto permite las solicitudes CORS desde el frontend

# Configuración de la base de datos usando variables de entorno (más seguro)
import os
DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASS', '')  # si usas XAMPP suele estar vacío
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_NAME = os.getenv('DB_NAME', 'pasteleria_db')

# Usamos el conector mysql-connector-python con SQLAlchemy: mysql+mysqlconnector://
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Nota: instala 'mysql-connector-python' o instala 'pymysql' y usa pymysql.install_as_MySQLdb()

# Inicializar la extensión db con la aplicación
db.init_app(app)

# Modelo de Pedido
class Pedido(models_db.Model):
    __tablename__ = 'pedidos'
    id = models_db.Column(models_db.Integer, primary_key=True)
    nombre = models_db.Column(models_db.String(100), nullable=False)
    email = models_db.Column(models_db.String(120), nullable=False)
    producto = models_db.Column(models_db.String(100), nullable=False)
    cantidad = models_db.Column(models_db.Integer, default=1)
    fecha_entrega = models_db.Column(models_db.Date)
    nota = models_db.Column(models_db.Text)
    creado_en = models_db.Column(models_db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'email': self.email,
            'producto': self.producto,
            'cantidad': self.cantidad,
            'fecha_entrega': self.fecha_entrega.isoformat() if self.fecha_entrega else None,
            'nota': self.nota,
            'creado_en': self.creado_en.isoformat()
        }


# Modelo de Usuario
class User(models_db.Model):
    __tablename__ = 'users'
    id = models_db.Column(models_db.Integer, primary_key=True)
    email = models_db.Column(models_db.String(255), unique=True, nullable=False)
    password_hash = models_db.Column(models_db.String(255), nullable=False)
    first_name = models_db.Column(models_db.String(100))
    last_name = models_db.Column(models_db.String(100))
    display_name = models_db.Column(models_db.String(100))
    phone = models_db.Column(models_db.String(30))
    avatar_url = models_db.Column(models_db.Text)
    date_of_birth = models_db.Column(models_db.Date)
    email_verified = models_db.Column(models_db.Boolean, default=False)
    email_verification_hash = models_db.Column(models_db.String(128))
    password_reset_hash = models_db.Column(models_db.String(128))
    password_reset_expires = models_db.Column(models_db.DateTime)
    settings = models_db.Column(models_db.JSON)
    role = models_db.Column(models_db.String(50), default='user')
    is_active = models_db.Column(models_db.Boolean, default=True)
    last_login_at = models_db.Column(models_db.DateTime)
    failed_login_attempts = models_db.Column(models_db.Integer, default=0)
    locked_until = models_db.Column(models_db.DateTime)
    deleted_at = models_db.Column(models_db.DateTime)
    created_at = models_db.Column(models_db.DateTime, default=datetime.utcnow)
    updated_at = models_db.Column(models_db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password: str):
        # En producción usar bcrypt/argon2; aqui usamos werkzeug por compatibilidad
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=12)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def make_token_hash(token: str) -> str:
        return hashlib.sha256(token.encode('utf-8')).hexdigest()

    def set_email_verification_token(self, token_plain: str):
        self.email_verification_hash = self.make_token_hash(token_plain)

    def check_email_verification_token(self, token_plain: str) -> bool:
        if not self.email_verification_hash:
            return False
        return self.email_verification_hash == self.make_token_hash(token_plain)

    def set_password_reset_token(self, token_plain: str, expires_hours=1):
        self.password_reset_hash = self.make_token_hash(token_plain)
        self.password_reset_expires = datetime.utcnow() + timedelta(hours=expires_hours)

    def check_password_reset_token(self, token_plain: str) -> bool:
        if not self.password_reset_hash or not self.password_reset_expires:
            return False
        if datetime.utcnow() > self.password_reset_expires:
            return False
        return self.password_reset_hash == self.make_token_hash(token_plain)

# Crear tablas al inicio
with app.app_context():
    db.create_all()

# Rutas API
@app.route('/api/productos', methods=['GET'])
def get_productos():
    productos = Producto.query.all()
    return jsonify([producto.to_dict() for producto in productos])

@app.route('/api/productos/categoria/<categoria>', methods=['GET'])
def get_productos_por_categoria(categoria):
    productos = Producto.query.filter_by(categoria=categoria).all()
    return jsonify([producto.to_dict() for producto in productos])

@app.route('/api/productos/<int:id>', methods=['GET'])
def get_producto(id):
    producto = Producto.query.get_or_404(id)
    return jsonify(producto.to_dict())

@app.route('/api/productos/buscar/<termino>', methods=['GET'])
def buscar_productos(termino):
    productos = Producto.query.filter(
        Producto.nombre.ilike(f'%{termino}%') |
        Producto.descripcion.ilike(f'%{termino}%')
    ).all()
    return jsonify([producto.to_dict() for producto in productos])


@app.route('/api/productos', methods=['POST'])
def agregar_producto():
    data = request.get_json()
    nombre = data.get('nombre')
    descripcion = data.get('descripcion')
    precio = data.get('precio')
    imagen_url = data.get('imagen_url')

    if not nombre or not precio:
        return jsonify({'error': 'Faltan campos obligatorios: nombre y precio'}), 400

    nuevo_producto = Producto(
        nombre=nombre,
        descripcion=descripcion,
        precio=float(precio),
        imagen_url=imagen_url
    )

    db.session.add(nuevo_producto)
    db.session.commit()

    return jsonify(nuevo_producto.to_dict()), 201


@app.route('/api/users/register', methods=['POST'])
def register_user():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    first_name = data.get('first_name')

    if not email or not password:
        return jsonify({'error': 'email and password required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'email already registered'}), 400

    user = User(email=email, first_name=first_name)
    user.set_password(password)

    # generar token de verificación (en desarrollo podemos devolverlo; en producción se envía por email)
    token = secrets.token_urlsafe(32)
    user.set_email_verification_token(token)

    db.session.add(user)
    db.session.commit()

    # En producción: enviar email con token. Aquí devolvemos el token para pruebas.
    return jsonify({'message': 'user created', 'verification_token': token}), 201

@app.route('/api/users/verify_email', methods=['GET'])
def verify_email():
    token = request.args.get('token')
    email = (request.args.get('email') or '').strip().lower()
    if not token or not email:
        return jsonify({'error': 'token and email required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'user not found'}), 404
    
    if user.check_email_verification_token(token):
        user.email_verified = True
        user.email_verification_hash = None
        db.session.commit()
        return jsonify({'message': 'email verified'}), 200
    
    return jsonify({'error': 'invalid token'}), 400

@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'email and password required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'invalid credentials'}), 401

    if not user.is_active:
        return jsonify({'error': 'account disabled'}), 401

    if user.locked_until and user.locked_until > datetime.utcnow():
        return jsonify({'error': 'account locked', 'unlock_at': user.locked_until.isoformat()}), 401

    # Check failed attempts
    if user.failed_login_attempts >= 5:
        user.locked_until = datetime.utcnow() + timedelta(minutes=15)
        db.session.commit()
        return jsonify({'error': 'too many failed attempts', 'unlock_at': user.locked_until.isoformat()}), 401

    # Success - reset counters and update last login
    user.failed_login_attempts = 0
    user.last_login_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'email_verified': user.email_verified
    }), 200

@app.route('/api/users/reset-password', methods=['POST'])
def request_password_reset():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    
    if not email:
        return jsonify({'error': 'email required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        # Don't reveal if user exists
        return jsonify({'message': 'if account exists, reset instructions sent'}), 200
    
    # Generate reset token
    token = secrets.token_urlsafe(32)
    user.set_password_reset_token(token)
    db.session.commit()
    
    # TODO: Send email with reset link
    # For development, return token
    return jsonify({
        'message': 'reset token generated',
        'token': token  # Remove in production
    }), 200


@app.route('/api/users/reset-password', methods=['PUT'])
def complete_password_reset():
    data = request.get_json() or {}
    token = data.get('token')
    password = data.get('password')
    email = (data.get('email') or '').strip().lower()
    
    if not token or not password or not email:
        return jsonify({'error': 'token, password, and email required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'user not found'}), 404
    
    # Validate token
    if not user.check_password_reset_token(token):
        return jsonify({'error': 'invalid or expired token'}), 400
    
    # Update password
    user.set_password(password)
    user.password_reset_hash = None
    user.password_reset_expires = None
    db.session.commit()
    
    return jsonify({'message': 'password reset successfully'}), 200


@app.route('/api/users/verify', methods=['GET'])
def verify_user():
    token = request.args.get('token')
    email = (request.args.get('email') or '').strip().lower()
    if not token or not email:
        return jsonify({'error': 'invalid'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'user not found'}), 404
    if user.check_email_verification_token(token):
        user.email_verified = True
        user.email_verification_hash = None
        db.session.commit()
        return jsonify({'message': 'verified'}), 200
    return jsonify({'error': 'invalid token'}), 400


@app.route('/api/users/login', methods=['POST'])
def login_user():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'email and password required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'invalid credentials'}), 401

    if not user.check_password(password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        db.session.commit()
        return jsonify({'error': 'invalid credentials'}), 401

    # login exitoso
    user.last_login_at = datetime.utcnow()
    user.failed_login_attempts = 0
    db.session.commit()

    return jsonify({'message': 'login successful', 'user': {'id': user.id, 'email': user.email, 'first_name': user.first_name, 'role': user.role}}), 200


@app.route('/api/pedidos', methods=['POST'])
def crear_pedido():
    data = request.get_json() or {}
    nombre = data.get('nombre')
    email = data.get('email')
    producto = data.get('producto')
    cantidad = data.get('cantidad', 1)
    fecha_entrega = data.get('fecha_entrega')
    nota = data.get('nota')

    if not nombre or not email or not producto:
        return jsonify({'error': 'Campos requeridos: nombre, email, producto'}), 400

    fecha_entrega_obj = None
    if fecha_entrega:
        try:
            fecha_entrega_obj = datetime.fromisoformat(fecha_entrega).date()
        except Exception:
            fecha_entrega_obj = None

    nuevo = Pedido(
        nombre=nombre,
        email=email,
        producto=producto,
        cantidad=int(cantidad) if cantidad else 1,
        fecha_entrega=fecha_entrega_obj,
        nota=nota
    )
    db.session.add(nuevo)
    db.session.commit()

    return jsonify(nuevo.to_dict()), 201

# Registrar los blueprints
app.register_blueprint(carrito_bp, url_prefix='/api')
app.register_blueprint(pagos_bp, url_prefix='/api')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crear tablas si no existen
    app.run(debug=True)

