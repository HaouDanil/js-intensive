'use strict';

let searchForm = document.querySelector('#search-form');
let movies = document.querySelector('#movies');
const urlPoster = 'https://image.tmdb.org/t/p/w200/';
const api_key = '058af9bcc056b256f8a414cbc87d4523';

const apiFetch = (request, callback) => {
    fetch(request)
        .then((value) => {
            if (value.status !== 200) {
                return Promise.reject(new Error(value.status));
            }
            return value.json();
        })
        .then((output) => {
            if (typeof callback === 'function') {
                callback(output);
            }
        })
        .catch((reason) => {
            movies.innerHTML = 'Упс, что-то пошло не так!';
            console.log(reason || reason.status);
        });
}

const addEventMedia = () => {
    let media = movies.querySelectorAll('img[data-id]');
    media.forEach((elem) => {
        elem.style.cursor = 'pointer';
        elem.addEventListener('click', showFullInfo);
    });
}

const apiSearch = (event) => {
    event.preventDefault();

    let searchText = document.querySelector('.form-control').value;
    if (searchText.trim().length === 0) {
        movies.innerHTML = '<h2 class="col-12 text-center text-danger">Поле поиска не должно быть пустым</h2>';
        return;
    }
    let server = `https://api.themoviedb.org/3/search/multi?api_key=${api_key}&language=ru&query=` + searchText;
    movies.innerHTML = '<div class="spinner"></div>';

    apiFetch(server, (output) => {

        let inner = '';
        if (output.results.length === 0) {
            inner = '<h2 class="col-12 text-center text-info">По запросу ничего не найдено</h2>';
        } else {
            output.results.forEach((item) => {

                let nameItem = item.name || item.title;
                let dateItem = item.first_air_date || item.release_date || 'нет данных';
                let posterItem = item.poster_path ? `https://image.tmdb.org/t/p/w200/${item.poster_path}` : './img/noposter.jpg';

                let dataInfo = '';
                if (item.media_type !== 'person') dataInfo = `data-id="${item.id}" data-type="${item.media_type}"`;

                inner += `<div class="item col-12 col-sm-6 col-md-4 col-lg-3 text-center">
                    <img src="${posterItem}" class="img_poster" alt="${nameItem}" ${dataInfo}> <br/>
                    <b> ${nameItem} </b> <span class="badge badge-primary"> ${item.vote_average} </span> <br/>
                    Релиз: ${dateItem}
                </div>`;

            });
        }

        movies.innerHTML = inner;
        addEventMedia();

    });
}


function showFullInfo() {
    let url = '';
    if (this.dataset.type === 'movie') {
        url = `https://api.themoviedb.org/3/movie/${this.dataset.id}?api_key=${api_key}&language=ru`;
    } else if (this.dataset.type === 'tv') {
        url = `https://api.themoviedb.org/3/tv/${this.dataset.id}?api_key=${api_key}&language=ru`;
    } else {
        movies.innerHTML = '<h2 class="col-12 text-center text-info">Ошибка. Повторите позже.</h2>';
    }

    apiFetch(url, (output) => {

        let genres = '';
        output.genres.forEach((g) => {
            genres += g.name + ', ';
        });
        genres = genres.slice(0, -2);

        let infoPoster = output.poster_path ? urlPoster + output.poster_path : './img/noposter.jpg';

        movies.innerHTML = `
        <h4 class="col-12 text-center text-info">${output.name || output.title}</h4>
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <img src="${infoPoster}" alt="${output.name || output.title}" >
        </div>
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        
        ${(output.homepage) ? `<p><a href="${output.homepage}" target="_blank">Официальная страница</a></p>` : ''}
        ${(output.imdb_id) ? `<p><a href="https://imdb.com/title/${output.imdb_id}" target="_blank">Ссылка на IMDB</a></p>` : ''}
        
        <p>Рейтинг: ${output.vote_average}</p>
        <p>Жанр: ${genres} </p>
        <p>Статус: ${output.status}</p>
        <p>Премьера: ${output.first_air_date || output.release_date }</p>
        
        ${(output.last_episode_to_air) ? `<p>${output.number_of_seasons} сезон ${output.last_episode_to_air.episode_number} серий вышло</p>` : ''}
        
        <p> Описание: ${output.overview}</p>

        <br>
        
        </div>
        <div class="youtube col-12 col-sm-6 col-md-4 col-lg-3"></div>
        `;

        getVideo(this.dataset.type, this.dataset.id);

    });
}

const getVideo = (type, id) => {
    let youtube = movies.querySelector('.youtube');

    apiFetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${api_key}&language=ru`, (output) => {

        let videoFrame = '<h5 class="text-info">Трейлеры</h5>';

        if (output.results.length === 0) {
            videoFrame = 'Трейлеры отсутствуют';
        }

        output.results.forEach((item) => {
            videoFrame += '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + item.key + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        });

        youtube.innerHTML = videoFrame;
    });

}

const showTopWeek = () => {

    apiFetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${api_key}&language=ru`, (output) => {

        let inner = '<h4 class="col-12 text-center text-info">Популярные за неделю</h4>';
        if (output.results.length === 0) {
            inner = '<h2 class="col-12 text-center text-info">По запросу ничего не найдено</h2>';
        } else {
            output.results.forEach((item) => {
                let nameItem = item.name || item.title;
                let mediaType = item.title ? 'movie' : 'tv';
                let dateItem = item.first_air_date || item.release_date || 'нет данных';
                let posterItem = item.poster_path ? `https://image.tmdb.org/t/p/w200/${item.poster_path}` : './img/noposter.jpg';
                let dataInfo = `data-id="${item.id}" data-type="${mediaType}"`;
                inner += `<div class="item col-12 col-sm-6 col-md-4 col-lg-3 text-center">
                    <img src="${posterItem}" class="img_poster" alt="${nameItem}" ${dataInfo}> <br/>
                    <b> ${nameItem} </b> <span class="badge badge-primary"> ${item.vote_average} </span> <br/>
                    Релиз: ${dateItem}
                </div>`;
            });
        }
        movies.innerHTML = inner;
        addEventMedia();

    });
}

document.addEventListener('DOMContentLoaded', () => {

    searchForm.addEventListener('submit', apiSearch);
    searchForm.addEventListener('change', apiSearch);

    showTopWeek();

});