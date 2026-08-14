import Cl_Producto from "./Cl_Producto.js";

export default class Cl_Inventario {
    constructor() {
        this.listaProductos = [];
        this.cargarDeStorage();
    }

    agregarProducto(producto) {
        this.listaProductos.push(producto);
        this.guardarEnStorage();
    }

    calcValorTotalInventario() {
        let total = 0;
        for (let i = 0; i < this.listaProductos.length; i++) {
            total += (this.listaProductos[i].precioUSD * this.listaProductos[i].cantidad);
        }
        return total;
    }

    calcTotalArticulos() {
        let totalArticulos = 0;
        for (let i = 0; i < this.listaProductos.length; i++) {
            totalArticulos += this.listaProductos[i].cantidad;
        }
        return totalArticulos;
    }

    calcSubtotalUSD() {
        let subtotalUSD = 0;
        for (let i = 0; i < this.listaProductos.length; i++) {
            subtotalUSD += (this.listaProductos[i].precioUSD * this.listaProductos[i].cantidad);
        }
        return subtotalUSD;
    }

    // Guardar el inventario en localStorage
    guardarEnStorage() {
        localStorage.setItem("bodega_datos", JSON.stringify(this.listaProductos));
    }

    cargarDeStorage() {
        let datosGuardados = localStorage.getItem("bodega_datos");
        if (datosGuardados !== null) {
            let productosPlanos = JSON.parse(datosGuardados);
            this.listaProductos = [];
            for (let i = 0; i < productosPlanos.length; i++) {
                let p = productosPlanos[i];
                let productoReconstruido = new Cl_Producto(p._codigo, p._nombre, p._cantidad, p._precioUSD);
                this.listaProductos.push(productoReconstruido);
            }
        }
    }
}
