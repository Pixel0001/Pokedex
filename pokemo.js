const container = document.querySelector('.all-cards');
const template = document.querySelector('#pokemon-template');
const searchInput = document.querySelector('.search-bar');

const allPokemons = [];


searchInput.addEventListener('input', (e) => {
  const value = e.target.value.toLowerCase().trim();

  allPokemons.forEach(pokemon => {
    const isVisible = pokemon.name.toLowerCase().includes(value) || pokemon.id.replace('#', '').includes(value);
    pokemon.element.classList.toggle('hide', !isVisible);
  });
});


async function fetchPokemons() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=649');
    const data = await response.json();

    for (const pokemon of data.results) {

      const id = pokemon.url.split('/')[6];
      const clone = template.content.cloneNode(true);

      clone.querySelector('.id-text').textContent = `#${id}`;
      clone.querySelector('.imagine').src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
      clone.querySelector('.imagine').alt = pokemon.name;
      const nume = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
      clone.querySelector('.name-text').textContent = nume;

      const cardElement = clone.querySelector('.card');
      container.appendChild(cardElement);

      allPokemons.push({
        name: pokemon.name,                   
        id: `#${id}`,                         
        element: cardElement                 
    });
    }
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
  }
}

fetchPokemons();
container.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    
    if (card) {
      const id = card.querySelector('.id-text').textContent.replace('#', '').trim();
      if (id) {
        window.location.href = `detail.html?id=${id}`;
      }
    }
  });
  