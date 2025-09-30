let contenedorImagen = document.getElementById("buscarImagen");
const Fecha = document.getElementById("datePicker");
const Buscar = document.getElementById("searchBtn");
let imagenActual = null;

Fecha.min = "1995-06-16";
Fecha.max = new Date().toISOString().split("T")[0];

Buscar.addEventListener("click", () => {
    let fechaSeleccionada = Fecha.value;

    if (!fechaSeleccionada) {
        mostrarAlerta("Por favor, selecciona una fecha válida.", "danger");
        return;
    }

    mostrarImagen(fechaSeleccionada).then(info => {
        imagenActual = info;

        let contenidoExtra = "";

        if (info.media_type === "image") {
            contenidoExtra = info.url ? 
                `<img src="${info.url}" alt="${info.title}" class="img-fluid rounded shadow imgstyle">` :
                `<p class="text-warning">📷 Imagen no encontrada para esta fecha</p>`;
        } 
        else if (info.media_type === "video") {
            contenidoExtra = `<iframe src="${info.url}" class="w-100 rounded shadow" height="400" allowfullscreen></iframe>`;
        } 
        else {
            contenidoExtra = `<p class="text-danger">Contenido no disponible para esta fecha</p>`;
        }

        contenedorImagen.innerHTML = `
            <div class="card contenedorImagen p-3">
                <h2>${info.title}</h2>
                ${contenidoExtra}
                <p class="mt-3">${info.explanation}</p>
                <button class="btn favoritoBtn" onclick="guardarFavorito()">Guardar como favorito ❤️</button>
            </div>
        `;
    });
});

function mostrarImagen(fechaSeleccionada) {
    return fetch(`https://api.nasa.gov/planetary/apod?api_key=k01fCWfBLaqzeQXDLdmSMG6izVuN5qle7Iv65kAJ&date=${fechaSeleccionada}`)
        .then(response => response.json())
        .then(data => ({
            title: data.title,
            url: data.url,
            explanation: data.explanation,
            media_type: data.media_type
        }))
        .catch(error => {
            console.error("Error al obtener datos de la NASA:", error);
            mostrarAlerta("Error al obtener datos de la NASA", "danger");
        });
}

function guardarFavorito() {
    if (!imagenActual) {
        mostrarAlerta('Primero busca una imagen o video para guardar.', "warning");
        return;
    }

    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    if (favoritos.some(item => item.title === imagenActual.title)) {
        mostrarAlerta('Este elemento ya está en tus favoritos.', "info");
        return;
    }

    favoritos.push(imagenActual);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    actualizarListaFavoritos();
    mostrarAlerta("Guardado en favoritos ✅", "success");
}

function actualizarListaFavoritos() {
    const favoritosDiv = document.getElementById('favoritos');
    favoritosDiv.innerHTML = '';
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    favoritos.forEach(data => {
        const favDiv = document.createElement('div');
        favDiv.classList.add("col-md-3");
        favDiv.innerHTML = `
            <div class="card card-favoritos p-2">
                <h5>${data.title}</h5>
                ${data.media_type === "image" 
                    ? `<img src="${data.url}" alt="${data.title}" class="img-fluid rounded">` 
                    : `<iframe src="${data.url}" class="w-100 rounded" height="150" allowfullscreen></iframe>`}
            </div>
        `;
        favoritosDiv.appendChild(favDiv);
    });
}

function mostrarAlerta(mensaje, tipo) {
    let alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} mt-3`;
    alerta.textContent = mensaje;
    document.querySelector(".container").prepend(alerta);
    setTimeout(() => alerta.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', actualizarListaFavoritos);
