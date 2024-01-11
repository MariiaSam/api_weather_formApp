// KEY 21 DAYS from 31.10.2023
// 18979647cea74422aec120005233110
//http://api.weatherapi.com/v1

const elements = {
  form: document.querySelector('.js-search'),
  formContainer: document.querySelector('.js-form-container'),
  list: document.querySelector('.js-list'),
  addField: document.querySelector('.js-add'),
  removeField: document.querySelector('.js-remove'),
};

elements.addField.addEventListener('click', handlerAddField);
elements.removeField.addEventListener('click', handlerRemoveField);
elements.form.addEventListener('submit', handlerSearch);

async function handlerSearch(evt) {
  evt.preventDefault();

  const formData = new FormData(evt.currentTarget);
  const countries = formData.getAll('country');

  try {
    const capitals = await serviceGetCountries(countries);
    const weather = await serviceGetWeather(capitals);

    elements.list.innerHTML = createMarkup(weather);
  } catch (err) {
    console.log(err);
  } finally {
    elements.formContainer.innerHTML = '<input type="text" name="country" />';
  }
}

async function serviceGetCountries(arr) {
  const promises = arr.map(async country => {
    const resp = await fetch(`https://restcountries.com/v3.1/name/${country}`);
    if (!resp.ok) {
      throw new Error(resp.statusText);
    }

    return resp.json();
  });

  const data = await Promise.allSettled(promises);
  console.log(data);
  return data
    .filter(({ status }) => status === 'fulfilled')
    .map(({ value }) => value[0].capital[0]);
}

function handlerAddField() {
  elements.formContainer.insertAdjacentHTML(
    'beforeend',
    ' <input type="text" name="country" />'
  );
}

function handlerRemoveField() {
  const { children, lastElementChild } = elements.formContainer;

  if (children.length === 1) {
    return;
  }

  lastElementChild.remove();
}
async function serviceGetWeather(arr) {
  const API_KEY = '18979647cea74422aec120005233110';
  const BASE_URL = 'https://api.weatherapi.com/v1';
  const END_POINT = '/current.json';

  const promises = arr.map(async capital => {
    const params = new URLSearchParams({
      key: API_KEY,
      q: capital,
      lang: 'uk',
    });
    const resp = await fetch(`${BASE_URL}${END_POINT}?${params}`);

    if (!resp.ok) {
      throw new Error(resp.statusText);
    }
    return resp.json();
  });

  const data = await Promise.allSettled(promises);
  return data
    .filter(({ status }) => status === 'fulfilled')
    .map(
      ({
        value: {
          location: { country, name },
          current: {
            temp_c,
            condition: { icon, text },
          },
        },
      }) => {
        return { country, name, temp_c, icon, text };
      }
    );
}

function createMarkup(arr) {
  return arr
    .map(
      ({ country, name, temp_c, icon, text }) => `
    <li>
        <img src="${icon}" alt="${text}" />
        <h2>${country}</h2>
        <h2>${name}</h2>
        <p>${text}</p>
        <p class="temp">${temp_c} °C</p>
    </li>
  `
    )
    .join('');
}
