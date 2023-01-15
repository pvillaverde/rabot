import log from "../services/logger.service.ts";
import { Database, SQLite3Connector } from "https://deno.land/x/denodb@v1.2.0/mod.ts";
import { refreshYoutube, YoutubeChannel, YoutubeChannelStats } from "./youtube.ts";
import { refreshPodcast, PodcastChannel } from "./podcast.ts";
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


db.link([YoutubeChannel, YoutubeChannelStats, PodcastChannel]);

// Coa opción de drop, está borrando as táboas antes de cargar os datos. Ollo con usar isto en produción.
await db.sync({ drop: false });

/** Refresca os datos de todas as plataformas. */
export async function refreshData() {
   logger.debug(`Refreshing all data from Podcasts, Youtube and Twitch`);
   return await Promise.all([
      refreshPodcast(),
      refreshYoutube(),
      /* refreshTwitch() */
   ]);
}