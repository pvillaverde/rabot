import log from "./logger.service.ts";
import { parseFeed } from "https://deno.land/x/rss@0.5.6/mod.ts";
import { publish } from "./publish.service.ts";
import moment from "https://deno.land/x/momentjs@2.29.1-deno/mod.ts";

const logger = log.getLogger('acodegaService');
interface BaseChannel {
   title: string;
   twitter?: string;
   mastodon?: string;
}
interface ShortFeedEntry {
   title?: string,
   published?: Date;
   link?: string;
}
export interface PodcastChannel extends BaseChannel {
   type: 'podgalego';
   rss: string;
   lastFeedEntry: ShortFeedEntry
}
export interface YoutubeChannel extends BaseChannel {
   type: 'galegotube';
   youtube: string;
   lastFeedEntry: ShortFeedEntry
}
export interface TwitchChannel extends BaseChannel {
   type: 'galegotwitch';
   twitch: string;
   lastFeedEntry: ShortFeedEntry
}

export let podcastChannels: PodcastChannel[];
export let youtubeChannels: YoutubeChannel[];
export let twitchChannels: TwitchChannel[];


/** Obtén o último elemento dun feed de RSS e quédase cos datos máis relevantes. */
async function getLastFeedEntry(rssURL: string) {
   try {
      const response = await fetch(rssURL);
      const xml = await response.text();
      const feed = await parseFeed(xml);
      if (feed.entries && feed.entries[0]) {
         return {
            title: feed.entries[0].title?.value as string,
            published: feed.entries[0].published,
            link: feed.entries[0].links[0].href,
         };
      } else {
         logger.debug(`No feed entries for RSS ${rssURL}`)
         return false;
      }
   } catch (error) {
      logger.warning(`No feed entries for RSS ${rssURL}`, error)
      return false;
   }
}
/** Fai unha consulta a por un JSON e o devolve parseado. */
async function fetchJsonData(url: string) {
   const response = await fetch(url);
   return await response.json();
}

/** Refresca os datos de todas as plataformas. */
export async function refreshData() {
   logger.debug(`Refreshing all data from Podcasts, Youtube and Twitch`);
   return await Promise.all([
      refreshPodcasts(),
      refreshYoutube(),
      refreshTwitch()
   ]);
}

/** Refresca os datos de youtube e comproba o último vídeo da canle. */
async function refreshYoutube() {
   try {
      const now = moment();
      //TODO: Se cada vez que refrescamos sustitúe o array, nunca vai detectar vídeos novos!! O mesmo para o RSS
      youtubeChannels = await fetchJsonData('https://obradoirodixitalgalego.gal/api/youtube.json');
      // Recorre cada canle e obtén o seu último vídeo
      logger.debug(`START: Refreshing ${youtubeChannels.length} youtube channels`);
      for (const channel of youtubeChannels) {
         const lastFeedEntry = await getLastFeedEntry(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.youtube}`);
         if (lastFeedEntry) {
            channel.type = "galegotube";
            channel.lastFeedEntry = lastFeedEntry;
            // Se ten último vídeo e é distinto do último que recuperou RABOT, publica nas canles que toque.
            if (lastFeedEntry && (now.diff(moment(lastFeedEntry.published), 'minutes') <= 15)) {
               publish(channel);
            }
         }
      }
      logger.debug(`END: Refreshed ${youtubeChannels.length} youtube channels with their last video`);
   } catch (error) { logger.error(error); }
   return youtubeChannels;
}

async function refreshPodcasts() {
   try {
      const now = moment();
      podcastChannels = await fetchJsonData('https://obradoirodixitalgalego.gal/api/podcast.json');
      // Recorre cada canle e obtén o seu último podcast
      logger.debug(`START: Refreshing ${podcastChannels.length} podcast channels`);
      for (const channel of podcastChannels) {
         const lastFeedEntry = await getLastFeedEntry(channel.rss);
         if (lastFeedEntry) {
            channel.type = "podgalego";
            channel.lastFeedEntry = lastFeedEntry;
            // Se ten último podcast e é distinto do último que recuperou RABOT, publica nas canles que toque.
            if (lastFeedEntry && (now.diff(moment(lastFeedEntry.published), 'minutes') <= 15)) {
               publish(channel);
            }
         }
      }
      logger.debug(`END: Refreshed ${podcastChannels.length} podcasts channels with their last podcast`);
   } catch (error) { logger.error(error); }
   return podcastChannels;
}

async function refreshTwitch() {
   try {
      twitchChannels = await fetchJsonData('https://obradoirodixitalgalego.gal/api/twitch.json');
   } catch (error) { logger.error(error); }
   return twitchChannels;
}