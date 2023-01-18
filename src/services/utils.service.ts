import log from "./logger.service.ts";
import { rssParser } from "../deps.ts";

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

/**
 * Chunks an array into smaller arrays of a specified size
 * @param {Array} arr - The array to be chunked
 * @param {number} size - The size of each chunk
 * @returns {Array} - An array of smaller arrays (chunks)
 */
export function splitInChunks(arr: any[], size: number) {
   return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
}