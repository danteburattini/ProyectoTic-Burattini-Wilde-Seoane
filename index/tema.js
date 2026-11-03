function actualizarTema() {
    if (localStorage.getItem("modoDark") === "false") {
        document.body.classList.add("modo-claro");
    } else {
        document.body.classList.remove("modo-claro");
    }
}

actualizarTema();