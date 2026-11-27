// =============================================================
// CAPA 3 · REPOSITORIO: pedidoRepositorio.js
// QUE hace: lee y escribe las tablas pedidos y pedido_items.
// PARA QUE: igual que productoRepositorio.js: el SQL vive solo en esta capa.
// =============================================================

// La conexion a la base de datos
import bd from "./conexion.js";

// itemsDe: los productos de UN pedido (funcion interna: no lleva export)
function itemsDe(pedidoId) {
    return bd.prepare(
        "SELECT productoId, nombre, precioUnitario, cantidad FROM pedido_items WHERE pedidoId = ? ORDER BY id"
    ).all(pedidoId);
}

// crear: guarda un pedido y todos sus productos, y devuelve el id del pedido.
// items = un arreglo de { productoId, nombre, precioUnitario, cantidad }
export function crear(cliente, fecha, total, items) {
    // TRANSACCION: o se guarda TODO (el pedido y sus productos) o NO se guarda nada.
    // BEGIN la abre; COMMIT la confirma; ROLLBACK la deshace si algo falla
    bd.exec("BEGIN");
    try {
        // Primero la fila del pedido
        const resultado = bd.prepare("INSERT INTO pedidos (cliente, fecha, total) VALUES (?, ?, ?)")
                            .run(cliente, fecha, total);
        // El id que SQLite le asigno al pedido: lo necesitan sus productos
        const pedidoId = Number(resultado.lastInsertRowid);
        // Se prepara la consulta una vez y se ejecuta una vez por cada producto del pedido
        const insertarItem = bd.prepare(
            "INSERT INTO pedido_items (pedidoId, productoId, nombre, precioUnitario, cantidad) VALUES (?, ?, ?, ?, ?)"
        );
        for (const item of items) {
            insertarItem.run(pedidoId, item.productoId, item.nombre, item.precioUnitario, item.cantidad);
        }
        // Todo salio bien: confirma
        bd.exec("COMMIT");
        return pedidoId;
    } catch (error) {
        // Algo fallo: deshace lo que se alcanzo a escribir y vuelve a lanzar el error
        // (el manejo de errores de servidor.js responde 500)
        bd.exec("ROLLBACK");
        throw error;
    }
}

// listar: todos los pedidos, el mas reciente primero, cada uno con sus productos
export function listar() {
    const pedidos = bd.prepare("SELECT id, cliente, fecha, total FROM pedidos ORDER BY id DESC").all();
    // map: a cada pedido le agrega su arreglo items
    return pedidos.map((pedido) => ({ ...pedido, items: itemsDe(pedido.id) }));
}
