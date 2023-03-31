import { DataTypes, Model } from "../deps.ts";
import { logger, BaseChannelData } from "./mod.ts";
import { publish } from "../services/publish.service.ts";
import { fetchJsonData, getFeedData } from "../services/utils.service.ts";

export class PodcastChannel extends Model {
   static table = 'podcast_channels';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      rss: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
      channel_name: DataTypes.STRING,
      channel_date: DataTypes.DATETIME,
      type: DataTypes.STRING,
      twitter: { type: DataTypes.STRING, allowNull: true },
      mastodon: { type: DataTypes.STRING, allowNull: true },
      last_podcast_date: { type: DataTypes.DATETIME, allowNull: true },
      last_podcast_title: { type: DataTypes.STRING, allowNull: true },
      last_podcast_link: { type: DataTypes.STRING, allowNull: true },
   };

   static defaults = {
      type: "podgalego",
   };
}

export interface PodcastChannelData extends BaseChannelData {
   type: 'podgalego';
   rss: string;
}


/** Refresca os datos de youtube e comproba o último vídeo da canle. */
export async function refreshPodcast() {
   try {
      const updateChannels: PodcastChannelData[] = await fetchJsonData('https://obradoirodixitalgalego.gal/api/podcast.json');
      // Recorre cada canle e obtén o seu último vídeo
      logger.info(`START: Refreshing ${updateChannels.length} podcast channels`);
      for (const channel of updateChannels) {
         // Obtemos a información do RSS
         const feedData = await getFeedData(channel.rss);
         if (feedData && feedData.items && feedData.items.length) {
            channel.type = "podgalego";
            channel.lastFeedEntry = {
               title: feedData.items[0].title,
               published: feedData.items[0].isoDate,
               link: feedData.items[0].link,
            }
         }
         // Buscamos se existe xa na BBDD e en caso contrario creámolo.
         let currentChannel = await PodcastChannel.find(channel.rss)
         if (!currentChannel) {
            currentChannel = new PodcastChannel();
            currentChannel.rss = channel.rss;
            currentChannel.channel_name = channel.title;
            currentChannel.channel_date = feedData?.published || new Date();
            currentChannel.twitter = channel.twitter as string;
            currentChannel.mastodon = channel.mastodon as string;
            await currentChannel.save();
         }
         // Se ten último podcast e é distinto do último que recuperou RABOT, publica nas canles que toque.
         if (channel.lastFeedEntry && currentChannel.last_podcast_date && new Date(currentChannel.last_podcast_date as Date) < new Date(channel.lastFeedEntry.published as string)) {
            publish(channel);
         }
         currentChannel.channel_name = channel.title;
         currentChannel.channel_date = feedData?.published || new Date();
         currentChannel.twitter = channel.twitter as string;
         currentChannel.mastodon = channel.mastodon as string;
         currentChannel.last_podcast_date = channel.lastFeedEntry?.published as string;
         currentChannel.last_podcast_title = channel.lastFeedEntry?.title as string;
         currentChannel.last_podcast_link = channel.lastFeedEntry?.link as string;
         await currentChannel.update();
         logger.debug(currentChannel);
      }
      logger.info(`Refreshed ${updateChannels.length} podcast channels with their last podcast`);
   } catch (error) { 
      logger.error("Algún erro aconteceu.");
      logger.error(error); 
   }
   return true;
}