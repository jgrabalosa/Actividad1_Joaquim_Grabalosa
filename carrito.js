// Clase que guarda los productos y calcula el total de la compra.
class Carrito {
    constructor(productos) {
        this.productos = productos;
    }

    actualizarUnidades(sku, unidades) {
        const producto = this.productos.find(function (producto) {
            return producto.SKU === sku;
        });

        if (producto && unidades >= 0) {
            producto.quantity = unidades;
        }
    }

    obtenerInformacionProducto(sku) {
        const producto = this.productos.find(function (producto) {
            return producto.SKU === sku;
        });

        if (producto) {
            return producto;
        }

        return null;
    }

    obtenerCarrito() {
        let total = 0;
        const productosSeleccionados = [];

        this.productos.forEach(function (producto) {
            const cantidad = producto.quantity;
            const precio = Number(producto.price);
            const subtotal = cantidad * precio;

            total = total + subtotal;

            if (cantidad > 0) {
                productosSeleccionados.push({
                    SKU: producto.SKU,
                    title: producto.title,
                    price: precio,
                    quantity: cantidad,
                    subtotal: subtotal
                });
            }
        });

        return {
            total: total,
            currency: "€",
            products: productosSeleccionados
        };
    }
}

function formatoPrecio(precio) {
    return Number(precio).toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR"
    });
}

async function cargarProductos() {
    const zonaProductos = document.getElementById("productos");

    try {
        const respuesta = await fetch("productos.json");

        if (!respuesta.ok) {
            throw new Error("No se han podido cargar los productos.");
        }

        const datos = await respuesta.json();
        const carrito = new Carrito(datos.products);

        carrito.productos.forEach(function (producto) {
            producto.quantity = 0;
        });

        mostrarProductos(carrito);
    } catch (error) {
        zonaProductos.innerHTML =
            '<p class="mensaje-error">No se han podido cargar los productos. Abre el proyecto con Live Server en Visual Studio Code.</p>';
        console.error(error);
    }
}

function mostrarProductos(carrito) {
    const zonaProductos = document.getElementById("productos");
    zonaProductos.innerHTML = "";

    carrito.productos.forEach(function (producto) {
        const fila = document.createElement("div");
        fila.className = "fila producto";

        const nombre = document.createElement("div");
        nombre.className = "nombre-y-sku";

        const titulo = document.createElement("p");
        titulo.className = "nombre-producto";
        titulo.textContent = producto.title;

        const sku = document.createElement("span");
        sku.className = "sku";
        sku.textContent = "SKU: " + producto.SKU;

        nombre.appendChild(titulo);
        nombre.appendChild(sku);

        const controles = document.createElement("div");
        controles.className = "controles";

        const botonMenos = document.createElement("button");
        botonMenos.textContent = "-";
        botonMenos.type = "button";
        botonMenos.setAttribute("aria-label", "Quitar una unidad de " + producto.title);

        const cantidad = document.createElement("span");
        cantidad.className = "cantidad";
        cantidad.textContent = producto.quantity;

        const botonMas = document.createElement("button");
        botonMas.textContent = "+";
        botonMas.type = "button";
        botonMas.setAttribute("aria-label", "Añadir una unidad de " + producto.title);

        const precio = document.createElement("span");
        precio.className = "precio";
        precio.textContent = formatoPrecio(producto.price);

        const subtotal = document.createElement("span");
        subtotal.className = "subtotal";
        subtotal.textContent = formatoPrecio(0);

        botonMenos.addEventListener("click", function () {
            cambiarCantidad(producto.SKU, -1, carrito);
        });

        botonMas.addEventListener("click", function () {
            cambiarCantidad(producto.SKU, 1, carrito);
        });

        controles.appendChild(botonMenos);
        controles.appendChild(cantidad);
        controles.appendChild(botonMas);

        fila.appendChild(nombre);
        fila.appendChild(controles);
        fila.appendChild(precio);
        fila.appendChild(subtotal);

        zonaProductos.appendChild(fila);

        producto.elementoCantidad = cantidad;
        producto.elementoSubtotal = subtotal;
    });

    actualizarTotal(carrito);
}

function cambiarCantidad(sku, cambio, carrito) {
    const producto = carrito.obtenerInformacionProducto(sku);

    if (producto) {
        let nuevaCantidad = producto.quantity + cambio;

        if (nuevaCantidad < 0) {
            nuevaCantidad = 0;
        }

        carrito.actualizarUnidades(sku, nuevaCantidad);
        producto.elementoCantidad.textContent = nuevaCantidad;
        producto.elementoSubtotal.textContent =
            formatoPrecio(nuevaCantidad * Number(producto.price));

        actualizarTotal(carrito);
    }
}

function actualizarTotal(carrito) {
    const informacion = carrito.obtenerCarrito();
    const total = document.getElementById("total");
    const detalle = document.getElementById("detalle-total");

    total.textContent = formatoPrecio(informacion.total);
    detalle.innerHTML = "";

    informacion.products.forEach(function (producto) {
        const linea = document.createElement("p");
        const nombre = document.createElement("span");
        const importe = document.createElement("span");

        nombre.textContent = producto.quantity + " x " + producto.title;
        importe.textContent = formatoPrecio(producto.subtotal);

        linea.appendChild(nombre);
        linea.appendChild(importe);
        detalle.appendChild(linea);
    });
}

cargarProductos();
