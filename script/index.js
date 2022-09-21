const apiKey = '40cadbe536b849e5ab24e0d83a8fd627';
const newsList = document.querySelector('.news-list');
const newsListTop = document.querySelector('.top');
const serchNewsForm = document.querySelector('.form-search');
const title = document.querySelector('.title');

const fetchRequest = async (url, {
    method = 'get',
    callback,
    body,
    headers,
}) => {
    try {
        const options = {
            method,
            headers: {
                'X-Api-Key': apiKey,
            },
        }

        if (body) options.body = JSON.stringify(body);

        const response = await fetch(url, options);

        if (response.ok) {
            const resp = await response.json();
            const data = resp.articles;
            if (callback) return callback(null, data);
            return;
        }
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);

    } catch (err) {
        return callback(err);
    }
};

/*const getImage = (url) => new Promise((resolve) => {
    const image = new Image(270, 200);
    image.addEventListener('load', () => {
        resolve(image);
    });

    image.addEventListener('error', () => {
        image.src = 'undefind.jpg';
        resolve(image);
    });

    image.src = url || 'undefind.jpg';
    image.className = 'news-image';
    return image;
});*/


const renderNews = (err, data) => {
    if (err) {
        console.warn(err);
        return;
    }
   
    newsList.textContent = '';
    newsListTop.textContent = '';

    const fragment = document.createDocumentFragment();
    
    data.forEach(async el => {
        const card = document.createElement('li');
        card.className = 'news-item';

      /* const image = await getImage(el.urlToImage);
        card.append(image);*/

        card.innerHTML =  `
        <img src="${el.urlToImage}"
        alt="${el.title}" class="news-image" height="200">
        <h3 class="news-title">
        <a href="${el.url}" class="news-link" target="_blank">${el.title || ''}</a>
        </h3>
        <p class="news-description">${el.description || ''}</p>
        <div class="news-footer">
        <time class="news-datetime" datetime="${el.publishedAt}">
            <span class="news-date">${el.publishedAt}</span> 11:06
        </time>
        <p class="news-author">${el.author || ''}</p>
        </div>
        `;
        fragment.append(card);
    });
    return fragment;
};

const init = () => {
    newsList.innerHTML = '<li class="preload"></li>';
    title.classList.add('hide');
    return Promise.all([
       fetchRequest('https://newsapi.org/v2/top-headlines?country=ru&pageSize=8', {
          callback: renderNews,
       }),
       fetchRequest('https://newsapi.org/v2/top-headlines?country=de&pageSize=4', {
        callback: renderNews,
        }),
    ]);
};

init().then(cards => {
    newsList.append(cards[0]);
    newsListTop.append(cards[1]);
});

const getNoun = (number, one, two, five) => {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
        return five;
    }
    n %= 10;
    if (n === 1) {
        return one;
    }
    if (n >= 2 && n <= 4) {
        return two;
    }
    return five;
};

const loadSearchNews = (value) => {
    newsList.innerHTML = '<li class="preload"></li>';
    return Promise.all([
        fetchRequest(`https://newsapi.org/v2/everything?q=${value}`, {
            callback: renderNews,
        }),
       fetchRequest('https://newsapi.org/v2/top-headlines?country=ru&pageSize=4', {
         callback: renderNews,
        })
    ]);
};


serchNewsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchValue = serchNewsForm.search.value;
    title.classList.remove('hide');
    title.insertAdjacentText('afterbegin', `По Вашему запросу "${searchValue}" найдено `);
    loadSearchNews(searchValue).then(cards => {
        newsList.append(cards[0]);
        const li = newsList.querySelectorAll('li');
        title.insertAdjacentText('beforeend', `${li.length} ` +
                        getNoun(`${li.length}`, 'результат', 'результата', 'результатов'));
        newsListTop.append(cards[1]);
    });
    serchNewsForm.reset();
});


