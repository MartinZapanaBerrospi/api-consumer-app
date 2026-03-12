const searchInput = document.getElementById('pokemon-input');
const searchBtn = document.getElementById('search-btn');
const pokemonCard = document.getElementById('pokemon-card');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');

// API Base URL
const API_URL = 'https://pokeapi.co/api/v2/pokemon/';

// Event Listeners
searchBtn.addEventListener('click', searchPokemon);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchPokemon();
    }
});

async function searchPokemon() {
    let query = searchInput.value.trim().toLowerCase();
    
    // Si la búsqueda está vacía, buscamos a pikachu por defecto o no hacemos nada
    if (!query) {
        query = 'pikachu';
    }

    // Ocultar resultados previos / errores y mostrar loader
    pokemonCard.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const response = await fetch(`${API_URL}${query}`);
        
        if (!response.ok) {
            throw new Error('Pokemon not found');
        }
        
        const data = await response.json();
        updateUI(data);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        loader.classList.add('hidden');
        errorMessage.classList.remove('hidden');
    }
}

function updateUI(pokemon) {
    // 1. Ocultar Loader & Mostrar Tarjeta
    loader.classList.add('hidden');
    pokemonCard.classList.remove('hidden');

    // 2. Información Básica
    document.getElementById('pokemon-name').textContent = pokemon.name;
    document.getElementById('pokemon-id').textContent = `#${String(pokemon.id).padStart(3, '0')}`;
    
    // Imagen principal (Official Artwork)
    const imgUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
    document.getElementById('pokemon-image').src = imgUrl;

    // Altura y Peso (La API los devuelve en decímetros y hectogramos)
    document.getElementById('pokemon-height').textContent = `${(pokemon.height / 10).toFixed(1)} m`;
    document.getElementById('pokemon-weight').textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;

    // 3. Tipos
    const typesContainer = document.getElementById('pokemon-types');
    typesContainer.innerHTML = '';
    
    pokemon.types.forEach(typeInfo => {
        const typeName = typeInfo.type.name;
        const span = document.createElement('span');
        span.classList.add('type-badge');
        span.textContent = typeName;
        // Obtenemos el color directamente desde CSS si existe el mapeo, si no gris
        span.style.backgroundColor = `var(--type-${typeName}, #8b8b8b)`;
        typesContainer.appendChild(span);
    });

    // 4. Estadísticas Base
    const statsMap = {
        'hp': 'hp',
        'attack': 'attack',
        'defense': 'defense',
        'speed': 'speed'
    };

    // Reseteamos barras primero para la animación
    Object.values(statsMap).forEach(statId => {
        document.getElementById(`stat-${statId}`).style.width = '0%';
    });

    // Pequeño timeout para que se note la animación al rellenarse
    setTimeout(() => {
        pokemon.stats.forEach(stat => {
            const statName = stat.stat.name;
            const baseValue = stat.base_stat;
            
            if (statsMap[statName]) {
                const domId = statsMap[statName];
                document.getElementById(`val-${domId}`).textContent = baseValue;
                
                // Calculamos el % asumiendo que el máx stat estándar ronda los 255.
                const percentage = Math.min((baseValue / 200) * 100, 100);
                const barElement = document.getElementById(`stat-${domId}`);
                
                barElement.style.width = `${percentage}%`;
                
                // Color de la barra dependiendo del valor
                if (percentage < 30) {
                    barElement.style.backgroundColor = 'var(--error)';
                } else if (percentage < 60) {
                    barElement.style.backgroundColor = 'var(--type-electric)'; // Amarillo
                } else {
                    barElement.style.backgroundColor = 'var(--success)';
                }
            }
        });
    }, 50);
}

// Cargar a Pikachu por defecto al abrir la página
window.onload = () => {
    searchInput.value = 'pikachu';
    searchPokemon();
};
