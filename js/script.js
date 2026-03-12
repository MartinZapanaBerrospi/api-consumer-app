const searchInput = document.getElementById('pokemon-input');
const searchBtn = document.getElementById('search-btn');
const pokemonCard = document.getElementById('pokemon-card');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');

// Elementos UI Avanzados
const btnSound = document.getElementById('btn-sound');
const btnShiny = document.getElementById('btn-shiny');
const historyContainer = document.getElementById('history-container');
const historyTags = document.getElementById('history-tags');
const suggestionsList = document.getElementById('suggestions-list');

// Estado Global de la App
let currentPokemonData = null;
let isShiny = false;
let currentAudio = null;
let searchHistory = JSON.parse(localStorage.getItem('pokeHistory')) || [];
let allPokemonList = []; 

// API URLs
const API_BASE = 'https://pokeapi.co/api/v2';

// ----------------------------------------------------
// Event Listeners y Lógica Inicial
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    updateHistoryUI();
    fetchAllPokemon();
    
    // Búsqueda por botón o Enter
    searchBtn.addEventListener('click', () => triggerSearch());
    
    // Manejo del Input para Autocompletado
    searchInput.addEventListener('input', handleAutocomplete);
    
    // Detectar Enter o navegación por teclado en sugerencias
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            suggestionsList.classList.add('hidden');
            triggerSearch();
        }
    });

    // Cerrar sugerencias al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.classList.add('hidden');
        }
    });

    // Toggle Shiny
    btnShiny.addEventListener('click', toggleShiny);

    // Reproducir Sonido
    btnSound.addEventListener('click', playSound);

    // Búsqueda por defecto
    triggerSearch('pikachu', false);
});

// ----------------------------------------------------
// Funcionalidad Autocompletado Predictivo
// ----------------------------------------------------

// Descargar los Pokemon la primera vez y guardarlos en memoria
async function fetchAllPokemon() {
    try {
        const response = await fetch(`${API_BASE}/pokemon?limit=10000`);
        const data = await response.json();
        // Guardamos nombre y extraemos el ID directamente de la URL para optimizar
        allPokemonList = data.results.map(pokemon => {
            const urlParts = pokemon.url.split('/');
            const id = urlParts[urlParts.length - 2];
            return {
                name: pokemon.name,
                id: parseInt(id) // Útil por si usuario escribe números
            };
        });
    } catch (error) {
        console.error("No se pudo cargar la lista de autocompletado", error);
    }
}

function handleAutocomplete(e) {
    const value = e.target.value.toLowerCase().trim();
    suggestionsList.innerHTML = '';
    
    if (!value) {
        suggestionsList.classList.add('hidden');
        return;
    }

    // Filtrar Pokémon por nombre o ID exacto
    const filtered = allPokemonList.filter(p => 
        p.name.includes(value) || p.id.toString() === value
    ).slice(0, 10); // Mostrar máximo 10 sugerencias para no saturar UI

    if (filtered.length === 0) {
        suggestionsList.classList.add('hidden');
        return;
    }

    // Renderizar lista
    filtered.forEach(pokemon => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        
        li.innerHTML = `
            <span>${pokemon.name}</span>
            <span class="suggestion-id">#${pokemon.id}</span>
        `;
        
        li.addEventListener('click', () => {
            searchInput.value = pokemon.name;
            suggestionsList.classList.add('hidden');
            triggerSearch(pokemon.name);
        });
        
        suggestionsList.appendChild(li);
    });
    
    suggestionsList.classList.remove('hidden');
}

async function triggerSearch(query = null, saveToHistory = true) {
    let searchTerm = query || searchInput.value.trim().toLowerCase();
    
    suggestionsList.classList.add('hidden'); // Siempre ocultar al buscar
    
    if (!searchTerm) return;
    
    // Reset estado
    isShiny = false;
    btnShiny.classList.remove('active');
    btnSound.classList.remove('active');
    if(currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    // UI Loading State (Skeleton Loader)
    pokemonCard.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        // 1. Fetch Principal: Datos básicos del Pokémon
        const response = await fetch(`${API_BASE}/pokemon/${searchTerm}`);
        if (!response.ok) throw new Error('Pokemon no encontrado');
        
        currentPokemonData = await response.json();
        
        // 2. Fetch de Especie (Para descripción y cadena de evolución)
        const speciesRes = await fetch(currentPokemonData.species.url);
        const speciesData = await speciesRes.json();
        
        // 3. Obtener Descripción (Flavor Text) en español (o fallback inglés)
        let description = "Descripción no disponible.";
        const esEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
        const enEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        
        if (esEntry) {
            description = esEntry.flavor_text.replace(/[\f\n\r]/g, " ");
        } else if (enEntry) {
            description = enEntry.flavor_text.replace(/[\f\n\r]/g, " ");
        }

        // 4. Fetch Cadena de Evolución
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();
        
        // Render UI
        updateMainUI(currentPokemonData, description);
        renderEvolutions(evoData.chain);
        
        // Actualizar Local Storage
        if (saveToHistory) {
            addToHistory(currentPokemonData.name);
        }

    } catch (error) {
        console.error('Error:', error);
        loader.classList.add('hidden');
        errorMessage.classList.remove('hidden');
    }
}

// ----------------------------------------------------
// UI Updates Main Card
// ----------------------------------------------------
function updateMainUI(pokemon, description) {
    loader.classList.add('hidden');
    pokemonCard.classList.remove('hidden');

    // Nombre ID y Descripción
    document.getElementById('pokemon-name').textContent = pokemon.name;
    document.getElementById('pokemon-id').textContent = `#${String(pokemon.id).padStart(3, '0')}`;
    document.getElementById('pokemon-description').textContent = `"${description}"`;
    
    // Imagen principal
    updatePokemonImage();

    // Altura y Peso
    document.getElementById('pokemon-height').textContent = `${(pokemon.height / 10).toFixed(1)} m`;
    document.getElementById('pokemon-weight').textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;

    // Configurar Audio (Cries en formato latest, fallback a legacy)
    const audioUrl = pokemon.cries?.latest || pokemon.cries?.legacy;
    if (audioUrl) {
        currentAudio = new Audio(audioUrl);
        currentAudio.volume = 0.5;
        btnSound.style.display = 'flex';
    } else {
        btnSound.style.display = 'none';
        currentAudio = null;
    }

    // Tipos
    const typesContainer = document.getElementById('pokemon-types');
    typesContainer.innerHTML = '';
    pokemon.types.forEach(typeInfo => {
        const typeName = typeInfo.type.name;
        const span = document.createElement('span');
        span.classList.add('type-badge');
        span.textContent = typeName;
        span.style.backgroundColor = `var(--type-${typeName}, #8b8b8b)`;
        typesContainer.appendChild(span);
    });

    // Barras de Stats Animadas
    const statsMap = {
        'hp': 'hp',
        'attack': 'attack',
        'defense': 'defense',
        'speed': 'speed'
    };

    Object.values(statsMap).forEach(statId => document.getElementById(`stat-${statId}`).style.width = '0%');

    setTimeout(() => {
        pokemon.stats.forEach(stat => {
            const statName = stat.stat.name;
            if (statsMap[statName]) {
                const baseValue = stat.base_stat;
                const domId = statsMap[statName];
                
                document.getElementById(`val-${domId}`).textContent = baseValue;
                
                const percentage = Math.min((baseValue / 200) * 100, 100);
                const barElement = document.getElementById(`stat-${domId}`);
                barElement.style.width = `${percentage}%`;
                
                if (percentage < 30) barElement.style.backgroundColor = 'var(--error)';
                else if (percentage < 60) barElement.style.backgroundColor = 'var(--type-electric)';
                else barElement.style.backgroundColor = 'var(--success)';
            }
        });
    }, 50);
}

// ----------------------------------------------------
// Features Avanzadas (Shiny, Sonido, Historial, Evoluciones)
// ----------------------------------------------------

function toggleShiny() {
    if (!currentPokemonData) return;
    isShiny = !isShiny;
    btnShiny.classList.toggle('active');
    updatePokemonImage();
}

function updatePokemonImage() {
    const sprites = currentPokemonData.sprites;
    const offArtwork = sprites.other['official-artwork'];
    const fallbackImage = sprites.front_default; // if official doesn't exist

    let imgUrl = isShiny 
        ? (offArtwork.front_shiny || sprites.front_shiny || fallbackImage)
        : (offArtwork.front_default || fallbackImage);
    
    document.getElementById('pokemon-image').src = imgUrl;
}

function playSound() {
    if (currentAudio) {
        currentAudio.currentTime = 0; // Reiniciar
        currentAudio.play();
        
        btnSound.classList.add('active');
        currentAudio.onended = () => {
            btnSound.classList.remove('active');
        };
    }
}

// Historial Local Storage
function addToHistory(name) {
    // Si ya existe, lo eliminamos para ponerlo primero
    searchHistory = searchHistory.filter(item => item !== name);
    searchHistory.unshift(name);
    if (searchHistory.length > 5) searchHistory.pop(); // Solo top 5
    
    localStorage.setItem('pokeHistory', JSON.stringify(searchHistory));
    updateHistoryUI();
}

function updateHistoryUI() {
    historyTags.innerHTML = '';
    
    if (searchHistory.length === 0) {
        historyContainer.classList.add('hidden');
        return;
    }
    
    historyContainer.classList.remove('hidden');
    searchHistory.forEach(historyName => {
        const tag = document.createElement('span');
        tag.className = 'history-tag';
        tag.textContent = historyName;
        tag.onclick = () => {
            searchInput.value = historyName;
            triggerSearch(historyName);
        };
        historyTags.appendChild(tag);
    });
}

// Parsear y Renderizar Árbol Evolutivo Recursivo
function renderEvolutions(chain) {
    const container = document.getElementById('evolutions-container');
    container.innerHTML = '';
    
    const evolutionsList = [];
    
    // Función recursiva para extraer toda la línea principal (maneja en orden la API)
    function extractEvolutions(node) {
        if (!node) return;
        evolutionsList.push(node.species.name);
        if (node.evolves_to && node.evolves_to.length > 0) {
            extractEvolutions(node.evolves_to[0]); // Toma la primera rama
        }
    }
    
    extractEvolutions(chain);

    if(evolutionsList.length <= 1) {
        container.innerHTML = '<span class="history-label">No tiene evoluciones</span>';
        return;
    }

    // Identificar el pokemon actual para destacarlo
    const currentName = currentPokemonData.name.toLowerCase();
    
    // Crear un identificador único para este renderizado
    // para evitar que promesas "viejas" de clicks anteriores inyecten elementos
    const renderId = Date.now();
    container.dataset.renderId = renderId;

    evolutionsList.forEach((evoName, index) => {
        // Fetch sprite básico para la evolución miniatura
        fetch(`${API_BASE}/pokemon/${evoName}`)
            .then(res => res.json())
            .then(data => {
                // Si el usuario ya buscó otra cosa mientras cargaba, abortar
                if (container.dataset.renderId != renderId) return;

                const stepDiv = document.createElement('div');
                stepDiv.className = 'evo-step';
                
                // Aplicar clase especial si es el actual
                if (evoName === currentName) {
                    stepDiv.classList.add('current-evo');
                    stepDiv.title = 'Estás viendo este Pokémon';
                } else {
                    stepDiv.title = 'Click para buscar';
                    stepDiv.onclick = () => {
                        searchInput.value = evoName;
                        triggerSearch(evoName);
                    };
                }
                
                stepDiv.innerHTML = `
                    <img src="${data.sprites.front_default || data.sprites.other['official-artwork'].front_default}" alt="${evoName}">
                    <span class="evo-name">${evoName}</span>
                `;
                
                // Como las promesas pueden resolverse en distinto orden, 
                // insertamos en la posición correcta usando order de CSS Flexbox
                stepDiv.style.order = index * 2;
                
                container.appendChild(stepDiv);
                
                // Si no es el último, dibujar flechita
                if (index < evolutionsList.length - 1) {
                    const arrowSpan = document.createElement('span');
                    arrowSpan.className = 'evo-arrow';
                    arrowSpan.innerHTML = '➔';
                    arrowSpan.style.order = (index * 2) + 1; // La flecha siempre va después del item
                    container.appendChild(arrowSpan);
                }
            });
    });
}
