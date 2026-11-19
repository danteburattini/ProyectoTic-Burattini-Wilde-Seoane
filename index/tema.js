function actualizarTema() {
    if (localStorage.getItem("modoDark") === "false") {
        document.body.classList.add("temaClaro");
    } else {
        document.body.classList.remove("temaClaro");
    }
}

actualizarTema();