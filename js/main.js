const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const inputBusqueda = document.querySelector("#input-busqueda");

// Referencias del Modal
const modalPokemon = document.querySelector("#modal-pokemon");
const modalBody = document.querySelector("#modal-body");
const cerrarModal = document.querySelector("#cerrar-modal");

let URL = "https://pokeapi.co/api/v2/pokemon/";
let todosLosPokemon = [];

// Obtener favoritos guardados de localStorage o iniciar arreglo vacío
let favoritos = JSON.parse(localStorage.getItem("pokemons_favoritos")) || [];

// Carga inicial de datos
async function cargarPokemones() {
    for (let i = 1; i <= 1025; i++) {
        try {
            const res = await fetch(URL + i);
            const data = await res.json();
            
            todosLosPokemon.push(data);
            mostrarPokemon(data);
        } catch (error) {
            console.error(`Error al cargar el Pokémon #${i}:`, error);
        }
    }
}

cargarPokemones();

// Alternar Pokémon en favoritos
function toggleFavorito(id) {
    const index = favoritos.indexOf(id);
    if (index === -1) {
        favoritos.push(id);
    } else {
        favoritos.splice(index, 1);
    }
    // Guardar en el almacenamiento local del navegador
    localStorage.setItem("pokemons_favoritos", JSON.stringify(favoritos));
}

function mostrarPokemon(poke) {
    let tipos = poke.types.map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');
    let pokeId = poke.id.toString().padStart(4, '0');
    let alturaMetros = poke.height / 10;
    let pesoKilos = poke.weight / 10;

    let imagen = poke.sprites.other["official-artwork"].front_default 
                 || poke.sprites.front_default 
                 || "";

    const esFav = favoritos.includes(poke.id);

    const div = document.createElement("div");
    div.classList.add("pokemon");
    div.innerHTML = `
        <button class="btn-favorito ${esFav ? 'activo' : ''}" data-id="${poke.id}">
            ${esFav ? '❤️' : '🤍'}
        </button>
        <p class="pokemon-id-back">#${pokeId}</p>
        <div class="pokemon-imagen">
            <img src="${imagen}" alt="${poke.name}">
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <p class="pokemon-id">#${pokeId}</p>
                <h2 class="pokemon-nombre">${poke.name}</h2>
            </div>
            <div class="pokemon-tipos">
                ${tipos}
            </div>
            <div class="pokemon-stats">
                <p class="stat">${alturaMetros}m</p>
                <p class="stat">${pesoKilos}kg</p>
            </div>
        </div>
    `;

    // Evento para el botón de favoritos en la tarjeta
    const btnFav = div.querySelector(".btn-favorito");
    btnFav.addEventListener("click", (e) => {
        e.stopPropagation(); // Evita abrir el modal al hacer clic en el corazón
        toggleFavorito(poke.id);
        
        const nuevoEstado = favoritos.includes(poke.id);
        btnFav.classList.toggle("activo", nuevoEstado);
        btnFav.innerHTML = nuevoEstado ? '❤️' : '🤍';
    });

    // Evento para abrir el modal al hacer clic en la tarjeta
    div.addEventListener("click", () => abrirModalDetail(poke));

    listaPokemon.append(div);
}

// Función para rellenar y mostrar el modal
function abrirModalDetail(poke) {
    let tipos = poke.types.map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');
    let pokeId = poke.id.toString().padStart(4, '0');
    let alturaMetros = poke.height / 10;
    let pesoKilos = poke.weight / 10;
    let imagen = poke.sprites.other["official-artwork"].front_default || poke.sprites.front_default || "";

    let statsHTML = poke.stats.map(s => {
        let porcentaje = Math.min((s.base_stat / 255) * 100, 100);
        return `
            <div class="stat-linea">
                <span class="stat-nombre">${s.stat.name}</span>
                <span style="width: 30px; text-align: right;">${s.base_stat}</span>
                <div class="stat-barra-bg">
                    <div class="stat-barra-fill" style="width: ${porcentaje}%;"></div>
                </div>
            </div>
        `;
    }).join('');

    const esFav = favoritos.includes(poke.id);

    modalBody.innerHTML = `
        <div class="modal-header">
            <p class="pokemon-id">#${pokeId}</p>
            <h2 class="pokemon-nombre" style="font-size: 1.8rem; margin-top: 0.2rem;">${poke.name}</h2>
        </div>
        <div class="modal-imagen">
            <img src="${imagen}" alt="${poke.name}">
        </div>
        <div class="pokemon-tipos" style="margin-bottom: 1rem;">
            ${tipos}
        </div>
        <div class="pokemon-stats" style="justify-content: center; margin-bottom: 1rem;">
            <p class="stat">Altura: <b>${alturaMetros} m</b></p>
            <p class="stat">Peso: <b>${pesoKilos} kg</b></p>
        </div>
        <h3 style="font-size: 1rem; text-align: center; margin-bottom: 0.5rem;">ESTADÍSTICAS</h3>
        <div class="modal-stats-detalladas">
            ${statsHTML}
        </div>
        <button id="btn-fav-modal" class="btn-favorito-modal ${esFav ? 'activo' : ''}">
            <span>${esFav ? '❤️ Quitar de Favoritos' : '🤍 Agregar a Favoritos'}</span>
        </button>
    `;

    // Manejador del botón de favoritos del modal
    const btnFavModal = document.querySelector("#btn-fav-modal");
    btnFavModal.addEventListener("click", () => {
        toggleFavorito(poke.id);
        const nuevoEstado = favoritos.includes(poke.id);
        
        btnFavModal.classList.toggle("activo", nuevoEstado);
        btnFavModal.querySelector("span").textContent = nuevoEstado ? 'Quitar de Favoritos' : 'Agregar a Favoritos';
        
        // Actualiza el estado visual del botón de la tarjeta de fondo
        const btnTarjeta = document.querySelector(`.btn-favorito[data-id="${poke.id}"]`);
        if (btnTarjeta) {
            btnTarjeta.classList.toggle("activo", nuevoEstado);
            btnTarjeta.innerHTML = nuevoEstado ? '❤️' : '🤍';
        }
    });

    modalPokemon.classList.remove("desactivado");
}

// Eventos de cierre del modal
cerrarModal.addEventListener("click", () => modalPokemon.classList.add("desactivado"));

window.addEventListener("click", (e) => {
    if (e.target === modalPokemon) {
        modalPokemon.classList.add("desactivado");
    }
});

// Lógica de filtrado por categoría y vista de Favoritos
botonesHeader.forEach(boton => boton.addEventListener("click", (event) => {
    const botonId = event.currentTarget.id;
    if (inputBusqueda) inputBusqueda.value = "";
    listaPokemon.innerHTML = "";

    todosLosPokemon.forEach(data => {
        if (botonId === "ver-todos") {
            mostrarPokemon(data);
        } else if (botonId === "ver-favoritos") {
            // Muestra solo los Pokémon que están guardados en favoritos
            if (favoritos.includes(data.id)) {
                mostrarPokemon(data);
            }
        } else {
            const tipos = data.types.map(type => type.type.name);
            if (tipos.includes(botonId)) {
                mostrarPokemon(data);
            }
        }
    });
}));

// Lógica del buscador
if (inputBusqueda) {
    inputBusqueda.addEventListener("input", (e) => {
        const textoBusqueda = e.target.value.toLowerCase().trim();
        listaPokemon.innerHTML = "";

        const pokemonesFiltrados = todosLosPokemon.filter(poke => {
            const nombre = poke.name.toLowerCase();
            const id = poke.id.toString();
            return nombre.includes(textoBusqueda) || id.includes(textoBusqueda);
        });

        pokemonesFiltrados.forEach(data => mostrarPokemon(data));
    });
}