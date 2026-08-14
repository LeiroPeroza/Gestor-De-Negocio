export default class Cl_Producto {
    constructor(codigo, nombre, cantidad, precioUSD) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.precioUSD = precioUSD;
    }

    set codigo(c) { this._codigo = c; } 
    get codigo() { return this._codigo; }

    set nombre(n) { this._nombre = n; } 
    get nombre() { return this._nombre; }

    set cantidad(c) { this._cantidad = +c; } 
    get cantidad() { return this._cantidad; }

    set precioUSD(p) { this._precioUSD = +p; } 
    get precioUSD() { return this._precioUSD; }

    // RECIBE LA TASA DEL BCV Y RETORNA EL PRECIO EN BOLIVARES

    calcPrecioBs(tasaBCV) {
        return this.precioUSD * tasaBCV;
    }
}