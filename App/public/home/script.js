const movies = [
    {
        title: "Jurassic World - Il Dominio",
        description: "I dinosauri ora vivono e cacciano insieme agli umani in tutto il mondo. Questo fragile equilibrio rimodellerà il futuro.",
        ageRating: "PG-13",
        thumbnail: "../../img/jurassic.jpg",
        videoFileName: "jurassic_word.mp4"
    },
    {
        title: "Interstellar",
        description: "Un gruppo di esploratori intraprende un viaggio spaziale attraverso un wormhole alla ricerca di una nuova casa per l'umanità.",
        ageRating: "13+",
        thumbnail: "../../img/interstellar.jpg",
        videoFileName: "interstellar_trailer.mp4"
    },
    {
        title: "The Batman",
        description: "Gotham City è terrorizzata da un serial killer sadico. Batman deve indagare nei recessi più oscuri della città per fermarlo.",
        ageRating: "VM14",
        thumbnail: "../../img/the-batman-3.jpg",
        videoFileName: "batman_trailer.mp4"
    },
    {
        title: "Top Gun: Maverick",
        description: "Dopo oltre trent'anni di servizio, Pete Mitchell è tra i migliori aviatori della Marina, chiamato ad addestrare una squadra speciale.",
        ageRating: "13+",
        thumbnail: "../../img/topgunmaverick.jpg",
        videoFileName: "topgun_maverick_trailer.mp4"
    },
    {
        title: "Weapons",
        description: "Un thriller misterioso e teso che esplora eventi oscuri e legami inaspettati tra i protagonisti.",
        ageRating: "VM14",
        thumbnail: "../../img/weapons.jpg",
        videoFileName: "weapons_trailer.mp4"
    },
    {
        title: "Spider-Man: Brand New Day",
        description: "Un nuovo capitolo per Peter Parker, che cerca di bilanciare la sua vita quotidiana a New York con le pesanti responsabilità di essere il supereroe della città tra nuove minacce e alleanze inaspettate.",
        ageRating: "PG-13",
        thumbnail: "../../img/spiderman.jpg",
        videoFileName: "spiderman_brand_new_day_trailer.mp4"
    },
    {
        title: "Iron Man 3",
        description: "Tony Stark deve affrontare un nemico formidabile senza limiti, l'Estremo Terminatore, e fare i conti con i suoi demoni interiori.",
        ageRating: "PG-13",
        thumbnail: "../../img/ironman3.jpg",
        videoFileName: "ironman3_trailer.mp4"
    },
    {
        title: "Clayface",
        description: "La discesa nell'incubo di un attore di Hollywood sfigurato da un trattamento medico sperimentale che altera la sua percezione della realtà.",
        ageRating: "VM14",
        thumbnail: "../../img/Clayface_(film).jpg",
        videoFileName: "clayface_trailer.mp4"
    }
];

const movieListContainer = document.getElementById('movie-list');

function renderCatalog() {
    movieListContainer.innerHTML = '';

    movies.forEach((movie, index) => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        card.innerHTML = `
            <img src="${movie.thumbnail}" alt="${movie.title}" class="movie-thumbnail">
            <div class="movie-info">
                <div class="movie-header-row">
                    <h2 class="movie-title">${movie.title}</h2>
                    <span class="movie-age">${movie.ageRating}</span>
                </div>
                <p class="movie-description">${movie.description}</p>
            </div>
        `;

        card.addEventListener('click', () => {

            sessionStorage.setItem('selectedVideo', movie.videoFileName);

            window.location.href = '../player/index.html';
        });

        movieListContainer.appendChild(card);
    });
}

function selectMovie(fileName) {

    sessionStorage.setItem('selectedVideo', fileName);

    window.location.href = 'index.html';
}

renderCatalog();

