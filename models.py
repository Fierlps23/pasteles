from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Modelo de Producto
class Producto(db.Model):
    __tablename__ = 'productos'
    id_producto = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Float, nullable=False)
    imagen_url = db.Column(db.String(200))

    def to_dict(self):
        return {
            'id_producto': self.id_producto,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'precio': self.precio,
            'imagen_url': self.imagen_url
        }

# Modelo para el carrito
class CarritoItem(db.Model):
    __tablename__ = 'carrito_items'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    producto_id = db.Column(db.Integer, nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    fecha_actualizacion = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'producto_id': self.producto_id,
            'cantidad': self.cantidad,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
        }


# Modelo para almacenar preferencias de Mercado Pago
class PreferenciaPago(db.Model):
    __tablename__ = 'preferencias_pago'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False, index=True)
    mp_preference_id = db.Column(db.String(150), nullable=False)
    init_point = db.Column(db.Text, nullable=False)
    fecha_creacion = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'mp_preference_id': self.mp_preference_id,
            'init_point': self.init_point,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }