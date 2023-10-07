'use strict';
//constantes para traer elementos de HTML
const searchInput = document.querySelector('.js-search-text');
const searchButton = document.querySelector('.js-search-btn');
const showList = document.querySelector('.js-list');
const favList = document.querySelector('.js-fav-list');
const resetButton = document.querySelector('.js-reset-btn');

//arrays vacíos para almacenar las series que buscamos y para las favoritas
let shows = [];
let favShowsList = [];

//constante para la url
const urlApi = `https://api.tvmaze.com/search/shows?q=girls`;
//constante para la imagen que aparece si la serie no tiene imagen
const defaultImage = `https://img.freepik.com/premium-vector/no-photography-sign-sticker-with-text-inscription-isolated-background_226544-351.jpg?w=200`;

//cargar la página de favo desde el localStorage al levantar la página
favShowsList = JSON.parse(localStorage.getItem('favShowsList')) || [];
renderFavList(favShowsList);

//función para buscar una serie por el input, hacer la petición y si coincide traerla
function searchShows(event) {
  event.preventDefault();
  let inputValue = searchInput.value;
  let url = `https://api.tvmaze.com/search/shows?q=${inputValue}`;
  //petición a la Api y procesa la respuesta JSON para extraer la información de la serie
  fetch(url)
    .then((response) => response.json())
    .then((dataApi) => {
      console.log(dataApi);
      shows = []; //limpia la lista de series
      for (const item of dataApi) {
        let urlImage = defaultImage;
        //si la serie no tiene imagen sale la imagen por defecto y si la tiene muestra la imagen
        if (item.show.image !== null) {
          urlImage = item.show.image.medium;
        }
        //objeto de serie con lo que quiero traer de la api
        let objectShow = {
          id: item.show.id,
          name: item.show.name,
          photo: urlImage,
        };

        //agregar la serie a la lista
        shows.push(objectShow);
      }
      //pinta la lista de series
      renderShowList(shows);
    });
}

//función que recibe un objeto de serie y crea el HTM para mostrarlo en la lista de series, si está ya en la lista de favoritas le añade la clase favorite
function renderShow(oneShow) {
  let objectShow = '';
  const isFav = favShowsList.some((favShow) => favShow.id === oneShow.id);
  if (isFav) {
    objectShow = `<li class="card js-card favorite" id="${oneShow.id}">
      <h3 class="show-name">${oneShow.name}</h3>
      <img class="card-img" src="${oneShow.photo}" title=${oneShow.name} alt="${oneShow.name}"/>
      </li>`;
  } else {
    objectShow = `<li class="card js-card" id="${oneShow.id}">
    <h3 class="show-name">${oneShow.name}</h3>
    <img class="card-img" src="${oneShow.photo}" title=${oneShow.name} alt="${oneShow.name}"/>
    </li>`;
  }
  //devuelve la tarjeta de la serie
  return objectShow;
}

//función para pintar la lista de series según el input que recibe
function renderShowList(shows) {
  showList.innerHTML = ''; //limpia el contenido actual de la lista
  for (const item of shows) {
    showList.innerHTML += renderShow(item);
  }
  addEventsToShows();
}

//FUNCIÓN PARA AÑADIR UNA SERIE A LA LISTA DE FAVORITAS
function addToFav(event) {
  event.preventDefault();
  //obtengo el id de la serie seleccionada al hacer click
  const isAlreadyFav = parseInt(event.currentTarget.id);
  //elemento encontrado por id en la lista de series
  const foundShow = shows.find((show) => show.id === isAlreadyFav);
  //comprobar si ya está en el listado de favoritos
  const indexFav = favShowsList.findIndex(
    (oneShow) => oneShow.id === isAlreadyFav
  );
  //condicional para que la ponga en la lista si coincide el id
  if (indexFav === -1) {
    //si no está en la lista la agregas
    favShowsList.push(foundShow);
    event.currentTarget.classList.add('favorite'); //agrega la clase favorite para cambiar estilos
  } else {
    //si está, lo quito con splice(dónde lo elimino, cuántos elimino)
    favShowsList.splice(indexFav, 1);
    event.currentTarget.classList.remove('favorite'); //quita la clase favorite para cambiar estilos
  }

  renderFavList(favShowsList); //actualiza la lista de favoritas y la guarda
  localStorage.setItem('favShowsList', JSON.stringify(favShowsList));
}

//función para pintar la lista de favoritas
function renderFavList(favShows) {
  const favListHTML = favShows
    .map((item) => {
      return `
      <li class="card js-card favorite" id="${item.id}">
        <span class="x-fav" id="remove${item.id}">X</span> <!-- Botón X -->
        <h3 class="show-name">${item.name}</h3>
        <img class="card-img" src="${item.photo}" title="${item.name}" alt="${item.name}"/>
      </li>
    `;
    })
    .join('');
  // Agregar la lista de favoritos al elemento HTML favList
  favList.innerHTML = favListHTML;

  // Asignar eventos de clic a los botones "X" para eliminar programas
  favShows.forEach((item) => {
    const removeButton = document.getElementById(`remove${item.id}`);
    removeButton.addEventListener('click', () => removeFromFav(item.id));
  });
}

//función handle que añade una serie favorita a su lista al hacer click
function addEventsToShows() {
  const favShows = document.querySelectorAll('.js-card');
  for (const item of favShows) {
    item.addEventListener('click', addToFav);
  }
  renderFavList(favShowsList);
}

//eliminar un programa de la lista de favoritos
function removeFromFav(showId) {
  // Encuentra el índice del programa en la lista de favoritos
  const indexFav = favShowsList.findIndex((oneShow) => oneShow.id === showId);

  if (indexFav !== -1) {
    // Elimina el programa de la lista de favoritos
    favShowsList.splice(indexFav, 1);

    // Actualiza la lista de favoritos en la interfaz de usuario
    renderFavList(favShowsList);

    // Actualiza la lista de favoritos en el almacenamiento local
    localStorage.setItem('favShowsList', JSON.stringify(favShowsList));
  }
}

//función que elimina las series favoritas
function resetFavList() {
  //vacía la lista de favoritas y en el localStorage
  favShowsList = [];
  localStorage.removeItem('favShowsList');
  //pinta la lista de favoritas que estará vacía
  renderFavList(favShowsList);
}

//evento click que llama a la función que elimina la lista de favoritas
resetButton.addEventListener('click', resetFavList);
//evento click que llama a la función que busca serie y la trae
searchButton.addEventListener('click', searchShows);
