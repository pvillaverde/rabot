import { Database, SQLite3Connector, PostgresConnector, MySQLConnector } from "../deps.ts";
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
      published?: Date;
      link?: string;
   }
}
let connector;
if (Credentials.mysql) {
   connector = new MySQLConnector(Credentials.mysql);
} else if (Credentials.postgresql) {
   connector = new PostgresConnector(Credentials.postgresql);
} else {
   connector = new SQLite3Connector({ filepath: './data/acodega.sqlite', });
}

const db = new Database({ connector, debug: false });

function reconnectDatabase() {
   logger.warning('Closing and reconnecting database')
   db.close();
   db.link([YoutubeChannel, YoutubeChannelStats, PodcastChannel, TwitchChannel, TwitchChannelStats, TwitchChannelFollows, TwitchStream, TwitchStreamViews, TwitchClip, TwitchGame]);
}

db.link([YoutubeChannel, YoutubeChannelStats, PodcastChannel, TwitchChannel, TwitchChannelStats, TwitchChannelFollows, TwitchStream, TwitchStreamViews, TwitchClip, TwitchGame]);

// Coa opción de drop, está borrando as táboas antes de cargar os datos. Ollo con usar isto en produción.
/* await db.sync({ drop: true }); */

/** Refresca os datos de todas as plataformas. */
export async function refreshData() {
   logger.debug(`Refreshing all data from Podcasts, Youtube and Twitch`);
   return await Promise.race([
      Promise.all([
         refreshPodcast(),
         refreshYoutube(),
         refreshTwitch()
      ]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000 * 60 * 60))
   ]).catch(error => {
      logger.critical("Algún erro aconteceu ao refescar os logs e pasou o tempo de espera.");
      logger.critical(error);
      reconnectDatabase();
   });
}

