import Cl_Producto from "./Cl_Producto.js";
import Cl_Inventario from "./Cl_Inventario.js";

// VARIABLES GLOBALES

let tasaActualBCV = 1.00;
let carritoActual = [];
let historialTransacciones = [];
let miNegocio = null;

// LOGICA DE NAVEGACION SINGLE WEB APP

const btnMenuPanel = document.getElementById("btn-menu-panel");
const btnMenuInventario = document.getElementById("btn-menu-inventario");
const btnMenuHistorial = document.getElementById("btn-menu-historial");
const btnAbrirTicket = document.getElementById("btn-abrir-ticket");
const btnCancelarTicket = document.getElementById("btn-cancelar-ticket");
const btnAgregarAlTicket = document.getElementById("btn-agregar-al-ticket");
const btnProcesarTicket = document.getElementById("btn-procesar-ticket");

const pantallaPanel = document.getElementById("pantalla-panel");
const pantallaInventario = document.getElementById("pantalla-inventario");
const pantallaHistorial = document.getElementById("pantalla-historial");
const pantallaTicket = document.getElementById("pantalla-ticket");
const tituloCabecera = document.getElementById("titulo-cabecera");

function ocultarTodasLasPantallas() {
    if (pantallaPanel) pantallaPanel.style.display = "none";
    if (pantallaInventario) pantallaInventario.style.display = "none";
    if (pantallaHistorial) pantallaHistorial.style.display = "none";
    if (pantallaTicket) pantallaTicket.style.display = "none";

    if (btnMenuPanel) btnMenuPanel.classList.remove("activo");
    if (btnMenuInventario) btnMenuInventario.classList.remove("activo");
    if (btnMenuHistorial) btnMenuHistorial.classList.remove("activo");
}

function activarMenuActivo(botonActivo) {
    if (btnMenuPanel) btnMenuPanel.classList.toggle("activo", botonActivo === btnMenuPanel);
    if (btnMenuInventario) btnMenuInventario.classList.toggle("activo", botonActivo === btnMenuInventario);
    if (btnMenuHistorial) btnMenuHistorial.classList.toggle("activo", botonActivo === btnMenuHistorial);
}

function mostrarPantalla(pantalla, titulo, botonActivo = null) {
    ocultarTodasLasPantallas();
    if (pantalla) pantalla.style.display = "block";
    if (tituloCabecera) tituloCabecera.innerHTML = titulo;
    activarMenuActivo(botonActivo);
}

function establecerFechaDispositivo() {
    const campoFecha = document.getElementById("fecha-actual");
    if (!campoFecha) return;

    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    campoFecha.value = `${anio}-${mes}-${dia}`;
}

// FUNCIONES DE RENDERIZADO

function renderizarTabla(tasaBCV) {
    const cuerpoTabla = document.getElementById("cuerpo-tabla-inventario");
    if (!cuerpoTabla || !miNegocio) return;

    cuerpoTabla.innerHTML = "";

    for (let i = 0; i < miNegocio.listaProductos.length; i++) {
        const prod = miNegocio.listaProductos[i];
        const precioBs = prod.calcPrecioBs(tasaBCV);
        const totalFilaUSD = prod.precioUSD * prod.cantidad;

        cuerpoTabla.innerHTML += `
            <tr>
                <td>${prod.nombre}</td>
                <td>${prod.cantidad}</td>
                <td>$${prod.precioUSD.toFixed(2)}</td>
                <td>Bs ${precioBs.toFixed(2)}</td>
                <td>$${totalFilaUSD.toFixed(2)}</td>
            </tr>
        `;
    }

    const lblTipos = document.getElementById("lbl-inv-tipos");
    const lblActivos = document.getElementById("lbl-inv-activos");

    if (lblTipos) lblTipos.innerHTML = miNegocio.listaProductos.length;
    if (lblActivos) lblActivos.innerHTML = `$${miNegocio.calcSubtotalUSD().toFixed(2)}`;
}

function renderizarCarrito() {
    const cuerpoTicket = document.getElementById("cuerpo-tabla-ticket");
    if (!cuerpoTicket) return;

    cuerpoTicket.innerHTML = "";

    let totalArticulosTicket = 0;
    let subtotalUsdTicket = 0;

    for (let i = 0; i < carritoActual.length; i++) {
        const item = carritoActual[i];
        const precioBs = item.precioUSD * tasaActualBCV;
        const totalFilaUSD = item.precioUSD * item.cantidad;

        totalArticulosTicket += item.cantidad;
        subtotalUsdTicket += totalFilaUSD;

        const tipoTexto = item.tipoOperacion === "venta" ? "Venta" : "Compra";

        cuerpoTicket.innerHTML += `
            <tr>
                <td>${item.nombre}</td>
                <td>${tipoTexto}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precioUSD.toFixed(2)}</td>
                <td>Bs ${precioBs.toFixed(2)}</td>
                <td>$${totalFilaUSD.toFixed(2)}</td>
            </tr>
        `;
    }

    // ACTUALIZAR TOTALES

    const totalBsTicket = subtotalUsdTicket * tasaActualBCV;
    const lblTotalArticulos = document.getElementById("lbl-total-articulos");
    const lblSubtotalUsd = document.getElementById("lbl-subtotal-usd");
    const lblTotalFinal = document.getElementById("lbl-total-final");

    if (lblTotalArticulos) lblTotalArticulos.innerHTML = totalArticulosTicket;
    if (lblSubtotalUsd) lblSubtotalUsd.innerHTML = `$${subtotalUsdTicket.toFixed(2)}`;
    if (lblTotalFinal) lblTotalFinal.innerHTML = `$${subtotalUsdTicket.toFixed(2)} / <br> Bs ${totalBsTicket.toFixed(2)}`;
}

function cargarSelectProductos() {
    const selectProducto = document.getElementById("select-producto-ticket");
    if (!selectProducto || !miNegocio) return;

    selectProducto.innerHTML = '<option value="">-- Seleccione un producto --</option>';

    for (let i = 0; i < miNegocio.listaProductos.length; i++) {
        const prod = miNegocio.listaProductos[i];

        if (prod.cantidad > 0) {
            const opcion = document.createElement("option");
            opcion.value = prod.codigo;
            opcion.text = `${prod.nombre} (Stock: ${prod.cantidad}) - $${prod.precioUSD.toFixed(2)}`;
            selectProducto.appendChild(opcion);
        }
    }
}

function reiniciarFormularioTicket() {
    const selectProducto = document.getElementById("select-producto-ticket");
    const inputCantidad = document.getElementById("input-cantidad-ticket");
    const selectTipoTransaccion = document.getElementById("select-tipo-transaccion");

    if (selectProducto) selectProducto.value = "";
    if (inputCantidad) inputCantidad.value = "1";
    if (selectTipoTransaccion) selectTipoTransaccion.value = "venta";
}

function limpiarCarrito() {
    carritoActual = [];
    renderizarCarrito();
    reiniciarFormularioTicket();
}

function renderizarHistorial() {
    const cuerpoHistorial = document.getElementById("cuerpo-tabla-historial");
    if (!cuerpoHistorial) return;

    cuerpoHistorial.innerHTML = "";

    if (historialTransacciones.length === 0) {
        cuerpoHistorial.innerHTML = `
            <tr>
                <td colspan="4">No hay transacciones registradas todavía.</td>
            </tr>
        `;
        return;
    }

    for (let i = historialTransacciones.length - 1; i >= 0; i--) {
        const tx = historialTransacciones[i];

        let tipoTexto = "Mixta";
        let icono = "🟡";

        if (tx.tipo === "venta") {
            tipoTexto = "Venta";
            icono = "🔴";
        } else if (tx.tipo === "compra") {
            tipoTexto = "Compra";
            icono = "🟢";
        }

        const detalle = Array.isArray(tx.detalle) && tx.detalle.length > 0
            ? tx.detalle.join("<br>")
            : "Sin detalle";

        cuerpoHistorial.innerHTML += `
            <tr>
                <td>${tx.ticket}</td>
                <td>${tx.fecha}</td>
                <td>${icono} ${tipoTexto}<br><small>${detalle}</small></td>
                <td>$${Number(tx.total || 0).toFixed(2)}</td>
            </tr>
        `;
    }
}

function renderizarDashboard() {

    let totalVentasUSD = 0;
    for (let i = 0; i < historialTransacciones.length; i++) {
        if (historialTransacciones[i].tipo === "venta") {
            totalVentasUSD += historialTransacciones[i].total;
        }
    }

    let totalStock = 0;
    if (miNegocio) {
        totalStock = miNegocio.calcTotalArticulos();
    }

    let htmlAlertas = "";
    let hayAlertas = false;

    if (miNegocio) {
        for (let i = 0; i < miNegocio.listaProductos.length; i++) {
            let prod = miNegocio.listaProductos[i];
            if (prod.cantidad < 5) {
                htmlAlertas += `<li>🔻 ${prod.nombre} (Quedan: ${prod.cantidad})</li>`;
                hayAlertas = true;
            }
        }
    }

    if (!hayAlertas) {
        htmlAlertas = "<li style='color: var(--color-exito);'>✅ Todo el stock está bien</li>";
    }

    // INYECTAMOS EN EL HTML

    const dashVentas = document.getElementById("dash-ventas");
    const dashStock = document.getElementById("dash-stock");
    const dashAlertas = document.getElementById("dash-alertas");

    if (dashVentas) dashVentas.innerHTML = `$${totalVentasUSD.toFixed(2)}`;
    if (dashStock) dashStock.innerHTML = totalStock;
    if (dashAlertas) dashAlertas.innerHTML = htmlAlertas;
}

function limpiarFormularioModalProducto() {
    const inputNombre = document.getElementById("input-nombre");
    const inputCantidad = document.getElementById("input-cantidad");
    const inputPrecio = document.getElementById("input-precio");

    if (inputNombre) inputNombre.value = "";
    if (inputCantidad) inputCantidad.value = "";
    if (inputPrecio) inputPrecio.value = "";
}

function crearProductoDesdeModal() {
    const inputNombre = document.getElementById("input-nombre");
    const inputCantidad = document.getElementById("input-cantidad");
    const inputPrecio = document.getElementById("input-precio");
    const modalProducto = document.getElementById("modal-producto");

    if (!inputNombre || !inputCantidad || !inputPrecio) return;

    const nombre = inputNombre.value.trim();
    const cantidad = parseInt(inputCantidad.value, 10);
    const precioUSD = parseFloat(inputPrecio.value);

    if (!nombre) {
        alert("⚠️ Debe ingresar el nombre del producto.");
        return;
    }

    if (isNaN(cantidad) || cantidad < 0) {
        alert("⚠️ La cantidad debe ser un número válido.");
        return;
    }

    if (isNaN(precioUSD) || precioUSD <= 0) {
        alert("⚠️ El precio debe ser mayor a cero.");
        return;
    }

    const codigo = `PROD-${Date.now()}`;

    const nuevoProducto = new Cl_Producto(codigo, nombre, cantidad, precioUSD);
    miNegocio.agregarProducto(nuevoProducto);

    renderizarTabla(tasaActualBCV);
    cargarSelectProductos();
    renderizarDashboard();

    limpiarFormularioModalProducto();

    if (modalProducto) modalProducto.style.display = "none";

    alert("✅ Producto agregado correctamente.");
}

// CONEXIÓN CON DOLARAPI Y FUNCIONES DE INICIALIZACIÓN

async function iniciarSistema() {
    try {
        const etiquetaTasa = document.querySelector(".tasa-bcv");
        if (etiquetaTasa) etiquetaTasa.innerHTML = "Tasa BCV: Buscando...";

        const respuesta = await fetch("https://ve.dolarapi.com/v1/dolares/oficial");
        const datos = await respuesta.json();

        tasaActualBCV = datos.promedio;

        if (etiquetaTasa) etiquetaTasa.innerHTML = `Tasa BCV: Bs ${tasaActualBCV}`;

        renderizarTabla(tasaActualBCV);
        cargarSelectProductos();
    } catch (error) {
        console.error("Error con la API:", error);
        const etiquetaTasa = document.querySelector(".tasa-bcv");
        if (etiquetaTasa) etiquetaTasa.innerHTML = "Tasa BCV: Error";
        renderizarTabla(1.00);
    }
}

function inicializarApp() {
    miNegocio = new Cl_Inventario();

    try {
        historialTransacciones = JSON.parse(localStorage.getItem("historialTransacciones") || "[]");
    } catch (error) {
        historialTransacciones = [];
    }

    // Menú
    if (btnMenuPanel) {
        btnMenuPanel.addEventListener("click", () => {
            mostrarPantalla(pantallaPanel, "Panel Principal", btnMenuPanel);
        });
    }

    if (btnMenuInventario) {
        btnMenuInventario.addEventListener("click", () => {
            mostrarPantalla(pantallaInventario, "Control de Inventario", btnMenuInventario);
        });
    }

    if (btnMenuHistorial) {
        btnMenuHistorial.addEventListener("click", () => {
            mostrarPantalla(pantallaHistorial, "Transacciones", btnMenuHistorial);
        });
    }

    // Modal nuevo producto

    const btnNuevoProducto = document.getElementById("btn-nuevo-producto");
    const modalProducto = document.getElementById("modal-producto");
    const btnCerrarModal = document.getElementById("btn-cerrar-modal");
    const btnGuardarProducto = document.getElementById("btn-guardar-producto");

    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener("click", () => {
            if (modalProducto) modalProducto.style.display = "flex";
        });
    }

    if (btnCerrarModal) {
        btnCerrarModal.addEventListener("click", () => {
            if (modalProducto) modalProducto.style.display = "none";
            limpiarFormularioModalProducto();
        });
    }

    if (modalProducto) {
        modalProducto.addEventListener("click", (e) => {
            if (e.target === modalProducto) {
                modalProducto.style.display = "none";
                limpiarFormularioModalProducto();
            }
        });
    }

    if (btnGuardarProducto) {
        btnGuardarProducto.addEventListener("click", crearProductoDesdeModal);
    }

    // Ticket

    if (btnAbrirTicket) {
        btnAbrirTicket.addEventListener("click", () => {
            mostrarPantalla(pantallaTicket, "Procesar Nueva Transacción");
            establecerFechaDispositivo();
        });
    }

    if (btnAgregarAlTicket) {
        btnAgregarAlTicket.addEventListener("click", () => {
            const selectProducto = document.getElementById("select-producto-ticket");
            const inputCantidad = document.getElementById("input-cantidad-ticket");
            const selectTipoTransaccion = document.getElementById("select-tipo-transaccion");

            if (!selectProducto || !inputCantidad || !selectTipoTransaccion) return;

            const tipoTransaccion = selectTipoTransaccion.value;
            const codigoSeleccionado = selectProducto.value;
            const cantidadOperacion = parseFloat(inputCantidad.value);

            if (!codigoSeleccionado) {
                alert("⚠️ Por favor, seleccione un producto.");
                return;
            }

            if (isNaN(cantidadOperacion) || cantidadOperacion <= 0) {
                alert("⚠️ Ingrese una cantidad válida.");
                return;
            }

            const productoReal = miNegocio.listaProductos.find(p => p.codigo === codigoSeleccionado);
            if (!productoReal) {
                alert("⚠️ No se encontró el producto.");
                return;
            }

            if (tipoTransaccion === "venta" && cantidadOperacion > productoReal.cantidad) {
                alert(`⚠️ Stock insuficiente. Solo quedan ${productoReal.cantidad}.`);
                return;
            }

            carritoActual.push({
                codigo: productoReal.codigo,
                nombre: productoReal.nombre,
                precioUSD: productoReal.precioUSD,
                cantidad: cantidadOperacion,
                tipoOperacion: tipoTransaccion
            });

            renderizarCarrito();
            reiniciarFormularioTicket();
        });
    }

    if (btnProcesarTicket) {
        btnProcesarTicket.addEventListener("click", () => {
            if (carritoActual.length === 0) {
                alert("⚠️ El carrito está vacío.");
                return;
            }

            let totalTicketUSD = 0;
            const fecha = document.getElementById("fecha-actual")?.value || new Date().toISOString().slice(0, 10);

            for (let i = 0; i < carritoActual.length; i++) {
                const item = carritoActual[i];
                const productoReal = miNegocio.listaProductos.find(p => p.codigo === item.codigo);

                if (!productoReal) {
                    alert(`⚠️ No se encontró ${item.nombre}`);
                    return;
                }

                if (item.tipoOperacion === "venta" && item.cantidad > productoReal.cantidad) {
                    alert(`⚠️ Stock insuficiente para ${item.nombre}`);
                    return;
                }
            }

            for (let i = 0; i < carritoActual.length; i++) {
                const item = carritoActual[i];
                const productoReal = miNegocio.listaProductos.find(p => p.codigo === item.codigo);

                if (!productoReal) continue;

                if (item.tipoOperacion === "venta") {
                    productoReal.cantidad -= item.cantidad;
                } else if (item.tipoOperacion === "compra") {
                    productoReal.cantidad += item.cantidad;
                }

                totalTicketUSD += item.precioUSD * item.cantidad;
            }

            miNegocio.guardarEnStorage();

            const tiposEnTicket = [...new Set(carritoActual.map(item => item.tipoOperacion))];
            const tipoFinal = tiposEnTicket.length === 1 ? tiposEnTicket[0] : "mixta";

            const numeroTicket = "TCK-" + Math.floor(Math.random() * 100000);

            historialTransacciones.push({
                ticket: numeroTicket,
                fecha,
                tipo: tipoFinal,
                total: totalTicketUSD,
                detalle: carritoActual.map(item =>
                    `${item.nombre} x${item.cantidad} (${item.tipoOperacion === "compra" ? "Compra" : "Venta"})`
                )
            });

            localStorage.setItem("historialTransacciones", JSON.stringify(historialTransacciones));

            carritoActual = [];

            renderizarTabla(tasaActualBCV);
            renderizarCarrito();
            renderizarHistorial();
            cargarSelectProductos();
            reiniciarFormularioTicket();
            renderizarDashboard();

            mostrarPantalla(pantallaHistorial, "Transacciones", btnMenuHistorial);
            alert(`Transacción procesada con éxito. Ticket: ${numeroTicket}`);
        });
    }

    if (btnCancelarTicket) {
        btnCancelarTicket.addEventListener("click", () => {
            limpiarCarrito();
            mostrarPantalla(pantallaHistorial, "Transacciones", btnMenuHistorial);
        });
    }

    renderizarHistorial();
    renderizarDashboard();
    iniciarSistema();
}

document.addEventListener("DOMContentLoaded", inicializarApp);