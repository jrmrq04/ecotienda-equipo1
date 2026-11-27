// =============================================================
// CAPA 1 · RUTAS: productoRutas.js
// QUE hace: recibe las peticiones HTTP de /api/productos y responde en JSON
//           con el codigo de estado correcto (200, 201, 204, 400, 404).
// PARA QUE: separar la parte "web" de las reglas. Esta capa NO
//           valida, NO calcula y NO escribe SQL: se lo pide al servicio.
// =============================================================

// Router: un grupo de rutas que despues se conecta en el servidor
import { Router } from "express";
// Las funciones de la capa de abajo: el servicio
import * as servicio from "../servicios/productoServicio.js";

// Crea el grupo de rutas (todas quedan debajo de /api/productos)
const rutas = Router();

// GET /api/productos            -> todos los productos
// GET /api/productos?categoria=solar -> solo los de esa categoria
rutas.get("/", (req, res) => {
    // req.query.categoria = lo que va despues del ? en la URL (undefined si no viene)
    const resultado = servicio.listarProductos(req.query.categoria);
    // Si el servicio devolvio errores, la categoria no existe: 400
    if (resultado.errores) {
        return res.status(400).json({ errores: resultado.errores });
    }
    // 200 = OK (es el codigo por defecto de res.json)
    res.json(resultado.productos);
});

// GET /api/productos/1 -> un producto
rutas.get("/:id", (req, res) => {
    // req.params.id = lo que va en lugar de :id en la URL
    const producto = servicio.obtenerProducto(req.params.id);
    // !producto = no llego nada: el producto no existe
    if (!producto) {
        // 404 = no existe
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
});

// POST /api/productos -> crea un producto con el JSON del cuerpo
rutas.post("/", (req, res) => {
    // req.body = el JSON que llego. ?? {} = si llego sin cuerpo, un objeto vacio
    const resultado = servicio.crearProducto(req.body ?? {});
    // Si el servicio devolvio errores, los datos estan mal
    if (resultado.errores) {
        // 400 = la peticion esta mal hecha (datos malos)
        return res.status(400).json({ errores: resultado.errores });
    }
    // 201 = creado
    res.status(201).json(resultado.producto);
});

// PUT /api/productos/1 -> modifica un producto
rutas.put("/:id", (req, res) => {
    // req.params.id = cual producto; req.body = los datos nuevos
    const resultado = servicio.actualizarProducto(req.params.id, req.body ?? {});
    // 400 = los datos nuevos estan mal
    if (resultado.errores) {
        return res.status(400).json({ errores: resultado.errores });
    }
    // 404 = ese id no existe (el servicio devolvio un objeto vacio)
    if (!resultado.producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    // 200 = modificado: responde con el producto actualizado
    res.json(resultado.producto);
});

// DELETE /api/productos/1 -> borra un producto
rutas.delete("/:id", (req, res) => {
    // eliminarProducto devuelve false si no existia: entonces 404
    if (!servicio.eliminarProducto(req.params.id)) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    // 204 = hecho, sin nada que devolver
    res.status(204).end();
});

// Lo que entrega este archivo: el grupo de rutas
export default rutas;
