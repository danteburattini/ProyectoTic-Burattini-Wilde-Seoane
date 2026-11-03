const sfx = document.getElementById("sfx");
const musica = document.getElementById("musica");
const modoDark = document.getElementById("modoDark");

if (localStorage.getItem("sfx") === "false") {
    sfx.checked = false;
}

if (localStorage.getItem("musica") === "false") {
    musica.checked = false;
}

if (localStorage.getItem("modoDark") === "false") {
    modoDark.checked = false;
}

sfx.addEventListener("change", function() {
    localStorage.setItem("sfx", sfx.checked);
});

musica.addEventListener("change", function() {
    localStorage.setItem("musica", musica.checked);
});

modoDark.addEventListener("change", function() {
    localStorage.setItem("modoDark", modoDark.checked);
    actualizarTema();
});