export const scrapeContent = (scraper) => async (url) => {
    return await scraper.scrape(url);
};
