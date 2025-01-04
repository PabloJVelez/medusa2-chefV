const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

async function scrapeReviews(chefUrl) {
  try {
    console.log(`Fetching URL: ${chefUrl}`);
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    const response = await axios.get(chefUrl, { headers });
    console.log(`Successfully got response with length: ${response.data.length}`);

    const $ = cheerio.load(response.data);
    const reviewCards = $('.users-reviews__card');
    console.log(`Found ${reviewCards.length} review cards`);

    const reviews = [];
    reviewCards.each((_, card) => {
      try {
        const name = $(card).find('.users-reviews__user-name').text().trim();
        const dateText = $(card).find('.users-reviews__date').text().trim();
        const date = dateText.substring(0, 8); // Take only the first 8 characters (MM/DD/YY)
        const content = $(card).find('.users-reviews__comment').text().trim();
        
        // Extract rating based on the aspect ratio of the stars div
        const ratingDiv = $(card).find('.chef-stars-rating');
        const aspectRatio = ratingDiv.attr('style')?.match(/aspect-ratio:(\d+)/)?.[1];
        const rating = aspectRatio === '134' ? 5 : aspectRatio === '106' ? 4 : 5; // Default to 5 if we can't determine

        reviews.push({
          reviewer_name: name,
          date,
          rating,
          content
        });
      } catch (error) {
        console.error(`Error processing review card: ${error.message}`);
      }
    });

    if (reviews.length > 0) {
      console.log(`Successfully scraped ${reviews.length} reviews`);
      return reviews;
    } else {
      console.log('No reviews found');
      return null;
    }
  } catch (error) {
    console.error(`An error occurred while scraping: ${error.message}`);
    return null;
  }
}

// Chef Luis's profile URL
const chefUrl = 'https://www.cozymeal.com/chefs/1159/chef-luis';

async function main() {
  const reviews = await scrapeReviews(chefUrl);

  if (reviews) {
    console.log(`Scraped ${reviews.length} reviews successfully!`);
    
    await fs.writeFile(
      'chef_luis_reviews.json',
      JSON.stringify(reviews, null, 2),
      'utf-8'
    );
    console.log('Reviews saved to chef_luis_reviews.json');
  } else {
    console.log('Failed to scrape reviews.');
  }
}

main().catch(console.error); 