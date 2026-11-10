// =============================================================
// ElectroVerde: el catalogo y el carrito, con JavaScript
// Cada bloque tiene un comentario: QUE hace y PARA QUE.
// =============================================================

// --- CONSTANTES: valores que no cambian. Se declaran con const ---
// Se escriben en MAYUSCULAS para que se note que son fijas
const TARIFA = 950;            // lo que cuesta 1 kWh, en pesos (COP). Tarifa de ejemplo
const DIAS_MES = 30;           // dias de un mes: para pasar el ahorro de un dia al de un mes

// --- ARREGLO DE OBJETOS LITERALES: la lista de productos ---
// [ ] = un ARREGLO: una lista de elementos, separados por comas
// { } = un OBJETO: un grupo de datos con nombre (propiedad: valor)
// Cada producto es un objeto. Sus datos se leen con un punto: producto.precio
// wattsAntes   = cuanto gasta el equipo VIEJO que se reemplaza (en vatios, W)
// wattsDespues = cuanto gasta el equipo NUEVO (0 si no gasta energia de la red)
// horasDia     = cuantas horas al dia se usa
// Hay 8 productos de 3 categorias: iluminacion, electrodomesticos y solar
const productos = [
    { id: 1, nombre: "Bombillo LED 9 W", categoria: "iluminacion", precio: 8900,
      wattsAntes: 60, wattsDespues: 9, horasDia: 5 },
    { id: 2, nombre: "Panel LED 18 W", categoria: "iluminacion", precio: 35000,
      wattsAntes: 40, wattsDespues: 18, horasDia: 8 },
    { id: 3, nombre: "Reflector LED 50 W", categoria: "iluminacion", precio: 59000,
      wattsAntes: 250, wattsDespues: 50, horasDia: 6 },
    { id: 4, nombre: "Nevera eficiente", categoria: "electrodomesticos", precio: 1890000,
      wattsAntes: 80, wattsDespues: 40, horasDia: 24 },
    { id: 5, nombre: "Aire acondicionado inverter", categoria: "electrodomesticos", precio: 2100000,
      wattsAntes: 1400, wattsDespues: 900, horasDia: 6 },
    { id: 6, nombre: "Regleta con apagado automático", categoria: "electrodomesticos", precio: 65000,
      wattsAntes: 15, wattsDespues: 0, horasDia: 20 },
    { id: 7, nombre: "Calentador solar de agua", categoria: "solar", precio: 1200000,
      wattsAntes: 3500, wattsDespues: 0, horasDia: 0.5 },
    { id: 8, nombre: "Kit de panel solar 550 W", categoria: "solar", precio: 2400000,
      wattsAntes: 550, wattsDespues: 0, horasDia: 4.5 }
];

// --- VARIABLES: se declaran con let porque SI cambian ---
// El carrito empieza vacio: [] es un arreglo sin elementos.
// Cada vez que se oprime "Agregar al carrito", se le agrega un producto
let carrito = [];
// La categoria elegida en los filtros. Empieza en "todas".
// Se guarda aqui para que el buscador y los filtros trabajen juntos
let categoriaActual = "todas";

// --- FUNCIONES ---
// Una funcion es un bloque de codigo con nombre.
// Recibe datos (PARAMETROS, entre parentesis) y devuelve un resultado con return.
// Se escribe una vez y se usa muchas veces: ahorroKwhMes(producto)

// ahorroKwhMes: cuantos kWh ahorra un producto en un mes.
// Ejemplo con el bombillo: (60 - 9) x 5 x 30 / 1000 = 7.65 kWh
function ahorroKwhMes(producto) {
    // (wattsAntes - wattsDespues) = los vatios que se dejan de gastar (60 - 9 = 51 W)
    // * horasDia = por las horas de uso al dia (51 x 5 = 255 Wh al dia)
    // * DIAS_MES = por los 30 dias del mes (255 x 30 = 7650 Wh al mes)
    // / 1000     = de Wh a kWh, que es como cobra la empresa de energia (7650 / 1000 = 7.65 kWh)
    return (producto.wattsAntes - producto.wattsDespues) * producto.horasDia * DIAS_MES / 1000;
}

// ahorroPesosMes: cuantos pesos ahorra un producto en un mes.
// Ejemplo con el bombillo: 7.65 kWh x 950 = 7267.5 pesos
function ahorroPesosMes(producto) {
    // Llama la funcion anterior para saber los kWh y los multiplica por lo que cuesta cada kWh
    return ahorroKwhMes(producto) * TARIFA;
}

// pesos: escribe un numero como plata colombiana.
// Ejemplos: pesos(8900) -> "$8.900"   pesos(7267.5) -> "$7.268"   pesos(2400000) -> "$2.400.000"
function pesos(valor) {
    // Math.round(valor) = redondea sin decimales: 7267.5 -> 7268
    // .toString()       = lo pasa a texto: "7268"
    // .replace(...)     = le pone un punto antes de cada grupo de 3 cifras contado desde el final:
    //                     "2400000" -> "2.400.000". Se hace a mano (y no con toLocaleString)
    //                     para que salga igual en cualquier navegador y computador
    const entero = Math.round(valor).toString();
    return "$" + entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// nombreCategoria: el nombre de la categoria para mostrar, con tilde y mayuscula.
// En los datos se guarda sin tildes ("iluminacion") y en la pagina se muestra bonito ("Iluminación")
function nombreCategoria(categoria) {
    // CONDICIONAL: if = "si"; else if = "si no, si"; else = "si no"
    // === compara si son EXACTAMENTE iguales (mismo texto, mismas minusculas)
    if (categoria === "iluminacion") {
        return "Iluminación";
    } else if (categoria === "electrodomesticos") {
        return "Electrodomésticos";
    } else {
        // ...solo queda "solar"
        return "Energía solar";
    }
}

// normalizar: deja un texto en minusculas y sin tildes, para que el buscador
// encuentre "iluminacion" aunque se escriba "Iluminación".
// Ejemplo: normalizar("Regleta Automática") -> "regleta automatica"
function normalizar(texto) {
    // toLowerCase() = a minusculas.
    // normalize("NFD") separa cada letra de su tilde ("á" -> "a" + tilde)
    // y el replace borra las tildes sueltas (el rango \u0300-\u036f)
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// --- DOM: escribir en la pagina las tarjetas de los productos ---
// DOM = la pagina vista desde JavaScript: cada etiqueta del HTML es un objeto
// que JavaScript puede buscar, leer y cambiar
// mostrarProductos: escribe una tarjeta por cada producto que cumpla DOS condiciones:
// que sea de la categoria elegida y que su nombre o categoria contengan el texto del buscador.
// categoria = "todas" o el nombre de una categoria; texto = lo que se escribio en el buscador
function mostrarProductos(categoria, texto) {
    // Busca en la pagina el <div id="productos"> vacio de catalogo.html
    const contenedor = document.querySelector("#productos");
    // Lo vacia, para no repetir tarjetas si la funcion se llama otra vez
    contenedor.innerHTML = "";
    // El texto del buscador, ya sin tildes ni mayusculas
    const buscado = normalizar(texto);
    // Un contador de cuantas tarjetas se muestran (let, porque va sumando)
    let mostrados = 0;

    // BUCLE for...of: repite el bloque { } una vez por cada elemento del arreglo.
    // En cada vuelta, producto es un producto distinto: 1.a vuelta el bombillo, 2.a el panel...
    for (const producto of productos) {
        // CONDICIONAL 1 (filtro): si se eligio una categoria (no "todas")
        // Y el producto es de OTRA categoria, se salta (continue = pasar a la siguiente vuelta)
        // !== significa "distinto de"; && significa "y"
        if (categoria !== "todas" && producto.categoria !== categoria) {
            continue;
        }
        // CONDICIONAL 2 (buscador): si ni el nombre NI la categoria contienen lo buscado, se salta.
        // includes() dice si un texto contiene a otro; ! significa "no".
        // Se juntan nombre y categoria en un solo texto: "Bombillo LED 9 W Iluminación"
        if (!normalizar(producto.nombre + " " + nombreCategoria(producto.categoria)).includes(buscado)) {
            continue;
        }
        // Este producto si se muestra: se cuenta
        mostrados++;
        // Agrega la tarjeta al contenedor. += agrega al final de lo que ya habia.
        // El texto va entre comillas invertidas ` ` (TEMPLATE STRING):
        // permite varias lineas y meter valores con ${ }. Ejemplo: ${producto.nombre} -> Bombillo LED 9 W
        // Lo que se mete en cada ${ }:
        //   nombreCategoria(producto.categoria)   -> "Iluminación"
        //   producto.nombre                       -> "Bombillo LED 9 W"
        //   producto.wattsAntes                   -> 60
        //   ahorroKwhMes(producto).toFixed(1)     -> "7.7" (toFixed(1) = con 1 decimal: 7.65 -> "7.7")
        //   pesos(producto.precio)                -> "$8.900"
        //   pesos(ahorroPesosMes(producto))       -> "$7.268"
        //   producto.id (en data-id del boton)    -> 1: asi el boton sabe de que producto es
        contenedor.innerHTML += `
            <article class="tarjeta">
                <span class="categoria">${nombreCategoria(producto.categoria)}</span>
                <h3>${producto.nombre}</h3>
                <p>Reemplaza un equipo de ${producto.wattsAntes} W.
                   Ahorra <span class="ahorro">${ahorroKwhMes(producto).toFixed(1)} kWh</span> al mes.</p>
                <p class="precio">${pesos(producto.precio)}</p>
                <p>Ahorro al mes: <span class="ahorro">${pesos(ahorroPesosMes(producto))}</span></p>
                <button class="btn btn-primary btn-sm" data-id="${producto.id}">Agregar al carrito</button>
            </article>`;
    }

    // Si ningun producto cumplio las condiciones, avisa en vez de dejar el catalogo en blanco
    if (mostrados === 0) {
        contenedor.innerHTML = `<p class="sin-resultados">No hay productos que coincidan con la búsqueda.</p>`;
    }
}

// --- El carrito ---

// agregarAlCarrito: agrega al carrito el producto que tiene ese id.
// Ejemplo: agregarAlCarrito(1) agrega el bombillo
function agregarAlCarrito(id) {
    // Recorre todos los productos, uno por uno...
    for (const producto of productos) {
        // ...y cuando encuentra el que tiene ese id (=== compara: 1 === 1)...
        if (producto.id === id) {
            // ...lo agrega al final del arreglo carrito. push = "empujar al final"
            carrito.push(producto);
        }
    }
    // Vuelve a dibujar el carrito, ya con el producto nuevo
    mostrarCarrito();
}

// mostrarCarrito: dibuja el carrito: la lista, el total, el ahorro y en cuantos meses se paga.
// Se llama cada vez que el carrito cambia (al agregar o al vaciar)
function mostrarCarrito() {
    // Busca la lista <ul id="lista-carrito"> del carrito
    const lista = document.querySelector("#lista-carrito");
    // La vacia, para escribirla de nuevo completa (si no, los productos se repetirian)
    lista.innerHTML = "";
    // ACUMULADORES: variables que empiezan en 0 y van sumando en el bucle (let, porque cambian)
    let total = 0;
    let ahorroMes = 0;

    // Recorre los productos que hay en el carrito
    for (const producto of carrito) {
        // Agrega a la lista una linea <li> con el nombre y el precio.
        lista.innerHTML += `<li>${producto.nombre}: ${pesos(producto.precio)}</li>`;
        // Suma el precio al total. total += precio es lo mismo que total = total + precio
        total += producto.precio;
        // Suma lo que ahorra este producto al mes
        ahorroMes += ahorroPesosMes(producto);
    }

    // Escribe el total en el parrafo <p id="total">. Ejemplo: "Total: $1.217.800"
    document.querySelector("#total").textContent = "Total: " + pesos(total);

    // .length = cuantos elementos tiene el arreglo. Si es 0, el carrito esta vacio
    if (carrito.length === 0) {
        document.querySelector("#ahorro").textContent = "El carrito está vacío.";
    } else {
        // En cuantos meses el ahorro paga la compra: el total dividido el ahorro de cada mes.
        // Ejemplo: 1217800 / 64410 = 18.9 meses
        // Math.ceil redondea HACIA ARRIBA: 18.9 -> 19 (con 18 meses todavia no alcanza)
        const meses = Math.ceil(total / ahorroMes);
        // Escribe el ahorro y los meses en <p id="ahorro">, con un template string.
        document.querySelector("#ahorro").textContent =
            `Ahorra ${pesos(ahorroMes)} al mes: la compra se paga sola en ${meses} meses.`;
    }
}

// --- EVENTOS: el programa reacciona a lo que hace el usuario ---

// El campo del buscador: <input id="buscador">
const buscador = document.querySelector("#buscador");

// Evento "input": ocurre CADA VEZ que cambia lo escrito en el campo (con cada letra).
// Asi la busqueda se hace mientras se escribe, sin boton
buscador.addEventListener("input", function () {
    // buscador.value = lo que hay escrito. Se respeta la categoria que estaba elegida
    mostrarProductos(categoriaActual, buscador.value);
});

// querySelectorAll busca TODOS los elementos con la clase .filtro (los 4 botones de filtro)
const botonesFiltro = document.querySelectorAll(".filtro");
// Recorre los 4 botones...
for (const boton of botonesFiltro) {
    // ...y a cada uno le pone a ESCUCHAR el evento "click".
    boton.addEventListener("click", function () {
        // Quita la clase "activo" a todos los botones...
        for (const otro of botonesFiltro) {
            otro.classList.remove("activo");
        }
        // ...y se la pone solo al que se oprimio: el CSS lo pinta de verde
        boton.classList.add("activo");
        // Guarda la categoria elegida. dataset.categoria lee el atributo data-categoria del HTML
        categoriaActual = boton.dataset.categoria;
        // Vuelve a dibujar los productos, respetando tambien lo que haya en el buscador
        mostrarProductos(categoriaActual, buscador.value);
    });
}

// Clic en un boton "Agregar al carrito".
// Se escucha en el CONTENEDOR #productos y no en cada boton, porque los botones
// los crea JavaScript y se borran y se vuelven a crear cada vez que se filtra o se busca
document.querySelector("#productos").addEventListener("click", function (evento) {
    // evento.target = el elemento exacto donde se hizo clic.
    // Si tiene data-id, es un boton "Agregar al carrito"; si no, se hizo clic en otra parte
    if (evento.target.dataset.id) {
        // dataset.id es TEXTO ("1"). Number lo convierte en numero (1),
        // para que producto.id === id funcione (1 === "1" daria false)
        agregarAlCarrito(Number(evento.target.dataset.id));
    }
});

// Clic en el boton "Vaciar carrito" (<button id="vaciar">)
document.querySelector("#vaciar").addEventListener("click", function () {
    // El carrito vuelve a ser un arreglo vacio
    carrito = [];
    // Y se vuelve a dibujar: sale "El carrito está vacío."
    mostrarCarrito();
});

// --- Al cargar la pagina ---
// muestra todos los productos ("todas", sin texto de busqueda) y el carrito vacio
mostrarProductos("todas", "");
mostrarCarrito();
