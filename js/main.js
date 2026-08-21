const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const inputBusqueda = document.querySelector("#input-busqueda");

// Referencias del Modal
const modalPokemon = document.querySelector("#modal-pokemon");
const modalBody = document.querySelector("#modal-body");
const cerrarModal = document.querySelector("#cerrar-modal");

let URL = "https://pokeapi.co/api/v2/pokemon/";
let todosLosPokemon = [];

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

function mostrarPokemon(poke) {
    let tipos = poke.types.map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');
    let pokeId = poke.id.toString().padStart(4, '0');
    let alturaMetros = poke.height / 10;
    let pesoKilos = poke.weight / 10;

    let imagen = poke.sprites.other["official-artwork"].front_default 
                 || poke.sprites.front_default 
                 || "";

    const div = document.createElement("div");
    div.classList.add("pokemon");
    div.innerHTML = `
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

    // Mapeo de estadísticas de la API
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
    `;

    modalPokemon.classList.remove("desactivado");
}

// Eventos de cierre del modal
cerrarModal.addEventListener("click", () => modalPokemon.classList.add("desactivado"));

window.addEventListener("click", (e) => {
    if (e.target === modalPokemon) {
        modalPokemon.classList.add("desactivado");
    }
});

// Lógica de filtrado por categoría
botonesHeader.forEach(boton => boton.addEventListener("click", (event) => {
    const botonId = event.currentTarget.id;
    if (inputBusqueda) inputBusqueda.value = "";
    listaPokemon.innerHTML = "";

    todosLosPokemon.forEach(data => {
        if (botonId === "ver-todos") {
            mostrarPokemon(data);
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