document.addEventListener("DOMContentLoaded", () => {
    const barrasRanking = document.querySelectorAll(".ranked-list .rank-bar");

    const mejoresJugadores = [
        { nombre: "Bochini_10", puntos: 24500 },
        { nombre: "Maradona_Diego", puntos: 23800 },
        { nombre: "Messi_Lio", puntos: 23100 },
        { nombre: "Charly_G", puntos: 21900 },
        { nombre: "Spinetta_L", puntos: 20400 },
        { nombre: "San_Martin", puntos: 19500 },
        { nombre: "Borges_J", puntos: 18200 }
    ];

    barrasRanking.forEach((barra, indice) => {
        if (mejoresJugadores[indice]) {
            barra.textContent = `${mejoresJugadores[indice].nombre} - ${mejoresJugadores[indice].puntos} pts`;
            barra.style.paddingLeft = "10px";
            barra.style.color = "#000";
            barra.style.fontWeight = "bold";
        }
    });
});