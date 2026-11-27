// =============================================================
// CAPA 3 · REPOSITORIO: productoRepositorio.js
// QUE hace: lee y escribe la tabla productos. Aqui y en pedidoRepositorio.js
//           (y SOLO aqui) se escribe SQL.
// PARA QUE: si manana la base cambia (de SQLite a PostgreSQL), se cambian
//           solo los repositorios. Las rutas y los servicios no se enteran.
// =============================================================

// La conexion a la base de datos (se abre una sola vez, en conexion.js)
import bd from "./conexion.js";

// Las columnas que se piden siempre. Es un texto FIJO escrito aqui, no viene del usuario,
// por eso se puede pegar dentro del SQL sin riesgo
const COLUMNAS = "id, nombre, categoria, precio, wattsAntes, wattsDespues, horasDia";

// listar: todos los productos, o solo los de una categoria si llega una.
// categoria viene del filtro ?categoria= de la URL
export function listar(categoria) {
    // Si llego una categoria, filtra con WHERE.
    // El ? es un "hueco" que all(categoria) llena: nunca se pega el texto del usuario
    // dentro del SQL (asi se evita la inyeccion SQL)
    if (categoria) {
        return bd.prepare(`SELECT ${COLUMNAS} FROM productos WHERE categoria = ? ORDER BY id`).all(categoria);
    }
    // Si no, todos, ordenados por id. all: trae TODAS las filas (un arreglo)
    return bd.prepare(`SELECT ${COLUMNAS} FROM productos ORDER BY id`).all();
}

// buscar: un producto por su id, o undefined si no existe
export function buscar(id) {
    // get: trae UNA fila (o undefined si no hay)
    return bd.prepare(`SELECT ${COLUMNAS} FROM productos WHERE id = ?`).get(id);
}

// crear: inserta un producto nuevo y devuelve el id que SQLite le asigno
export function crear(producto) {
    // run: ejecuta una instruccion que NO trae filas (INSERT, UPDATE, DELETE).
    // Los 6 ? se llenan en orden con los 6 valores
    const resultado = bd.prepare(
        "INSERT INTO productos (nombre, categoria, precio, wattsAntes, wattsDespues, horasDia) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(producto.nombre, producto.categoria, producto.precio,
          producto.wattsAntes, producto.wattsDespues, producto.horasDia);
    // lastInsertRowid = el id de la fila que se acaba de crear
    return Number(resultado.lastInsertRowid);
}

// actualizar: cambia todos los datos de un producto (menos el id).
// Devuelve true si lo encontro y lo cambio, false si no existia
export function actualizar(id, producto) {
    // run llena los 7 ? en orden: los 6 datos nuevos y, al final, el id del WHERE
    const resultado = bd.prepare(
        "UPDATE productos SET nombre = ?, categoria = ?, precio = ?, wattsAntes = ?, wattsDespues = ?, horasDia = ? WHERE id = ?"
    ).run(producto.nombre, producto.categoria, producto.precio,
          producto.wattsAntes, producto.wattsDespues, producto.horasDia, id);
    // changes = cuantas filas cambiaron: 1 si existia, 0 si no
    return resultado.changes > 0;
}

// eliminar: borra un producto. Devuelve true si lo borro, false si no existia
export function eliminar(id) {
    const resultado = bd.prepare("DELETE FROM productos WHERE id = ?").run(id);
    // changes = cuantas filas se borraron: 1 si existia, 0 si no
    return resultado.changes > 0;
}
