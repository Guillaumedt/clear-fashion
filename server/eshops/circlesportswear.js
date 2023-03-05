const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
    const $ = cheerio.load(data);
  
    return $('.product-grid-container .grid__item')
      .map((i, element) => {
        const name = $(element)
          .find('.card__inner') // try with card_heading or car_heading h5 instead of card__inner
          .find('.full-unstyled-link')
          .text()
          .trim()
          .replace(/\s/g, ' ');
        var price = $(element)
            .find('.money')
            .text();
        console.log(price);
        // we get rid of the first character of the price
        price = stripFirstChar(price);
        console.log(price);
        // we convert price to an int
        price = parseInt(price);
        
        // get the link of the product
        var link = $(element)
          .find('.full-unstyled-link')
          .attr('href');
        link = "https://shop.circlesportswear.com" + link;

        // get the 1rst image of the product
        const image = $(element)
          .find('.card__media img')  // try with .attr('srcset')
          .attr('src');
  
        // get the date of the scrapping
        const date = new Date();

        const brand = "Circle Sportswear";
        return {name, link, price, image, date, brand};
      })
      .get();
  };

  // we write a function to get rid of the fisrt character of a string
  function stripFirstChar(str) {
    return str.slice(1);
  }

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async url => {
    try {
        const response = await fetch(url);
    
        if (response.ok) {
            const body = await response.text();
    
            return parse(body);
        }
    
        console.error(response);
    
        return null;
    } catch (error) {
        console.error(error);
    }
};