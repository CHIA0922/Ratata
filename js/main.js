const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const inputBusqueda = document.querySelector("#input-busqueda");

// Referencias del Modal
const modalPokemon = document.querySelector("#modal-pokemon");
const modalBody = document.querySelector("#modal-body");
const cerrarModal = document.querySelector("#cerrar-modal");

// Referencias del Modo Oscuro/Claro
const btnTheme = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");

let URL = "https://pokeapi.co/api/v2/pokemon/";
let todosLosPokemon = [];

// Obtener favoritos guardados de localStorage o iniciar arreglo vacío
let favoritos = JSON.parse(localStorage.getItem("pokemons_favoritos")) || [];

// 1. Lógica para Persistencia de Modo Oscuro / Claro
const temaGuardado = localStorage.getItem("tema_pokedex");

if (temaGuardado === "oscuro") {
    document.body.classList.add("dark-mode");
    if (themeIcon) themeIcon.textContent = "☀️";
} else {
    if (themeIcon) themeIcon.textContent = "🌙";
}

if (btnTheme) {
    btnTheme.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const esOscuro = document.body.classList.contains("dark-mode");
        
        if (themeIcon) {
            themeIcon.textContent = esOscuro ? "☀️" : "🌙";
        }
        
        localStorage.setItem("tema_pokedex", esOscuro ? "oscuro" : "claro");
    });
}

// 2. Carga inicial de datos desde PokéAPI
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

// 3. Función para alternar estado de favoritos
function toggleFavorito(id) {
    const index = favoritos.indexOf(id);
    if (index === -1) {
        favoritos.push(id);
    } else {
        favoritos.splice(index, 1);
    }
    localStorage.setItem("pokemons_favoritos", JSON.stringify(favoritos));
}

// 4. Renderizado de tarjeta individual
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

    // Evento para el botón de favoritos dentro de la tarjeta
    const btnFav = div.querySelector(".btn-favorito");
    btnFav.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorito(poke.id);
        
        const nuevoEstado = favoritos.includes(poke.id);
        btnFav.classList.toggle("activo", nuevoEstado);
        btnFav.innerHTML = nuevoEstado ? '❤️' : '🤍';
    });

    // Evento para abrir el modal al hacer clic en la tarjeta
    div.addEventListener("click", () => abrirModalDetail(poke));

    listaPokemon.append(div);
}

// 5. Renderizado y despliegue del modal
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
            <span>${esFav ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}</span>
        </button>
    `;

    // Manejador del botón de favoritos del modal
    const btnFavModal = document.querySelector("#btn-fav-modal");
    btnFavModal.addEventListener("click", () => {
        toggleFavorito(poke.id);
        const nuevoEstado = favoritos.includes(poke.id);
        
        btnFavModal.classList.toggle("activo", nuevoEstado);
        btnFavModal.querySelector("span").textContent = nuevoEstado ? 'Quitar de Favoritos' : 'Agregar a Favoritos';
        
        // Sincroniza la tarjeta en la cuadrícula de fondo
        const btnTarjeta = document.querySelector(`.btn-favorito[data-id="${poke.id}"]`);
        if (btnTarjeta) {
            btnTarjeta.classList.toggle("activo", nuevoEstado);
            btnTarjeta.innerHTML = nuevoEstado ? '❤️' : '🤍';
        }
    });

    modalPokemon.classList.remove("desactivado");
}

// Eventos para cerrar el modal
cerrarModal.addEventListener("click", () => modalPokemon.classList.add("desactivado"));

window.addEventListener("click", (e) => {
    if (e.target === modalPokemon) {
        modalPokemon.classList.add("desactivado");
    }
});

// 6. Filtrado por categorías y vista de Favoritos
botonesHeader.forEach(boton => boton.addEventListener("click", (event) => {
    const botonId = event.currentTarget.id;
    if (inputBusqueda) inputBusqueda.value = "";
    listaPokemon.innerHTML = "";

    todosLosPokemon.forEach(data => {
        if (botonId === "ver-todos") {
            mostrarPokemon(data);
        } else if (botonId === "ver-favoritos") {
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

// 7. Lógica del buscador por texto o ID
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

// 8. Seguimiento del cursor para la luz (glow)
document.addEventListener("mousemove", (e) => {
    const glow = document.querySelector(".cursor-glow");
    if (glow) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
    }
});