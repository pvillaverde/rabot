import log from "./logger.service.ts";

import rssParser from "npm:rss-parser";
const feedParser = new rssParser({
   customFields: {
      feed: ['published'],
   },
});

const logger = log.getLogger();

/** Obtén o último elemento dun feed de RSS e quédase cos datos máis relevantes. */
export async function getFeedData(rssURL: string) {
   try {
      const feed = await feedParser.parseURL(rssURL);
      return feed;
   } catch (error) {
      logger.warning(`No valid RSS feed for ${rssURL}`)
      logger.warning(error);
      return undefined;
   }
}
/** Fai unha consulta a por un JSON e o devolve parseado. */
export async function fetchJsonData(url: string) {
   const response = await fetch(url);
   return await response.json();
}