// =============================================================
// servidor.js: el punto de entrada de la API
// QUE hace: crea el servidor con Express, le conecta las rutas
//           y lo pone a escuchar en el puerto 3001.
// Se ejecuta con: npm run dev
// =============================================================

// express: la libreria que crea el servidor web
import express from "express";
// cors: permite que el frontend (otro origen: localhost:3000) le pida datos a la API
import cors from "cors";
// La capa de rutas: una por cada recurso
import productoRutas from "./rutas/productoRutas.js";
import pedidoRutas from "./rutas/pedidoRutas.js";

// El puerto: el "numero de puerta" por donde la API recibe peticiones
const PUERTO = 3001;

// Crea la aplicacion
const app = express();

// MIDDLEWARES: se ejecutan en CADA peticion, antes de las rutas
// cors(): le da permiso al frontend para llamar a la API
app.use(cors());
// express.json(): convierte el JSON que llega en un objeto (req.body)
app.use(express.json());

// GET / -> un mensaje para saber que la API esta viva
app.get("/", (req, res) => {
    res.json({ mensaje: "API de ElectroVerde funcionando", productos: "/api/productos", pedidos: "/api/pedidos" });
});

// Conecta las rutas debajo de /api/productos y /api/pedidos
app.use("/api/productos", productoRutas);
app.use("/api/pedidos", pedidoRutas);

// Si ninguna ruta coincide: 404 en JSON
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo de errores (4 parametros): si llega un JSON mal escrito o algo falla,
// responde en JSON en vez de una pagina HTML de error
app.use((err, req, res, next) => {
    // Muestra el error en la terminal, para saber que paso
    console.error("Error:", err.message);
    // err.status = 400 si el JSON llego mal escrito; si no trae codigo, es un 500
    const codigo = err.status || 500;
    res.status(codigo).json({ error: codigo === 400 ? "El JSON enviado no es valido" : "Error interno del servidor" });
});

// Pone la API a escuchar. error = lo que fallo (por ejemplo, el puerto ocupado)
app.listen(PUERTO, (error) => {
    if (error) {
        console.error(`No se pudo iniciar la API: el puerto ${PUERTO} esta ocupado (${error.code}).`);
        console.error("Cierre la otra terminal donde la API ya esta corriendo, u oprima Ctrl + C en ella.");
        return;
    }
    console.log(`API de ElectroVerde en http://localhost:${PUERTO}`);
});
