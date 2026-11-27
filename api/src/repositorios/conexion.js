// =============================================================
// conexion.js: abre la base de datos UNA sola vez (parte de la CAPA 3)
// QUE hace: abre bd/tienda.db y la comparte con los dos repositorios
//           (productos y pedidos). Un solo archivo, una sola conexion.
// PARA QUE: no repetir la ruta de la base en cada repositorio.
// =============================================================

// existsSync: dice si un archivo existe
import { existsSync } from "node:fs";
// DatabaseSync: la base de datos SQLite que trae Node.js
import { DatabaseSync } from "node:sqlite";

// La ruta de la base, contada desde este archivo (api/src/repositorios/)
const archivoBd = new URL("../../../bd/tienda.db", import.meta.url);

// Si el archivo no existe, DatabaseSync crearia una base VACIA y despues todo fallaria
// con "no such table". Mejor parar aqui con un mensaje que diga que hacer
if (!existsSync(archivoBd)) {
    throw new Error("No existe la base de datos bd/tienda.db. Ejecute primero: npm run crear-bd");
}

// Abre la base. Queda abierta mientras la API corre
const bd = new DatabaseSync(archivoBd);
// SQLite no revisa las llaves foraneas si no se le pide: asi pedido_items no queda sin pedido
bd.exec("PRAGMA foreign_keys = ON");

// Lo que entrega este archivo: la conexion, para los repositorios
export default bd;
