// =======================
// VARIABLES
// =======================

let productos = [];
let ventaActual = [];

let indiceEditando = -1;

let ventas = Number(localStorage.getItem("ventas")) || 0;
let ventasDelDia = Number(localStorage.getItem("ventasDelDia")) || 0;

let historialVentas = [];
let historialDias = JSON.parse(localStorage.getItem("historialDias")) || [];

let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

let ticketSeleccionado = -1;

let hoy = new Date().toLocaleDateString();
let Fecha = localStorage.getItem("Fecha");

// =======================
// REINICIO DE DIA
// =======================

if (Fecha && Fecha !== hoy) {
    historialDias.push({ fecha: Fecha, total: ventasDelDia });

    ventasDelDia = 0;
    localStorage.setItem("ventasDelDia", 0);
    localStorage.setItem("Fecha", hoy);

    guardarDatos();
}

// =======================
// LOGIN
// =======================

function login() {
    let user = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;

    if (user === "admin" && pass === "1234") {
        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";
        document.getElementById("btnCerrarSesion").style.display = "block";

        renderHistorial();
        renderTickets();
        mostrarEstadisticas();
        renderHistorialDias();
    } else {
        mostrarAlerta("Error", "Usuario o contraseña incorrectos");
    }
}

function cerrarSesion() {
    document.getElementById("app").style.display = "none";
    document.getElementById("login").style.display = "block";
}

// =======================
// AGREGAR VENTA
// =======================

function agregarVentaRapida() {

    let nombre = document.getElementById("producto").value;
    let precio = Number(document.getElementById("precio").value);
    let cantidad = Number(document.getElementById("cantidad").value);

    if (!nombre || isNaN(precio) || isNaN(cantidad)) {
        alert("Completa todo");
        return;
    }

    let total = precio * cantidad;

    historialVentas.push({
        nombre,
        cantidad,
        total
    });

    renderHistorial();

    document.getElementById("producto").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("cantidad").value = "1";
}

// =======================
// RENDER HISTORIAL VENTAS (IZQUIERDA)
// =======================

function renderHistorial() {

    let contenedor = document.getElementById("historial");
    contenedor.innerHTML = "";

    historialVentas.forEach((v, i) => {
        contenedor.innerHTML += `
    <li>
        ${v.nombre} x${v.cantidad} - $${v.total}

        <button onclick="editarProducto(${i})">
            Editar
        </button>

        <button onclick="eliminarProducto(${i})">
            Eliminar
        </button>
    </li>
`;
    });
}

function eliminarProducto(i) {

    mostrarConfirmacion("Eliminar", "¿Seguro que querés eliminar este producto?", (ok) => {

        if (!ok) return;

        historialVentas.splice(i, 1);
        renderHistorial();
    });
}

function editarProducto(i) {

    indiceEditando = i;

    document.getElementById("editNombre").value =
        historialVentas[i].nombre;

    document.getElementById("editCantidad").value =
        historialVentas[i].cantidad;

    document.getElementById("editPrecio").value =
        historialVentas[i].total / historialVentas[i].cantidad;

    document.getElementById("modalEditar").style.display = "flex";
}

function cerrarModalEditar() {
    document.getElementById("modalEditar").style.display = "none";
}

function guardarEdicion() {

    let nombre =
        document.getElementById("editNombre").value;

    let cantidad =
        Number(document.getElementById("editCantidad").value);

    let precio =
        Number(document.getElementById("editPrecio").value);

    historialVentas[indiceEditando].nombre = nombre;
    historialVentas[indiceEditando].cantidad = cantidad;
    historialVentas[indiceEditando].total = cantidad * precio;

    renderHistorial();

    cerrarModalEditar();
}

// =======================
// CERRAR CAJA
// =======================

function cerrarCaja() {

    if (historialVentas.length === 0) {
    mostrarAlerta("Atención", "No hay ventas para finalizar");
    return;
}

    let total = 0;
    let texto = "TICKET FINAL\n\n";

    historialVentas.forEach(v => {
        texto += `${v.nombre} x${v.cantidad} = $${v.total}\n`;
        total += v.total;
    });

    texto += "\n-----------------\n";
    texto += `TOTAL: $${total}\n\n`;

    texto += `Fecha: ${new Date().toLocaleDateString()}\n`;
    texto += `Hora: ${new Date().toLocaleTimeString()}`;

    document.getElementById("ticket").textContent = texto;

    tickets.push({
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        total: total,
        productos: [...historialVentas],
        contenido: texto
    });

    historialVentas = [];

    renderHistorial();
    renderTickets();

    recalcularVentasDelDia();
    guardarDatos();

    mostrarAlerta("Guardado", "Venta finalizada correctamente");
}

// =======================
// TICKETS
// =======================

function renderTickets() {

    let lista = document.getElementById("historialTickets");
    lista.innerHTML = "";

    document.getElementById("tituloTickets").textContent =
        `Tickets Guardados (${tickets.length})`;

    tickets.forEach((t, i) => {

        lista.innerHTML += `
            <li>

                Ticket #${i + 1}
                <br>
                ${t.fecha}
                <br>
                ${t.hora}
                <br>
                Total: $${t.total}

                <br><br>

                <button onclick="toggleDetalle(${i}); event.stopPropagation();">
                    Ver productos
                </button>

                <button onclick="eliminarTicket(${i}, event); event.stopPropagation();">
                    Eliminar
                </button>

                <div id="detalle-${i}" style="display:none;"></div>

            </li>
        `;
    });
}

function toggleDetalle(i) {

    let div = document.getElementById(`detalle-${i}`);

    if (!div) return;

    if (div.style.display === "block") {
        div.style.display = "none";
        return;
    }

    let productos = tickets[i].productos || [];

    div.innerHTML = productos.map(p =>
        `<p>${p.nombre} x${p.cantidad} - $${p.total}</p>`
    ).join("");

    div.style.display = "block";
}

// =======================
// OTROS
// =======================

function limpiarTicket() {
    document.getElementById("ticket").textContent = "";
}

function mostrarEstadisticas() {

    let hoyTickets = tickets.filter(t =>
        t.fecha === new Date().toLocaleDateString()
    ).length;

    document.getElementById("estadisticas").innerHTML =
        `<span style="color:#d46a92">
            Tickets hoy: ${hoyTickets}<br>
            Total: $${ventasDelDia}
        </span>`;
}

function renderHistorialDias() {

    let lista = document.getElementById("historialDias");
    lista.innerHTML = "";

    historialDias.forEach(d =>
        lista.innerHTML += `<li>${d.fecha} - $${d.total}</li>`
    );
}

// =======================
// GUARDAR
// =======================

function guardarDatos() {
    localStorage.setItem("ventas", ventas);
    localStorage.setItem("ventasDelDia", ventasDelDia);
    localStorage.setItem("historialDias", JSON.stringify(historialDias));
    localStorage.setItem("tickets", JSON.stringify(tickets));
    localStorage.setItem("Fecha", hoy);
}

function cambiarTema() {

    document.body.classList.toggle("modo-oscuro");

    if (document.body.classList.contains("modo-oscuro")) {
        localStorage.setItem("tema", "oscuro");
        document.getElementById("btnTema").textContent = "☀️";
    } else {
        localStorage.setItem("tema", "claro");
        document.getElementById("btnTema").textContent = "🌙";
    }
}

// mantener tema al recargar
if (localStorage.getItem("tema") === "oscuro") {
    document.body.classList.add("modo-oscuro");
    document.getElementById("btnTema").textContent = "☀️";
}

function eliminarTicket(i, event) {

    event.stopPropagation();

    if (!confirm("¿Eliminar este ticket?")) return;

    tickets.splice(i, 1);

    guardarDatos();
    renderTickets();

    recalcularVentasDelDia();
}

function recalcularVentasDelDia() {

    let hoy = new Date().toLocaleDateString();

    ventasDelDia = 0;

    tickets.forEach(t => {
        if (t.fecha === hoy) {
            ventasDelDia += t.total;
        }
    });

    localStorage.setItem("ventasDelDia", ventasDelDia);

    mostrarEstadisticas();
    renderHistorialDias();
}

function buscarTicketsPorFecha() {

    let fechaBuscada = document.getElementById("buscarFecha").value;

    let lista = document.getElementById("historialTickets");
    lista.innerHTML = "";

    if (!fechaBuscada) {
        renderTickets();
        return;
    }

    let partes = fechaBuscada.split("-");

    let fechaInput =
        Number(partes[2]) + "/" +
        Number(partes[1]) + "/" +
        partes[0];

    let filtrados = tickets.filter(t =>
        t.fecha === fechaInput
    );

    if (filtrados.length === 0) {
        lista.innerHTML = "<li>No hay tickets para esta fecha</li>";
        return;
    }

    filtrados.forEach((t) => {

        let i = tickets.findIndex(ticket => ticket === t);

        lista.innerHTML += `
            <li>

                Ticket #${i + 1}
                <br>
                ${t.fecha}
                <br>
                ${t.hora}
                <br>
                Total: $${t.total}

                <br><br>

                <button onclick="toggleDetalle(${i})">
                    Ver productos
                </button>

                <button onclick="eliminarTicket(${i}, event); event.stopPropagation();">
                    Eliminar
                </button>

                <div id="detalle-${i}" style="display:none;"></div>

            </li>
        `;
    });
}

function actualizarFechaHora() {

    let ahora = new Date();

    let fecha = ahora.toLocaleDateString();

    let hora = ahora.toLocaleTimeString();

    document.getElementById("fechaHora").textContent =
    `${fecha} | ${hora}`;
}

setInterval(actualizarFechaHora, 1000);

actualizarFechaHora();

function soloNumeros(event) {
    if (
        (event.key >= '0' && event.key <= '9') ||
        event.key === 'Backspace' ||
        event.key === 'Delete' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'Tab'
    ) {
        return true;
    } else {
        event.preventDefault();
    }
}

function mostrarAlerta(titulo, texto) {

    let modal = document.getElementById("modalAlerta");

    document.getElementById("alertaTitulo").textContent = titulo;
    document.getElementById("alertaTexto").textContent = texto;

    // ocultamos botón cancelar si es solo mensaje
    document.getElementById("btnCancelar").style.display = "none";
    document.getElementById("btnAceptar").textContent = "OK";

    modal.style.display = "flex";

    document.getElementById("btnAceptar").onclick = () => {
        modal.style.display = "none";

        // restaurar botones
        document.getElementById("btnCancelar").style.display = "inline-block";
        document.getElementById("btnAceptar").textContent = "Aceptar";
    };
}

function cerrarAlerta(event) {
    if (event.target.id === "modalAlerta") {
        document.getElementById("modalAlerta").style.display = "none";
    }
}

// =======================
// CONFIRMACIÓN MODAL
// =======================

function mostrarConfirmacion(titulo, texto, callback) {

    let modal = document.getElementById("modalAlerta");

    document.getElementById("alertaTitulo").textContent = titulo;
    document.getElementById("alertaTexto").textContent = texto;

    modal.style.display = "flex";

    document.getElementById("btnAceptar").onclick = () => {
        modal.style.display = "none";
        callback(true);
    };

    document.getElementById("btnCancelar").onclick = () => {
        modal.style.display = "none";
        callback(false);
    };
}

document.addEventListener("keydown", function (event) {

    const modal = document.getElementById("modalAlerta");

    const modalAbierto = modal.style.display === "flex";

    // 🔥 si modal abierto → Enter SOLO sirve para modal
    if (modalAbierto) {

        if (event.key === "Enter") {
            event.preventDefault();
            event.stopImmediatePropagation();
            document.getElementById("btnAceptar").click();
        }

        if (event.key === "Escape") {
            event.preventDefault();
            event.stopImmediatePropagation();
            document.getElementById("btnCancelar").click();
        }

        return; // ❌ no deja que nada más se ejecute
    }

}, true);