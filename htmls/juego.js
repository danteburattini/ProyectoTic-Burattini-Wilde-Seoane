document.addEventListener("DOMContentLoaded", () => {
    const fotografias = [
        { src: "imagen1.jpg", añoCorrecto: 1816, xReal: 150, yReal: 300 },
        { src: "imagen2.jpg", añoCorrecto: 1986, xReal: 220, yReal: 180 },
        { src: "imagen3.jpg", añoCorrecto: 1945, xReal: 180, yReal: 250 },
        { src: "imagen4.jpg", añoCorrecto: 2001, xReal: 210, yReal: 290 },
        { src: "imagen5.jpg", añoCorrecto: 1969, xReal: 140, yReal: 210 }
    ];

    let rondaActual = 0;
    let puntajeTotal = 0;
    let añoSeleccionado = 2026;
    let clicX = null;
    let clicY = null;

    const gamePhoto = document.querySelector(".game-photo");
    const gameMap = document.querySelector(".game-map");
    const labelRound = document.querySelector(".round-badge span");
    const labelPoints = document.querySelector(".points-badge span");

    const botonesFlecha = document.querySelectorAll(".arrow-btn");
    const visorAño = document.querySelector(".year-val");
    const btnConfirmar = document.getElementById("btn-confirmar") || document.querySelector(".game-map-container button");

    const iniciarRonda = () => {
        if (rondaActual >= 5) {
            localStorage.setItem("puntajeFinal", puntajeTotal);
            window.location.href = "pantallafinal.html";
            return;
        }

        const fotoData = fotografias[rondaActual];
        if (gamePhoto) {
            gamePhoto.style.backgroundImage = `url('${fotoData.src}')`;
        }
        
        if (labelRound) {
            labelRound.textContent = `${rondaActual + 1}/5`;
        }
        
        añoSeleccionado = 2026;
        if (visorAño) {
            visorAño.textContent = añoSeleccionado;
        }

        clicX = null;
        clicY = null;
        
        const marcador = document.getElementById("marcador-jugador");
        if (marcador) marcador.remove();
    };

    if (botonesFlecha.length >= 2 && visorAño) {
        botonesFlecha[0].addEventListener("click", () => {
            añoSeleccionado--;
            visorAño.textContent = añoSeleccionado;
        });

        botonesFlecha[1].addEventListener("click", () => {
            añoSeleccionado++;
            visorAño.textContent = añoSeleccionado;
        });
    }

    if (gameMap) {
        gameMap.style.position = "relative";
        gameMap.addEventListener("click", (e) => {
            const rect = gameMap.getBoundingClientRect();
            clicX = e.clientX - rect.left;
            clicY = e.clientY - rect.top;

            let marcador = document.getElementById("marcador-jugador");
            if (!marcador) {
                marcador = document.createElement("div");
                marcador.id = "marcador-jugador";
                marcador.style.position = "absolute";
                marcador.style.width = "12px";
                marcador.style.height = "12px";
                marcador.style.backgroundColor = "red";
                marcador.style.borderRadius = "50%";
                marcador.style.transform = "translate(-50%, -50%)";
                gameMap.appendChild(marcador);
            }
            marcador.style.left = `${clicX}px`;
            marcador.style.top = `${clicY}px`;
        });
    }

    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", () => {
            if (clicX === null || clicY === null) {
                alert("Por favor, seleccioná un lugar en el mapa antes de confirmar.");
                return;
            }

            const fotoData = fotografias[rondaActual];

            const diferenciaAños = Math.abs(añoSeleccionado - fotoData.añoCorrecto);
            let puntosAño = 2500 - (diferenciaAños * 100);
            if (puntosAño < 0) puntosAño = 0;

            const distanciaPixeles = Math.sqrt(Math.pow(clicX - fotoData.xReal, 2) + Math.pow(clicY - fotoData.yReal, 2));
            let puntosDistancia = 2500 - Math.round(distanciaPixeles * 10);
            if (puntosDistancia < 0) puntosDistancia = 0;

            const puntosRonda = puntosAño + puntosDistancia;
            puntajeTotal += puntosRonda;
            
            if (labelPoints) {
                labelPoints.textContent = puntajeTotal;
            }

            alert(`PUNTAJE DE LA RONDA: ${puntosRonda} PUNTOS\n\n- Por Año (${fotoData.añoCorrecto}): ${puntosAño} pts.\n- Por Distancia: ${puntosDistancia} pts.`);

            rondaActual++;
            iniciarRonda();
        });
    }

    iniciarRonda();
});

