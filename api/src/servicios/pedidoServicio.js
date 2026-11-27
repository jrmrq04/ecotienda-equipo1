// =============================================================
// CAPA 2 · SERVICIOS: pedidoServicio.js
// QUE hace: las REGLAS DEL NEGOCIO de los pedidos: validar el pedido y
//           CALCULAR EL TOTAL con los precios de la base de datos.
// PARA QUE: el frontend nunca decide cuanto vale un pedido: solo dice
//           QUE productos y cuantos. La API pone los precios.
// =============================================================

// El repositorio de pedidos (para guardar) y el de productos (para consultar precios)
import * as repositorio from "../repositorios/pedidoRepositorio.js";
import * as productos from "../repositorios/productoRepositorio.js";

// crearPedido: valida el pedido, calcula el total y lo guarda.
// datos = { cliente: "Ana", items: [{ productoId: 1, cantidad: 2 }, ...] }
// Devuelve { errores } si algo esta mal, o { pedido } si se creo
export function crearPedido(datos) {
    const errores = [];
    // El cliente: obligatorio
    if (typeof datos.cliente !== "string" || datos.cliente.trim() === "") {
        errores.push("El nombre del cliente es obligatorio.");
    }
    // Los productos: una lista con al menos uno. Array.isArray dice si es una lista
    if (!Array.isArray(datos.items) || datos.items.length === 0) {
        errores.push("El pedido debe tener al menos un producto.");
        // Sin lista no hay nada mas que revisar: responde con lo que lleva
        return { errores };
    }

    // Revisa cada producto del pedido y arma la lista que se guardara.
    // Cada uno se busca en la base: asi el nombre y el precio salen de ahi, no del cliente
    const items = [];
    for (const [posicion, item] of datos.items.entries()) {
        // ?. = "si item existe, lee su propiedad; si no, undefined" (evita un error si llega null)
        const productoId = item?.productoId;
        const cantidad = item?.cantidad;
        // productoId y cantidad: enteros, y la cantidad de 1 o mas
        if (!Number.isInteger(productoId) || !Number.isInteger(cantidad) || cantidad < 1) {
            errores.push(`El producto ${posicion + 1} del pedido está mal: productoId y cantidad deben ser enteros, y la cantidad de 1 o más.`);
            continue;
        }
        // Regla: el producto tiene que existir
        const producto = productos.buscar(productoId);
        if (!producto) {
            errores.push(`El producto con id ${productoId} no existe.`);
            continue;
        }
        items.push({ productoId, nombre: producto.nombre, precioUnitario: producto.precio, cantidad });
    }
    // Si el cliente o algun producto estaba mal, no guarda nada y dice TODOS los errores
    if (errores.length > 0) {
        return { errores };
    }

    // EL CALCULO: el total es la suma de precio x cantidad de cada producto.
    // reduce: recorre la lista acumulando un valor (empieza en 0)
    const total = items.reduce((suma, item) => suma + item.precioUnitario * item.cantidad, 0);
    // La fecha de ahora, en formato ISO: 2026-11-24T15:30:00.000Z
    const fecha = new Date().toISOString();
    const cliente = datos.cliente.trim();
    // El repositorio guarda el pedido y sus productos, y dice que id le tocó
    const id = repositorio.crear(cliente, fecha, total, items);
    return { pedido: { id, cliente, fecha, total, items } };
}

// listarPedidos: todos los pedidos, cada uno con sus productos
export function listarPedidos() {
    return repositorio.listar();
}
