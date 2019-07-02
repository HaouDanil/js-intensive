const searchForm = document.querySelector('#search-form'),
      movie = document.querySelector('#movies'),
      urlposter = 'http://image.tmdb.org/t/p/w500';

function apiSearch(event){
    event.preventDefault();
    const searchText = document.querySelector('.form-control').value;
    if (searchText.trim().length === 0) {
        movie.innerHTML = '<h2 class="col-12 text-center text-danger moviealert dangeralert">Поле поиска не должно быть пустым</h2>';
        return;
    }

    const server = 'https://api.themoviedb.org/3/search/multi?api_key=b9f98b6393e5af877873aa7720d1822a&language=ru&query=' + searchText;
    movie.innerHTML = '<div class="spinner"></div>';

    fetch(server)
    .then(function(value){
        if (value.status !== 200) {
            return Promise.reject(new Error(value.status));
        }
        return value.json();
    })
    .then(function(output){
        let inner = '';
        if (output.results.length === 0) {
            inner = '<h2 class="col-12 text-center text-danger moviealert lightalert">Не найдено</h2>';
        }
        output.results.forEach(function(item){
            let nameItem = item.name || item.title,
                ratingItem = item.vote_average,
                dateItem = item.first_air_date || item.release_date || 'НЕИЗВЕСТНА',
                poster = item.poster_path ? urlposter + item.poster_path : '../img/noposter.png',
                dataInfo = '',
                infotype = '';
            
            if (item.media_type === 'movie') {
                infotype = 'ФИЛЬМ';
            } else if (item.media_type === 'tv') {
                infotype = 'СЕРИАЛ';
            } else {
                infotype = 'СЪЕМОЧНАЯ КОМАНДА';
            }

            if (item.media_type !== 'person') {
                dataInfo = `data-id="${item.id}" data-type="${item.media_type}"`;
            }

            inner += `
                <div class="col-12 col-md-4 col-xl-3 text-center cards item">
                    <div class="card mb-3">
                        <img src="${poster}" class="card-img" alt="${nameItem}" ${dataInfo} title="${nameItem}">
                        <b>${nameItem}</b>
                        <p class="card-text text-primary">Тип: ${infotype}</p>
                        <div class="card-main">
                            <p class="card-text text-primary">Дата релиза:<br/>${dateItem}</p>
                            <p class="card-text"><span class="badge badge-primary">Оценка: ${ratingItem}</span></p>
                            <a href="https://www.themoviedb.org/${item.media_type}/${item.id}" class="btn btn-primary">Смотреть</a>
                        </div>
                    </div>
                </div>`;
        });

        movie.innerHTML = inner;
        addEventMedia();
    })
    .catch(function(reason){
        movie.innerHTML = 'Упс, что-то пошло не так!';
        console.log('ERROR: ' + reason.status);
    });
}

searchForm.addEventListener('submit', apiSearch);

function addEventMedia(){
    const media = movie.querySelectorAll('img[data-id]');
    media.forEach(function (elem) {
        elem.style.cursor = 'pointer';
        elem.addEventListener('click', showFullInfo);
    });
}

function showFullInfo(){
    let url = '';
    if (this.dataset.type === 'movie') {
        url = `https://api.themoviedb.org/3/movie/${this.dataset.id}?api_key=b9f98b6393e5af877873aa7720d1822a&language=ru`;
    } else if (this.dataset.type === 'tv') {
        url = `https://api.themoviedb.org/3/tv/${this.dataset.id}?api_key=b9f98b6393e5af877873aa7720d1822a&language=ru`;
    } else {
        url = `https://api.themoviedb.org/3/person/${this.dataset.id}?api_key=b9f98b6393e5af877873aa7720d1822a&language=ru`;
    }

    fetch(url)
    .then(function(value){
        if(value.status !== 200){
            return Promise.reject(new Error(value.status));
        }

        return value.json();
    })
    .then(function(output){
        let mediaType = output.title ? 'movie' : 'tv';
        let genres = '';
        output.genres.forEach((genre) => { genres += genre.name + ', ';});
        genres = genres.substr(0, genres.length - 2);
        movie.innerHTML = `
        
        <div class='col-4'>
            <img src='${urlposter + output.poster_path}' alt='${output.name || output.title}' class='infoposter'>
            ${(output.homepage) ? `<p class='text-center'> <a class="infobutton" href='${output.homepage}' target='_blank'>Официальная страница</a> </p>` : ''}
            ${(output.imdb_id) ? `<p class='text-center'> <a class="infobutton" href='https://imdb.com/title/${output.imdb_id}' target='_blank'>Страница на IMDB</a> </p>` : ''}
        </div>
        <div class='col-8 infofull'>
            <h4 class='col-12 text-center text-info infocaption'>${output.name || output.title}</h4>
            <p class="text-center infotext">Оценка: ${output.vote_average}</p>
            <p class="text-center infotext"> Статус: ${output.status}</p>
            <p class="text-center infotext"> Премьера: ${output.first_air_date || output.release_date}</p>
            <p class="text-center infotext">Жанры: ${genres}</p>
            ${(output.last_episode_to_air) ? `<p>Сезон: ${output.number_of_seasons} <br> Серий: ${output.last_episode_to_air.episode_number} </p>` : ''}
            <p class="text-center infotext">Описание: ${output.overview}</p>
            <div class="youtube"></div>
            </div>`;

            getVideo(mediaType, output.id);
            
    })
    .catch(function(reason){
        movie.innerHTML = 'Упс, что-то пошло не так!';
        console.log('ERROR: ' + reason.status);
    });
}

document.addEventListener('DOMContentLoaded', function(){
    fetch('https://api.themoviedb.org/3/trending/all/day?api_key=b9f98b6393e5af877873aa7720d1822a&language=ru')
    .then(function(value){
        if(value.status !== 200){
            return Promise.reject(new Error(value.status));
        }

        return value.json();
    })
    .then(function(output){
        let inner = '<h2 class="col-12 text-center text-info moviealert">Популярное за неделю</h2>';

        if (output.results.length === 0) {
            inner = '<h2 class="col-12 text-center text-danger moviealert lightalert">Не найдено</h2>';
        }

        output.results.forEach(function(item){
            let nameItem = item.name || item.title;
            let mediaType = item.title ? 'movie' : 'tv';
            let ratingItem = item.vote_average;
            let dateItem = item.first_air_date || item.release_date || 'НЕИЗВЕСТНА';
            let poster = item.poster_path ? urlposter + item.poster_path : '../img/noposter.png';
            let dataInfo = `data-id="${item.id}" data-type="${mediaType}"`;
            let infotype = '';

            if (mediaType === 'movie') {
                infotype = 'ФИЛЬМ';
            }
            if (mediaType === 'tv') {
                infotype = 'CЕРИАЛ';
            }
            if (mediaType === 'person') {
                infotype = 'СЪЕМОЧНАЯ КОМАНДА';
            }

            inner += `
            <div class="col-12 col-md-4 col-xl-3 text-center cards item">
                <div class="card mb-3">
                    <img src="${poster}" class="card-img" alt="${nameItem}" ${dataInfo} title="${nameItem}">
                    <b>${nameItem}</b>
                    <p class="card-text text-primary">Тип: ${infotype}</p>
                    <div class="card-main">
                        <p class="card-text text-primary">Дата релиза:<br/>${dateItem}</p>
                        <p class="card-text"><span class="badge badge-primary">Оценка: ${ratingItem}</span></p>
                        <a href="https://www.themoviedb.org/${mediaType}/${item.id}" class="btn btn-primary">Смотреть</a>
                    </div>
                </div>
            </div>`;
        });
        movie.innerHTML = inner;
        addEventMedia();
    })
    .catch(function(reason){
        movie.innerHTML = 'Упс, что-то пошло не так!';
        console.log('ERROR: ' + reason.status);
    });
});

function getVideo(type, id){
    let youtube = movie.querySelector('.youtube');

    fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=b9f98b6393e5af877873aa7720d1822a&language=ru`)
    .then(function(value){
        if (value.status !== 200){
            return Promise.reject(new Error(value.status));
        }
        return value.json();
    })
    .then(function(output){
        let videoFrame = '<h4 class="col-12 text-center text-info">Трейлер</h4>';

        if(output.results.length === 0){
            videoFrame = '<p>Видео отсутствует</p>';
        }

        output.results.forEach((item)=>{
            videoFrame +=  '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+ item.key + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        });

        youtube.innerHTML = videoFrame;
    })
    .catch(function(reason){
        youtube.innerHTML = "Видео отсутствует!";
        console.error(reason || reason.status);
    });
}