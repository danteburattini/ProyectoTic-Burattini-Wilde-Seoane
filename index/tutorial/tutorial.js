
const tutorialInicio = document.getElementById("tutorial-inicio");
const tutorialExplicacion = document.getElementById("tutorial-explicacion");
const botonEmpezar = document.getElementById("tutorial-empezar");
const botonAvanzar = document.getElementById("tutorial-avanzar");
const descripcion = document.getElementById("tutorial-descripcion");

const barraTutorial = document.getElementById("tutorial-range");
const anioTutorial = document.getElementById("tutorial-anio");
const anteriorTutorial = document.getElementById("tutorial-anterior");
const siguienteTutorial = document.getElementById("tutorial-siguiente-anio");

let pasoTutorial = 1;
let mapaTutorial;
let marcadorTutorial;

botonEmpezar.addEventListener("click", function() {
    pasoTutorial = 2;

    tutorialInicio.hidden = true;
    tutorialExplicacion.hidden = false;

    mapaTutorial = L.map("mapa-tutorial").fitBounds([
        [-55, -74],
        [-21, -53]
    ]);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18
    }).addTo(mapaTutorial);

    mapaTutorial.on("click", function(evento) {
        if (marcadorTutorial) {
            mapaTutorial.removeLayer(marcadorTutorial);
        }

        marcadorTutorial = L.marker(evento.latlng).addTo(mapaTutorial);
    });

    mapaTutorial.invalidateSize();
});

barraTutorial.addEventListener("input", function() {
    anioTutorial.textContent = barraTutorial.value;
});

anteriorTutorial.addEventListener("click", function() {
    if (Number(barraTutorial.value) > 1900) {
        barraTutorial.value = Number(barraTutorial.value) - 1;
        anioTutorial.textContent = barraTutorial.value;
    }
});

siguienteTutorial.addEventListener("click", function() {
    if (Number(barraTutorial.value) < 2026) {
        barraTutorial.value = Number(barraTutorial.value) + 1;
        anioTutorial.textContent = barraTutorial.value;
    }
});

botonAvanzar.addEventListener("click", function() {
    if (pasoTutorial === 2) {
        pasoTutorial = 3;

        descripcion.textContent = "Luego de poner el año y el lugar, presioná el botón CONTINUAR para pasar a la siguiente foto.";

        botonAvanzar.textContent = "CONTINUAR";
        botonAvanzar.classList.add("tutorial-boton-final");
    } else {
        const parametros = new URLSearchParams(window.location.search);
        const origen = parametros.get("desde");

        if (origen === "futbol") {
            window.location.href = "../modofutbol/modofutbol.html";
        } else {
            window.location.href = "../modocasual/modocasual.html";
        }
    }
});
