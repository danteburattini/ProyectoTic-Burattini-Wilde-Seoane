
const tutorialInicio = document.getElementById("tutorialInicio");
const tutorialExplicacion = document.getElementById("tutorialExplicacion");
const botonEmpezar = document.getElementById("tutorialEmpezar");
const botonAvanzar = document.getElementById("tutorialAvanzar");
const descripcion = document.getElementById("tutorialDescripcion");

const barraTutorial = document.getElementById("barraTutorial");
const anioTutorial = document.getElementById("tutorialAnio");
const anteriorTutorial = document.getElementById("tutorialAnterior");
const siguienteTutorial = document.getElementById("siguienteAnio");

let pasoTutorial = 1;
let mapaTutorial;
let marcadorTutorial;

botonEmpezar.addEventListener("click", function() {
    pasoTutorial = 2;

    tutorialInicio.hidden = true;
    tutorialExplicacion.hidden = false;

    mapaTutorial = L.map("mapaTutorial").fitBounds([
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
        botonAvanzar.classList.add("tutorialBotonFinal");
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
