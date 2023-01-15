import { fetchJsonData, getFeedData, logger, BaseChannelData } from "./mod.ts";
import { publish } from "../services/publish.service.ts";
import { DataTypes, Model, Relationships } from "https://deno.land/x/denodb@v1.2.0/mod.ts";

export class YoutubeChannel extends Model {
   static table = 'youtube_channel';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
      channelName: DataTypes.STRING,
      channelDate: DataTypes.DATETIME,
      type: DataTypes.STRING,
      twitter: { type: DataTypes.STRING, allowNull: true },
      mastodon: { type: DataTypes.STRING, allowNull: true },
      lastVideoDate: { type: DataTypes.DATETIME, allowNull: true },
      lastVideoTitle: { type: DataTypes.STRING, allowNull: true },
      lastVideoLink: { type: DataTypes.STRING, allowNull: true },
   };

   static defaults = {
      type: "galegotube",
   };
}

export class YoutubeChannelStats extends Model {
   static table = 'youtube_channel_stats';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      id: { primaryKey: true, autoIncrement: true },
      hiddensubscribercount: DataTypes.BOOLEAN,
      viewcount: DataTypes.INTEGER,
      subscribercount: DataTypes.INTEGER,
      videocount: DataTypes.INTEGER,
      YoutubeChannelId: DataTypes.INTEGER,
   };
   static channel() {
      return this.hasOne(YoutubeChannel);
   }
}

Relationships.belongsTo(YoutubeChannelStats, YoutubeChannel);
export interface YoutubeChannelData extends BaseChannelData {
   type: 'galegotube';
   youtube: string;
}


/** Refresca os datos de youtube e comproba o último vídeo da canle. */
export async function refreshYoutube() {
   try {
      const updateChannels: YoutubeChannelData[] = await fetchJsonData('https://obradoirodixitalgalego.gal/api/youtube.json');
      // Recorre cada canle e obtén o seu último vídeo
      logger.debug(`START: Refreshing ${updateChannels.length} youtube channels`);
      for (const channel of updateChannels) {
         // Obtemos a información do RSS
         const feedData = await getFeedData(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.youtube}`);
         if (feedData && feedData.items && feedData.items.length) {
            channel.type = "galegotube";
            channel.lastFeedEntry = {
               title: feedData.items[0].title,
               published: feedData.items[0].isoDate,
               link: feedData.items[0].link,
            }
         }
         // Buscamos se existe xa na BBDD e en caso contrario creámolo.
         let currentChannel = await YoutubeChannel.find(channel.youtube)
         if (!currentChannel) {
            currentChannel = new YoutubeChannel();
            currentChannel.id = channel.youtube;
            currentChannel.channelName = channel.title;
            currentChannel.channelDate = feedData?.published || new Date();
            currentChannel.twitter = channel.twitter as string;
            currentChannel.mastodon = channel.mastodon as string;
            await currentChannel.save();
         }
         // Se ten último vídeo e é distinto do último que recuperou RABOT, publica nas canles que toque.
         if (channel.lastFeedEntry && currentChannel.lastVideoDate && new Date(currentChannel.lastVideoDate as Date) < new Date(channel.lastFeedEntry.published as string)) {
            publish(channel);
         }
         currentChannel.channelName = channel.title;
         currentChannel.channelDate = feedData?.published || new Date();
         currentChannel.twitter = channel.twitter as string;
         currentChannel.mastodon = channel.mastodon as string;
         currentChannel.lastVideoDate = channel.lastFeedEntry?.published as string;
         currentChannel.lastVideoTitle = channel.lastFeedEntry?.title as string;
         currentChannel.lastVideoLink = channel.lastFeedEntry?.link as string;
         await currentChannel.update();
         logger.debug(currentChannel);
      }
      logger.info(`Refreshed ${updateChannels.length} youtube channels with their last video`);
   } catch (error) { logger.error(error); }
   return true;
}

/** Refresca as estatísticas das canles do YouTube  */
export async function refreshYoutubeStats() {
   const youtubeChannels: YoutubeChannel[] = await YoutubeChannel.all();
   for (const channel of youtubeChannels) {
      logger.debug(`Getting stats for channel: ${channel.channelName}`)
      /* const stats = await Promise.resolve();
      const youtubeChannelStats = new YoutubeChannelStats();
      youtubeChannelStats.hiddensubscribercount = stats.hiddensubscribercount;
      youtubeChannelStats.viewcount = stats.viewcount;
      youtubeChannelStats.subscribercount = stats.subscribercount;
      youtubeChannelStats.videocount = stats.videocount;
      youtubeChannelStats.YoutubeChannelId = channel.id;
      youtubeChannelStats.save(); */
   }
}