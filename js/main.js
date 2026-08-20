const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
let URL = "https://pokeapi.co/api/v2/pokemon/";

// Arreglo donde guardaremos todos los Pokémon ya procesados
let todosLosPokemon = [];

// Función para cargar los 1025 Pokémon de forma controlada
async function cargarPokemones() {
    for (let i = 1; i <= 1025; i++) {
        try {
            const res = await fetch(URL + i);
            const data = await res.json();
            
            // Guardamos la información en memoria
            todosLosPokemon.push(data);
            
            // Renderizamos inmediatamente en orden según va llegando
            mostrarPokemon(data);
        } catch (error) {
            console.error(`Error al cargar el Pokémon #${i}:`, error);
        }
    }
}

// Iniciar la carga
cargarPokemones();

function mostrarPokemon(poke) {
    let tipos = poke.types.map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');

    // Formateo para que mantenga ceros a la izquierda (ej. 0001, 0025, 0150, 1025)
    let pokeId = poke.id.toString().padStart(4, '0');

    // Conversión correcta de la PokéAPI: decímetros a metros / hectogramos a kilos
    let alturaMetros = poke.height / 10;
    let pesoKilos = poke.weight / 10;

    // Fallback por si algún Pokémon de generaciones altas no tiene official-artwork
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
    listaPokemon.append(div);
}

// Lógica de los botones de filtrado instantáneo
botonesHeader.forEach(boton => boton.addEventListener("click", (event) => {
    const botonId = event.currentTarget.id;
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