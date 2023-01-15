import { logger, BaseChannelData } from "./mod.ts";
import { fetchJsonData, getFeedData } from "../services/utils.service.ts";
import { publish } from "../services/publish.service.ts";
import { DataTypes, Model, Relationships } from "https://deno.land/x/denodb@v1.2.0/mod.ts";
import { Credentials } from "../config.ts";

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
      hiddenSubscriberCount: DataTypes.BOOLEAN,
      viewCount: DataTypes.INTEGER,
      subscriberCount: DataTypes.INTEGER,
      videoCount: DataTypes.INTEGER,
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
      try {
         logger.debug(`Getting stats for channel: ${channel.channelName}`)
         const youtubeJson = await fetchJsonData(`https://youtube.googleapis.com/youtube/v3/channels?part=statistics&key=${Credentials.google.appKey}&id=${channel.id}`)
         if (youtubeJson && youtubeJson.items && youtubeJson.items[0] && youtubeJson.items[0].statistics) {
            const youtubeChannelStats = new YoutubeChannelStats();
            youtubeChannelStats.hiddenSubscriberCount = youtubeJson.items[0].statistics.hiddenSubscriberCount;
            youtubeChannelStats.viewCount = youtubeJson.items[0].statistics.viewCount;
            youtubeChannelStats.subscriberCount = youtubeJson.items[0].statistics.subscriberCount;
            youtubeChannelStats.videoCount = youtubeJson.items[0].statistics.videoCount;
            youtubeChannelStats.youtubechannelId = channel.id;
            await youtubeChannelStats.save();
            logger.debug(youtubeChannelStats)
         }
      } catch (error) {
         logger.error(`Erro ao actualizar as estatísticas de Youtube`);
         logger.error(error);
      }
   }
   logger.info(`Gardadas as estatísticas de ${youtubeChannels.length} canles de YouTube.`)
}