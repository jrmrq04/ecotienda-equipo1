-- =============================================================
-- tienda.sql: la BASE DE DATOS de ElectroVerde (SQLite)
-- QUE hace: crea las tablas productos, pedidos y pedido_items,
--           y le carga 8 productos de 3 categorias.
-- PARA QUE: que los datos vivan en la base y no dentro del codigo.
-- La API los lee y los escribe; el frontend NUNCA entra aqui.
-- Se ejecuta con: npm run crear-bd (desde la carpeta api)
-- =============================================================

-- Se borran las tablas (primero la que depende de otra) para que el script
-- se pueda ejecutar muchas veces y siempre deje la base como nueva
DROP TABLE IF EXISTS pedido_items;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS productos;

-- TABLA 1: productos. Una fila por cada producto de la tienda
CREATE TABLE productos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,  -- numero que SQLite asigna solo: 1, 2, 3...
    nombre       TEXT    NOT NULL,                   -- Bombillo LED 9 W
    categoria    TEXT    NOT NULL,                   -- iluminacion, electrodomesticos o solar
    precio       REAL    NOT NULL,                   -- lo que cuesta, en pesos (COP)
    wattsAntes   REAL    NOT NULL,                   -- vatios del equipo VIEJO que se reemplaza
    wattsDespues REAL    NOT NULL,                   -- vatios del equipo NUEVO (0 si no gasta energia de la red)
    horasDia     REAL    NOT NULL                    -- horas al dia que se usa
);

-- TABLA 2: pedidos. Una fila por cada pedido que confirma un cliente
CREATE TABLE pedidos (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT NOT NULL,   -- el nombre del cliente
    fecha   TEXT NOT NULL,   -- cuando se hizo, en formato ISO: 2026-11-24T15:30:00.000Z
    total   REAL NOT NULL    -- lo que suma el pedido, en pesos (lo calcula la API)
);

-- TABLA 3: pedido_items. Los productos de cada pedido (una fila por producto distinto).
-- Se guardan el nombre y el precio DE ESE MOMENTO: asi el pedido no cambia si despues
-- se modifica o se borra el producto. Por eso productoId no es una llave foranea
CREATE TABLE pedido_items (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    pedidoId       INTEGER NOT NULL REFERENCES pedidos(id),  -- a que pedido pertenece
    productoId     INTEGER NOT NULL,                         -- el id que tenia el producto
    nombre         TEXT    NOT NULL,                         -- su nombre al comprar
    precioUnitario REAL    NOT NULL,                         -- su precio al comprar
    cantidad       INTEGER NOT NULL                          -- cuantas unidades
);

-- Los 8 productos de ejemplo (los mismos de la Evidencia 2)
INSERT INTO productos (nombre, categoria, precio, wattsAntes, wattsDespues, horasDia) VALUES
('Bombillo LED 9 W',                'iluminacion',       8900,    60,   9,   5),
('Panel LED 18 W',                  'iluminacion',       35000,   40,   18,  8),
('Reflector LED 50 W',              'iluminacion',       59000,   250,  50,  6),
('Nevera eficiente',                'electrodomesticos', 1890000, 80,   40,  24),
('Aire acondicionado inverter',     'electrodomesticos', 2100000, 1400, 900, 6),
('Regleta con apagado automático',  'electrodomesticos', 65000,   15,   0,   20),
('Calentador solar de agua',        'solar',             1200000, 3500, 0,   0.5),
('Kit de panel solar 550 W',        'solar',             2400000, 550,  0,   4.5);
