import { Database, SQLite3Connector, PostgresConnector } from "../deps.ts";
import { refreshYoutube, YoutubeChannel, YoutubeChannelStats } from "./youtube.ts";
import { refreshPodcast, PodcastChannel } from "./podcast.ts";
import log from "../services/logger.service.ts";
import { Credentials } from "../config.ts";
import { refreshTwitch, TwitchChannel, TwitchChannelFollows, TwitchChannelStats, TwitchClip, TwitchGame, TwitchStream, TwitchStreamViews } from "./twitch.ts";
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
const connector = Credentials.postgresql ? new PostgresConnector(Credentials.postgresql) : new SQLite3Connector({ filepath: './data/acodega.sqlite', });

const db = new Database({ connector, debug: false });


db.link([YoutubeChannel, YoutubeChannelStats, PodcastChannel, TwitchChannel, TwitchChannelStats, TwitchChannelFollows, TwitchStream, TwitchStreamViews, TwitchClip, TwitchGame]);

// Coa opción de drop, está borrando as táboas antes de cargar os datos. Ollo con usar isto en produción.
/* await db.sync({ drop: true }); */

/** Refresca os datos de todas as plataformas. */
export async function refreshData() {
   logger.debug(`Refreshing all data from Podcasts, Youtube and Twitch`);
   return await Promise.all([
      refreshPodcast(),
      refreshYoutube(),
      refreshTwitch()
   ]);
}