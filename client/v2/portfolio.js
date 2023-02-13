// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/

Search for specific products

This endpoint accepts the following optional query string parameters:

- `page` - page of products to return
- `size` - number of products to return

GET https://clear-fashion-api.vercel.app/brands

Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};
let currentBrands = [];

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

//list of favorites  

function togglebutton(button) { 
  if ( button.value === 'add to favorites' ) {
      button.value = 'favorite';

  } else {
      button.value = 'add to favorites';
  }
}

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}" target="_blank">${product.name}</a>
        <span>${product.price}</span>
        <span>${product.released}</span>
        <input type="button" value="add to favorites" id="myButton${product.uuid}" onclick = "return togglebutton(this)" ></input>
      </div>
      `; // FEATURE 12 : target="_blank" to open in a new tab instead of replacing the current page
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;
  
  spanNbProducts.innerHTML = count;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value));
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});


// FEATURE 1
/**
 * Select the number of the page to display
 */
selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), currentPagination.pageSize);

  
  //fav_dictionnary(products.result);
  //console.log(favorites);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});


// FEATURE 2
/**
 * Filter products by brand name
 */

// instantiate the selectors
const selectBrand = document.querySelector('#brand-select');

/**
 * Set global value
 * @param {Array} result - products to display
 */
const setCurrentBrands = (result) => {
  currentBrands = result;
};

/**
 * Fetch brands from api
 *  */
const fetchBrands = async () => {
  try {
    const response = await fetch('https://clear-fashion-api.vercel.app/brands');
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return [];
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}


function renderBrands(brands) {
  const options = Array.from(
    brands,
    value => `<option value="${value}">${value}</option>`).join('');

  selectBrand.innerHTML = options;
  spanNbBrands.innerHTML = brands.length -1; // number of brands displayed in the html
};



// toggles
selectBrand.addEventListener('change', async (event) => {
  //if(event.target.value !== "unselected"){
  const products = await fetchProducts(1,500); // parseInt(currentPagination.currentPage), currentPagination.pageSize // 222 products
  products.result = products.result.filter(product => product.brand==event.target.value);
  //}
  //else{
  //  const products = await fetchProducts(parseInt(currentPagination.currentPage), currentPagination.pageSize)
  //}
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});



/**
 * Filter products according to the sorting selected
 */

// instantiate the selectors
const selectRencent = document.querySelector('#recent-select');
const selectReasonable = document.querySelector('#reasonable-select');
const selectSort = document.querySelector('#sort-select');
const selectFavorites = document.querySelector('#favorites-select');

// instantiate the indicators
const spanNbProducts = document.querySelector('#nbProducts'); // FEATURE 8
const spanNbBrands = document.querySelector('#nbBrands');
const spanNbNewProducts = document.querySelector('#nbNewProducts'); // FEATURE 9
const spanp50 = document.querySelector('#p50pricevalue');
const spanp90 = document.querySelector('#p90pricevalue');
const spanp95 = document.querySelector('#p95pricevalue'); // FEATURE 10
const spanlastrelease = document.querySelector('#lastreleasevalue'); // FEATURE 11

// FEATURE 3

// Recent products (less than 1 month)
selectRencent.addEventListener('change', async (event) => {
  const products = await fetchProducts(1,500); // parseInt(currentPagination.currentPage), currentPagination.pageSize // 222 products
  if(event.target.value == "Yes"){
    products.result = products.result.filter(product => ((new Date()- new Date (product.released)) / (1000 * 3600 * 24 )) <30);
  }
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

// FEATURE 4

// Reasonable price (less than 50€)
selectReasonable.addEventListener('change', async (event) => {
  const products = await fetchProducts(1,500); // parseInt(currentPagination.currentPage), currentPagination.pageSize // 222 products
  if(event.target.value == "Yes"){
    products.result = products.result.filter(product => product.price < 50);
  }
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});



// FEATURES 5-6

/**
 * Function to sort the products according to the sorting selected
 * takes the sorting method as a parameter
 * @param  {Object} products
 * @param  {Object} filterMethod
 *  */
function SortProducts(products, filterMethod) {
  if(filterMethod == "price-asc"){ // sort by price asc
    products.result = products.result.sort((a, b) => a.price - b.price);
  }
  else if(filterMethod == "price-desc"){ // sort by price desc
    products.result = products.result.sort((a, b) => b.price - a.price);
  }
  else if(filterMethod == "date-asc"){ // sort by date asc
    products.result = products.result.sort((a, b) => new Date(b.released) - new Date(a.released));
  }
  else if(filterMethod == "date-desc"){ // sort by date desc
    products.result = products.result.sort((a, b) => new Date(a.released) - new Date(b.released));
  }
}

selectSort.addEventListener('change', async (event) => {
  const products = await fetchProducts(1,500); // parseInt(currentPagination.currentPage), currentPagination.pageSize // 222 products
  SortProducts(products, event.target.value);
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});


// let's create a dictionary that associates to each product a boolean to know if the product is favorite or not // does not work yet
let favorites = {};
function fav_dictionnary(products){
  for(product in products){
    if(document.getElementById("myButton" + product.uuid).value == "favorite"){
      favorites[product] = true;
    }
    else{
      favorites[product] = false; 
    }
  }
}

selectFavorites.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);
  // filter function to keep only products with favorite=true
  fav_dictionnary(products.result);
   
  if(event.target.value == "Yes"){
    products.result = products.result.filter(product => document.getElementById("myButton" + product.uuid).value == "favorite"); 
  }
  
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});






// FEATURE 8
// Number of products indicator

function quartile(products_for_pv, q){
  let sorted = products_for_pv.result.sort((a, b) => a.price - b.price); // SortProducts(products_for_pv,"price-asc")
  let pos = ((sorted.length) - 1) * q;
  let base = Math.floor(pos);
  let rest = pos - base;
  if( (sorted[base+1]!==undefined) ) {
    return sorted[base].price + rest * (sorted[base+1].price - sorted[base].price);
  } else {
    return sorted[base].price;
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  const brands = await fetchBrands();

  const new_products = await fetchProducts(1,500); // FEATURE 9
  const new_products_count = new_products.result.filter(product => ((new Date()- new Date (product.released)) / (1000 * 3600 * 24 )) <30).length;
  spanNbNewProducts.innerHTML = new_products_count;

  const products_for_pv = await fetchProducts(1,500); // FEATURE 10
  const p50 = quartile(products_for_pv, 0.25);
  spanp50.innerHTML = p50;
  const p90 = quartile(products_for_pv, 0.9);
  spanp90.innerHTML = p90;
  const p95 = quartile(products_for_pv, 0.95);
  spanp95.innerHTML = parseInt(p95);

  const last_release = await fetchProducts(1,500); // FEATURE 11
  const last_release_date = last_release.result.sort((a, b) => new Date(b.released) - new Date(a.released))[0].released;
  spanlastrelease.innerHTML = last_release_date;

  //console.table(brands.result);
  brands.result.unshift("unselected"); // adds the option "unselected"
  
  setCurrentProducts(products);
  setCurrentBrands(brands);

  renderBrands(brands.result);
  render(currentProducts, currentPagination);
});


