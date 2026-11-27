// =============================================================
// crearBd.js: crea la base de datos a partir de bd/tienda.sql
// QUE hace: lee el archivo SQL y lo ejecuta en bd/tienda.db
// PARA QUE: que cualquiera cree la base con un solo comando,
// y que el archivo .db NO se suba al repositorio.
// Se ejecuta con: npm run crear-bd
// =============================================================

// readFileSync: lee un archivo completo como texto
import { readFileSync } from "node:fs";
// DatabaseSync: la base de datos SQLite que ya trae Node.js (no hay que instalarla)
import { DatabaseSync } from "node:sqlite";

// Las rutas de los dos archivos. new URL(..., import.meta.url) = la ruta RELATIVA a este
// archivo (api/src/), asi funciona sin importar desde que carpeta se ejecute el comando
const archivoSql = new URL("../../bd/tienda.sql", import.meta.url);
const archivoBd = new URL("../../bd/tienda.db", import.meta.url);

// Lee el script SQL como texto ("utf8" = con tildes y enes)
const sql = readFileSync(archivoSql, "utf8");
// Abre la base de datos. Si el archivo tienda.db no existe, lo crea
const bd = new DatabaseSync(archivoBd);
// exec: ejecuta todo el script: borra las tablas, las crea y carga los productos
bd.exec(sql);

// Cuenta lo que quedo, para comprobar que funciono.
// prepare: prepara una consulta; get: la ejecuta y trae UNA fila
const productos = bd.prepare("SELECT COUNT(*) AS total FROM productos").get();
const categorias = bd.prepare("SELECT COUNT(DISTINCT categoria) AS total FROM productos").get();
console.log(`Base de datos creada en bd/tienda.db con ${productos.total} productos de ${categorias.total} categorias.`);
// Cierra la base de datos
bd.close();
