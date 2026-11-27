// =============================================================
// CAPA 2 · SERVICIOS: productoServicio.js
// QUE hace: las REGLAS DEL NEGOCIO de los productos: validar los datos
//           y calcular el ahorro (en kWh, en pesos y en meses para recuperar la compra).
// PARA QUE: que las reglas esten en un solo lugar. Esta capa no sabe
//           de URL ni de codigos HTTP, y no escribe SQL.
// =============================================================

// Las funciones de la capa de abajo: el repositorio
import * as repositorio from "../repositorios/productoRepositorio.js";

// --- CONSTANTES: valores que no cambian ---
// Lo que cuesta 1 kWh, en pesos (COP). Tarifa de ejemplo
const TARIFA = 950;
// Dias de un mes: para pasar el ahorro de un dia al de un mes
const DIAS_MES = 30;
// Las categorias que existen. Es una regla del negocio: no se acepta otra.
// export: las rutas y las pruebas tambien la pueden usar
export const CATEGORIAS = ["iluminacion", "electrodomesticos", "solar"];

// --- Los calculos (cada uno recibe un producto) ---

// ahorroKwhMes: cuantos kWh ahorra el producto en un mes.
// Ejemplo con el bombillo: (60 - 9) x 5 x 30 / 1000 = 7.65 kWh
function ahorroKwhMes(producto) {
    // (vatios que se dejan de gastar) x (horas al dia) x (dias del mes) / 1000 = de Wh a kWh
    return (producto.wattsAntes - producto.wattsDespues) * producto.horasDia * DIAS_MES / 1000;
}

// ahorroPesosMes: cuantos pesos ahorra el producto en un mes.
// Ejemplo con el bombillo: 7.65 kWh x 950 = 7267.5 pesos
function ahorroPesosMes(producto) {
    return ahorroKwhMes(producto) * TARIFA;
}

// mesesRecuperacion: en cuantos meses el ahorro paga el producto.
// Ejemplo con el bombillo: 8900 / 7267.5 = 1.22 -> 2 meses
function mesesRecuperacion(producto) {
    // Math.ceil redondea HACIA ARRIBA: con 1 mes todavia no alcanza.
    // toFixed(6) quita el "ruido" de los decimales (4.0000000001 no debe volverse 5)
    return Math.ceil(Number((producto.precio / ahorroPesosMes(producto)).toFixed(6)));
}

// conAhorro: le agrega a un producto sus tres calculos.
// { ...producto, ... } = un objeto nuevo con todos los datos del producto, mas los calculos
function conAhorro(producto) {
    return {
        ...producto,
        ahorroKwhMes: ahorroKwhMes(producto),
        ahorroPesosMes: ahorroPesosMes(producto),
        mesesRecuperacion: mesesRecuperacion(producto)
    };
}

// --- La validacion ---

// esNumero: true si es un numero de verdad (no texto, no NaN, no Infinity)
function esNumero(valor) {
    return typeof valor === "number" && Number.isFinite(valor);
}

// validar: revisa los datos. Devuelve una LISTA de errores (vacia [] si todo esta bien)
function validar(datos) {
    // La lista empieza vacia; cada regla que no se cumple le agrega un mensaje
    const errores = [];
    // El nombre: obligatorio
    if (typeof datos.nombre !== "string" || datos.nombre.trim() === "") {
        errores.push("El nombre es obligatorio.");
    }
    // La categoria: una de las tres
    if (!CATEGORIAS.includes(datos.categoria)) {
        errores.push(`La categoria debe ser una de estas: ${CATEGORIAS.join(", ")}.`);
    }
    // El precio: un numero mayor que 0
    if (!esNumero(datos.precio) || datos.precio <= 0) {
        errores.push("El precio debe ser un numero mayor que 0.");
    }
    // Los vatios del equipo viejo: mayores que 0
    if (!esNumero(datos.wattsAntes) || datos.wattsAntes <= 0) {
        errores.push("wattsAntes (vatios del equipo viejo) debe ser un numero mayor que 0.");
    }
    // Los vatios del equipo nuevo: 0 o mas
    if (!esNumero(datos.wattsDespues) || datos.wattsDespues < 0) {
        errores.push("wattsDespues (vatios del equipo nuevo) debe ser un numero mayor o igual que 0.");
    } else if (esNumero(datos.wattsAntes) && datos.wattsDespues >= datos.wattsAntes) {
        // Regla clave: si el equipo nuevo no gasta menos, no hay ahorro y los meses
        // para recuperar la compra no se pueden calcular
        errores.push("El equipo nuevo debe gastar menos que el viejo: wattsDespues tiene que ser menor que wattsAntes.");
    }
    // Las horas de uso al dia: mayores que 0 y maximo 24
    if (!esNumero(datos.horasDia) || datos.horasDia <= 0 || datos.horasDia > 24) {
        errores.push("horasDia debe ser un numero mayor que 0 y maximo 24.");
    }
    // Devuelve la lista: vacia = todo bien
    return errores;
}

// armarProducto: deja SOLO los 6 datos de la tabla (ignora cualquier otro que llegue)
function armarProducto(datos) {
    return {
        nombre: datos.nombre.trim(),
        categoria: datos.categoria,
        precio: datos.precio,
        wattsAntes: datos.wattsAntes,
        wattsDespues: datos.wattsDespues,
        horasDia: datos.horasDia
    };
}

// convertirId: el id llega de la URL como TEXTO ("3"). Devuelve el numero (3),
// o null si no es un entero positivo ("abc", "-1", "2.5")
function convertirId(texto) {
    // /^[1-9]\d*$/ = empieza por un digito del 1 al 9 y sigue con digitos hasta el final
    return /^[1-9]\d*$/.test(String(texto)) ? Number(texto) : null;
}

// --- Lo que usa la capa de rutas (por eso lleva export) ---

// listarProductos: todos, o los de una categoria. Cada uno con sus calculos de ahorro.
// Devuelve { errores } si la categoria no existe, o { productos }
export function listarProductos(categoria) {
    // Si llego una categoria que no es de las tres, es un error de la peticion
    if (categoria !== undefined && !CATEGORIAS.includes(categoria)) {
        return { errores: [`La categoria debe ser una de estas: ${CATEGORIAS.join(", ")}.`] };
    }
    // map: aplica conAhorro a cada producto
    return { productos: repositorio.listar(categoria).map(conAhorro) };
}

// obtenerProducto: uno, o undefined si no existe
export function obtenerProducto(id) {
    const numero = convertirId(id);
    // Un id que no es un numero valido tampoco existe
    if (numero === null) {
        return undefined;
    }
    const producto = repositorio.buscar(numero);
    // condicion ? si : no
    return producto ? conAhorro(producto) : undefined;
}

// crearProducto: valida y guarda. Devuelve { errores } si algo esta mal, o { producto }
export function crearProducto(datos) {
    const errores = validar(datos);
    // Si hay al menos un error, no guarda nada y devuelve los errores
    if (errores.length > 0) {
        return { errores };
    }
    const producto = armarProducto(datos);
    // El repositorio lo guarda y dice que id le tocó
    const id = repositorio.crear(producto);
    return { producto: conAhorro({ id, ...producto }) };
}

// actualizarProducto: valida y cambia. Devuelve { errores }, { producto } o {} si no existe
export function actualizarProducto(id, datos) {
    const errores = validar(datos);
    if (errores.length > 0) {
        return { errores };
    }
    const numero = convertirId(id);
    const producto = armarProducto(datos);
    // El repositorio hace el UPDATE y dice si el producto existia
    const existia = numero !== null && repositorio.actualizar(numero, producto);
    // Si no existia, objeto vacio: la ruta respondera 404
    return existia ? { producto: conAhorro({ id: numero, ...producto }) } : {};
}

// eliminarProducto: true si lo borro, false si no existia
export function eliminarProducto(id) {
    const numero = convertirId(id);
    // No hay reglas para borrar: se lo pide directo al repositorio
    return numero !== null && repositorio.eliminar(numero);
}
