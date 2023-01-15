import log from "../services/logger.service.ts";
import rssParser from "npm:rss-parser";
import { Database, SQLite3Connector } from "https://deno.land/x/denodb@v1.2.0/mod.ts";
import { refreshYoutube, YoutubeChannel } from "./youtube.ts";
import { refreshPodcast, PodcastChannel } from "./podcast.ts";
const feedParser = new rssParser({
   customFields: {
      feed: ['published'],
   },
});
export const logger = log.getLogger('acodegaService');

export interface BaseChannelData {
   title: string;
   twitter?: string;
   mastodon?: string;
   lastFeedEntry: {
      title?: string,
      published?: string;
      link?: string;
   }
}
const connector = new SQLite3Connector({
   filepath: './data/acodega.sqlite',
});

const db = new Database(connector);


db.link([YoutubeChannel, PodcastChannel]);

// Coa opción de drop, está borrando as táboas antes de cargar os datos. Ollo con usar isto en produción.
await db.sync({ drop: false });


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

/** Refresca os datos de todas as plataformas. */
export async function refreshData() {
   logger.debug(`Refreshing all data from Podcasts, Youtube and Twitch`);
   return await Promise.all([
      refreshPodcast(),
      refreshYoutube(),
      /* refreshTwitch() */
   ]);
}