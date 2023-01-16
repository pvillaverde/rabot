import { DataTypes, Model } from "../deps.ts";
import { logger, BaseChannelData } from "./mod.ts";
import { publish } from "../services/publish.service.ts";
import { fetchJsonData, getFeedData } from "../services/utils.service.ts";

export class PodcastChannel extends Model {
   static table = 'podcast_channels';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
      channelName: DataTypes.STRING,
      channelDate: DataTypes.DATETIME,
      type: DataTypes.STRING,
      twitter: { type: DataTypes.STRING, allowNull: true },
      mastodon: { type: DataTypes.STRING, allowNull: true },
      lastPodcastDate: { type: DataTypes.DATETIME, allowNull: true },
      lastPodcastTitle: { type: DataTypes.STRING, allowNull: true },
      lastPodcastLink: { type: DataTypes.STRING, allowNull: true },
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
      logger.debug(`START: Refreshing ${updateChannels.length} podcast channels`);
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
            currentChannel.id = channel.rss;
            currentChannel.channelName = channel.title;
            currentChannel.channelDate = feedData?.published || new Date();
            currentChannel.twitter = channel.twitter as string;
            currentChannel.mastodon = channel.mastodon as string;
            await currentChannel.save();
         }
         // Se ten último podcast e é distinto do último que recuperou RABOT, publica nas canles que toque.
         if (channel.lastFeedEntry && currentChannel.lastPodcastDate && new Date(currentChannel.lastPodcastDate as Date) < new Date(channel.lastFeedEntry.published as string)) {
            publish(channel);
         }
         currentChannel.channelName = channel.title;
         currentChannel.channelDate = feedData?.published || new Date();
         currentChannel.twitter = channel.twitter as string;
         currentChannel.mastodon = channel.mastodon as string;
         currentChannel.lastPodcastDate = channel.lastFeedEntry?.published as string;
         currentChannel.lastPodcastTitle = channel.lastFeedEntry?.title as string;
         currentChannel.lastPodcastLink = channel.lastFeedEntry?.link as string;
         await currentChannel.update();
         logger.debug(currentChannel);
      }
      logger.info(`Refreshed ${updateChannels.length} podcast channels with their last podcast`);
   } catch (error) { logger.error(error); }
   return true;
}