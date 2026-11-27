// =============================================================
// CAPA 1 · RUTAS: pedidoRutas.js
// QUE hace: recibe las peticiones HTTP de /api/pedidos y responde en JSON.
// PARA QUE: igual que productoRutas.js: solo la parte "web".
//           El pedido se valida y se calcula en el servicio.
// =============================================================

import { Router } from "express";
import * as servicio from "../servicios/pedidoServicio.js";

// Crea el grupo de rutas (todas quedan debajo de /api/pedidos)
const rutas = Router();

// POST /api/pedidos -> guarda un pedido con los productos del carrito.
// Cuerpo: { "cliente": "Ana", "items": [{ "productoId": 1, "cantidad": 2 }] }
rutas.post("/", (req, res) => {
    const resultado = servicio.crearPedido(req.body ?? {});
    // 400 = el pedido esta mal (sin cliente, sin productos, producto que no existe...)
    if (resultado.errores) {
        return res.status(400).json({ errores: resultado.errores });
    }
    // 201 = creado: responde con el pedido, ya con su id, su fecha y su total
    res.status(201).json(resultado.pedido);
});

// GET /api/pedidos -> la lista de pedidos
rutas.get("/", (req, res) => {
    res.json(servicio.listarPedidos());
});

export default rutas;
