
const tiempoSi = document.getElementById("tiempo-si-casual");
const tiempoNo = document.getElementById("tiempo-no-casual");
const contenedorTiempo = document.getElementById("tiempo-casual");
const barraMinutos = document.getElementById("barra-minutos-casual");
const minutosTexto = document.getElementById("minutos-casual");
const jugarCasual = document.getElementById("jugar-casual");

let conTiempo = true;

function elegirTiempo(valor) {
    conTiempo = valor;

    tiempoSi.classList.toggle("seleccionado", valor);
    tiempoNo.classList.toggle("seleccionado", !valor);

    contenedorTiempo.hidden = !valor;
}

tiempoSi.addEventListener("click", function() {
    elegirTiempo(true);
});

tiempoNo.addEventListener("click", function() {
    elegirTiempo(false);
});

barraMinutos.addEventListener("input", function() {
    minutosTexto.textContent = barraMinutos.value + " MIN";
});

jugarCasual.addEventListener("click", function() {
    sessionStorage.setItem("modoJuego", "Casual");
    sessionStorage.setItem("conTiempo", String(conTiempo));
    sessionStorage.setItem("minutosJuego", barraMinutos.value);

    sessionStorage.removeItem("finTiempoJuego");
    sessionStorage.removeItem("puntajeFinal");
    sessionStorage.removeItem("errorPuntaje");
});
