import { fetchJsonData, logger, BaseChannelData } from "./mod.ts";
import { publish } from "../services/publish.service.ts";
import { DataTypes, Model } from "https://deno.land/x/denodb@v1.2.0/mod.ts";

export class TwitchChannel extends Model {
   static table = 'youtube_channel';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
      channelName: DataTypes.STRING,
      type: DataTypes.STRING,
      twitter: { type: DataTypes.STRING, allowNull: true },
      mastodon: { type: DataTypes.STRING, allowNull: true },
      lastTwitchDate: { type: DataTypes.DATETIME, allowNull: true },
      lastTwitchTitle: { type: DataTypes.STRING, allowNull: true },
      lastTwitchLink: { type: DataTypes.STRING, allowNull: true },
   };

   static defaults = {
      type: "galegotwitch",
   };
}

export interface TwitchChannelData extends BaseChannelData {
   type: 'galegotwitch';
   twitch: string;
}


/** Refresca os datos de youtube e comproba o último vídeo da canle. */
export async function refreshTwitch() {
   try {
      const updateChannels: TwitchChannelData[] = await fetchJsonData('https://obradoirodixitalgalego.gal/api/twitch.json');
      // Recorre cada canle e obtén o seu último vídeo
      logger.debug(`START: Refreshing ${updateChannels.length} Twitch channels`);
      for (const channel of updateChannels) {
         // Buscamos se existe xa na BBDD e en caso contrario creámolo.
         let currentChannel = await TwitchChannel.find(channel.twitch)
         if (!currentChannel) {
            currentChannel = new TwitchChannel();
            currentChannel.id = channel.twitch;
            currentChannel.channelName = channel.title;
            currentChannel.twitter = channel.twitter as string;
            currentChannel.mastodon = channel.mastodon as string;
            await currentChannel.save();
         }
         // Se ten último podcast e é distinto do último que recuperou RABOT, publica nas canles que toque.
         if (channel.lastFeedEntry && currentChannel.lastPodcastDate && currentChannel.lastPodcastDate != channel.lastFeedEntry.published) {
            publish(channel);
         }
         currentChannel.channelName = channel.title;
         currentChannel.twitter = channel.twitter as string;
         currentChannel.mastodon = channel.mastodon as string;
         currentChannel.lastPodcastDate = channel.lastFeedEntry?.published as Date;
         currentChannel.lastPodcastTitle = channel.lastFeedEntry?.title as string;
         currentChannel.lastPodcastLink = channel.lastFeedEntry?.link as string;
         await currentChannel.update();
         logger.debug(currentChannel);
      }
      logger.info(`Refreshed ${updateChannels.length} podcast channels with their last podcast`);
   } catch (error) { logger.error(error); }
   return true;
}