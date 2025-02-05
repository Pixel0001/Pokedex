let currentPokemonId = null;

const typeColors = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#EE99AC",
  steel: "#B8B8D0"
};

function rgbaFromHex(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function setElementStyles(element, cssProperty, value) {
  if (element) {
    element.style[cssProperty] = value;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const MAX_POKEMONS = 649;
  const params = new URLSearchParams(window.location.search);
  const pokemonID = params.get("id");
  const id = parseInt(pokemonID, 10);

  if (!id || id < 1 || id > MAX_POKEMONS) {
    window.location.href = "./index.html";
    return;
  }

  currentPokemonId = id;
  loadPokemon(id);
});

async function loadPokemon(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(res => res.json())
    ]);

    if (currentPokemonId === id) {
      displayPokemonDetails(pokemon, pokemonSpecies);
      window.history.pushState({}, "", `./detail.html?id=${id}`);
    }
  } catch (error) {
    console.error("A apărut o eroare la preluarea datelor Pokémon:", error);
  }
}

function navigatePokemon(newId) {
  currentPokemonId = newId;
  loadPokemon(newId);
}

function setTypeBackgroundColor(pokemon) {
  const mainType = pokemon.types[0].type.name;
  const color = typeColors[mainType];

  if (!color) {
    console.warn(`Nu este definită o culoare pentru tipul: ${mainType}`);
    return;
  }

  document.body.style.backgroundColor = color;

  const upperContainer = document.querySelector(".upper-container");
  setElementStyles(upperContainer, "backgroundColor", color);

  const detailMain = document.querySelector(".detail-main");
  setElementStyles(detailMain, "backgroundColor", color);

  const rgbaColor = rgbaFromHex(color);
  const existingStyleTag = document.getElementById("progressBarStyles");
  if (existingStyleTag) {
    existingStyleTag.remove();
  }
  const styleTag = document.createElement("style");
  styleTag.id = "progressBarStyles";
  styleTag.innerHTML = `
    .progress-bar::-webkit-progress-bar {
      background-color: rgba(${rgbaColor}, 0.5);
    }
    .progress-bar::-webkit-progress-value {
      background-color: ${color};
    }
  `;
  document.head.appendChild(styleTag);
}

function getEnglishFlavorText(pokemonSpecies) {
  for (let entry of pokemonSpecies.flavor_text_entries) {
    if (entry.language.name === "en") {
      return entry.flavor_text.replace(/\f/g, " ");
    }
  }
  return "";
}

function displayPokemonDetails(pokemon, pokemonSpecies) {
  const { name, id, types, weight, height, abilities, stats } = pokemon;
  const capitalizedName = capitalizeFirstLetter(name);

  document.title = capitalizedName;

  const numePokemonText = document.querySelector(".nume-pokemon-text");
  if (numePokemonText) numePokemonText.textContent = capitalizedName;

  const idPokemonText = document.querySelector(".id-pokemon-text");
  if (idPokemonText) idPokemonText.textContent = `#${String(id).padStart(3, "0")}`;

  const pokemonImg = document.querySelector(".img-pokemon img");
  if (pokemonImg) {
    pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
    pokemonImg.alt = capitalizedName;

    pokemonImg.style.width = "200px";  
    pokemonImg.style.height = "200px"; 
    pokemonImg.style.objectFit = "contain";
  }

  const powerText = document.querySelector(".power-text");
  if (powerText && types.length > 0) {
    powerText.textContent = capitalizeFirstLetter(types[0].type.name);
  }

  setTypeBackgroundColor(pokemon);

  const sections = document.querySelectorAll(".info-pokemon .section1");

  if (sections.length >= 3) {
    const weightElem = sections[0].querySelector(".section1-wrap .weight-text");
    if (weightElem) {
      weightElem.textContent = `${weight / 10} kg`;
    }

    const heightElem = sections[1].querySelector(".section1-wrap .weight-text");
    if (heightElem) {
      heightElem.textContent = `${height / 10} m`;
    }

    const moveElem = sections[2].querySelector(".section1-wrap .weight-text");
    if (moveElem) {
      const abilitiesList = abilities.map(item => capitalizeFirstLetter(item.ability.name));
      moveElem.textContent = abilitiesList.join(", ");
    }
  }

  const flavorText = getEnglishFlavorText(pokemonSpecies);
  const infoTextWrap = document.querySelector(".info-text-wrap");
  if (infoTextWrap) infoTextWrap.textContent = flavorText;
  const filteredStats = stats.filter(({ stat }) =>
    ["hp", "attack", "defense", "speed"].includes(stat.name)
  );

  const statsContainer = document.querySelector(".stats");
  if (statsContainer) {
    statsContainer.innerHTML = "";
    const statNameMapping = {
      hp: "HP",
      attack: "ATK",
      defense: "DEF",
      speed: "SPD"
    };

    filteredStats.forEach(({ stat, base_stat }) => {
      const statDiv = document.createElement("div");
      statDiv.className = "stats-wrap";

      const statName = document.createElement("p");
      statName.textContent = statNameMapping[stat.name] || stat.name.toUpperCase();
      statDiv.appendChild(statName);

      const separator = document.createElement("div");
      separator.className = "linie-verticala1";
      statDiv.appendChild(separator);
      const statValue = document.createElement("p");
      statValue.textContent = String(base_stat).padStart(3, "0");
      statDiv.appendChild(statValue);
      const progress = document.createElement("progress");
      progress.className = "progress-bar";
      progress.value = base_stat;
      progress.max = 100;
      statDiv.appendChild(progress);
      statsContainer.appendChild(statDiv);
    });
  }

  const prevPokemon = document.querySelector(".previos-pokemon");
  const nextPokemon = document.querySelector(".next-pokemon");

  if (prevPokemon) {
    prevPokemon.replaceWith(prevPokemon.cloneNode(true));
  }
  if (nextPokemon) {
    nextPokemon.replaceWith(nextPokemon.cloneNode(true));
  }

  const prevBtn = document.querySelector(".previos-pokemon");
  const nextBtn = document.querySelector(".next-pokemon");

  if (prevBtn && id > 1) {
    prevBtn.addEventListener("click", () => navigatePokemon(id - 1));
  }
  if (nextBtn && id < 151) {
    nextBtn.addEventListener("click", () => navigatePokemon(id + 1));
  }
}
function setTypeBackgroundColor(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType];
  
    if (!color) {
      console.warn(`Nu este definită o culoare pentru tipul: ${mainType}`);
      return;
    }
  
    document.body.style.backgroundColor = color;
  
    const upperContainer = document.querySelector(".upper-container");
    setElementStyles(upperContainer, "backgroundColor", color);
  
    const detailMain = document.querySelector(".detail-main");
    setElementStyles(detailMain, "backgroundColor", color);
  
    const powerWrap = document.querySelector(".power-wrap");
    setElementStyles(powerWrap, "backgroundColor", color);
  
    const rgbaColor = rgbaFromHex(color);
    const existingStyleTag = document.getElementById("progressBarStyles");
    if (existingStyleTag) {
      existingStyleTag.remove();
    }
    const styleTag = document.createElement("style");
    styleTag.id = "progressBarStyles";
    styleTag.innerHTML = `
      .progress-bar::-webkit-progress-bar {
        background-color: rgba(${rgbaColor}, 0.5);
      }
      .progress-bar::-webkit-progress-value {
        background-color: ${color};
      }
    `;
    document.head.appendChild(styleTag);
  }
  