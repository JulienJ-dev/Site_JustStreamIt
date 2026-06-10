const API_URL = "http://localhost:8000/api/v1";

async function getMovies(url, numberOfMovies) {
    let movies = [];
    let nextUrl = url;

    while (movies.length < numberOfMovies && nextUrl) {
        const response = await fetch(nextUrl);
        const data = await response.json();

        movies = movies.concat(data.results);
        nextUrl = data.next;
    }

    return movies.slice(0, numberOfMovies);
}

async function getMovieDetails(movieUrl) {
    const response = await fetch(movieUrl);
    return await response.json();
}

function createMovieCard(movie) {
    return `
        <article class="movie-card">
            <img class="movie-image" src="${movie.image_url}" alt="Affiche de ${movie.title}" data-url="${movie.url}" >

            <div class="bandeau-vignette">
                <h4>${movie.title}</h4>
                <button class="details-button" type="button" data-url="${movie.url}">
                    Détails
                </button>
            </div>
        </article>
    `;
}

function displayMovies(selector, movies) {
    const container = document.querySelector(selector);
    container.innerHTML = "";

    for (let movie of movies) {
        container.innerHTML += createMovieCard(movie);
    }
}

async function displayBestMovie() {
    const movies = await getMovies(API_URL + "/titles/?sort_by=-imdb_score", 1);
    const movie = await getMovieDetails(movies[0].url);

    const container = document.querySelector(".best-movie-card");

    container.innerHTML = `
        <img class="best-movie-image" src="${movie.image_url}" alt="Affiche de ${movie.title}" data-url="${movie.url}">

        <div class="best-movie-content">
            <h3>${movie.title}</h3>
            <p>${movie.description}</p>
            <button class="best-movie-details-button" type="button" data-url="${movies[0].url}">
                Détails
            </button>
        </div>
    `;
}

async function loadMovies() {
    const bestRatedMovies = await getMovies(API_URL + "/titles/?sort_by=-imdb_score", 6);
    displayMovies(".top-rated-grid", bestRatedMovies);

    const mysteryMovies = await getMovies(API_URL + "/titles/?genre=Mystery&sort_by=-imdb_score", 6);
    displayMovies(".mystery-grid", mysteryMovies);

    const westernMovies = await getMovies(API_URL + "/titles/?genre=Western&sort_by=-imdb_score", 6);
    displayMovies(".western-grid", westernMovies);

    const selectedCategory = document.querySelector("#category-select").value;
    const categoryMovies = await getMovies(API_URL + "/titles/?genre=" + selectedCategory + "&sort_by=-imdb_score", 6);
    displayMovies(".category-grid", categoryMovies);
}

async function openModal(movieUrl) {
    const movie = await getMovieDetails(movieUrl);
    const modal = document.querySelector("#movie-modal");

    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-mobile-button" type="button">×</button>

            <div class="modal-infos">
                <h2>${movie.title}</h2>

                <p>${movie.year} - ${movie.genres.join(", ")}</p>
                <p>${movie.rated} - ${movie.duration} minutes (${movie.countries.join(" / ")})</p>
                <p>IMDB score : ${movie.imdb_score}/10</p>
                <p>Recettes au box-office : ${movie.worldwide_gross_income || "N/A"}</p>

                <div class="modal-directors">
                    <strong>Réalisé par :</strong>
                    <p>${movie.directors.join(", ")}</p>
                </div>
            </div>

            <p class="modal-description">${movie.long_description}</p>

            <img class="modal-image" src="${movie.image_url}" alt="Affiche de ${movie.title}">

            <div class="modal-actors">
                <strong>Avec :</strong>
                <p>${movie.actors.join(", ")}</p>
            </div>

            <button class="close-modal-button" type="button">Fermer</button>
        </div>
    `;

    modal.style.display = "block";

    document.querySelector(".close-modal-button").addEventListener("click", function () {
        modal.style.display = "none";
    });

    document.querySelector(".close-mobile-button").addEventListener("click", function () {
        modal.style.display = "none";
    });
}

function setupEvents() {
    document.addEventListener("click", function (event) {
        if (
            event.target.classList.contains("details-button") ||
            event.target.classList.contains("best-movie-details-button") ||
            event.target.classList.contains("best-movie-image") ||
            event.target.classList.contains("movie-image")
        ) {
            openModal(event.target.dataset.url);
        }
    });

    document.querySelector("#category-select").addEventListener("change", async function () {
        const movies = await getMovies(API_URL + "/titles/?genre=" + this.value + "&sort_by=-imdb_score", 6);
        displayMovies(".category-grid", movies);
    });

    document.querySelector(".see-more-button").addEventListener("click", function () {
        const grid = document.querySelector(".top-rated-grid");
        grid.classList.toggle("is-open");

        if (grid.classList.contains("is-open")) {
            this.textContent = "Voir moins";
        } else {
            this.textContent = "Voir plus";
        }
    });
}

displayBestMovie();
loadMovies();
setupEvents();