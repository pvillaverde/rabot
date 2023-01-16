import { DataTypes, Model, Relationships } from "../deps.ts";
import { logger, BaseChannelData } from "./mod.ts";
import { fetchJsonData } from "../services/utils.service.ts";
import { publish } from "../services/publish.service.ts";


export class TwitchChannel extends Model {
   static table = 'twitch_channels';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
      login: DataTypes.STRING,
      display_name: DataTypes.STRING,
      type: { type: DataTypes.STRING, allowNull: true },
      broadcaster_type: { type: DataTypes.STRING, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      profile_image_url: { type: DataTypes.STRING, allowNull: true },
      offline_image_urk: { type: DataTypes.STRING, allowNull: true },
      channel_created_at: DataTypes.TIMESTAMP,

      twitter: { type: DataTypes.STRING, allowNull: true },
      mastodon: { type: DataTypes.STRING, allowNull: true },
   };

   static defaults = {
      type: "galegotwitch",
   };
}
export class TwitchChannelStats extends Model {
   static table = 'twitch_channel_stats';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      id: { primaryKey: true, autoIncrement: true },
      viewCount: DataTypes.INTEGER,
      followCount: DataTypes.INTEGER,
   };
   static channel() {
      return this.hasOne(TwitchChannel);
   }
}
export class TwitchChannelFollows extends Model {
   static table = 'twitch_channel_follows';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      /* id: { primaryKey: true, autoIncrement: true }, */
      viewCount: { type: DataTypes.INTEGER, allowNull: true },
      followCount: { type: DataTypes.INTEGER, allowNull: true },
      from_id: { primaryKey: true, type: DataTypes.STRING, allowNull: true },
      from_login: { type: DataTypes.STRING, allowNull: true },
      from_name: { type: DataTypes.STRING, allowNull: true },
      to_id: { primaryKey: true, type: DataTypes.STRING, allowNull: true },
      to_login: { type: DataTypes.STRING, allowNull: true },
      to_name: { type: DataTypes.STRING, allowNull: true },
      followed_at: DataTypes.TIMESTAMP,
   };
   static channel() {
      return this.hasOne(TwitchChannel);
   }
}
export class TwitchStream extends Model {
   static table = 'twitch_streams';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
      user_id: { type: DataTypes.STRING, allowNull: true },
      user_login: { type: DataTypes.STRING, allowNull: true },
      user_name: { type: DataTypes.STRING, allowNull: true },
      game_id: { type: DataTypes.STRING, allowNull: true },
      game_name: { type: DataTypes.STRING, allowNull: true },
      title: { type: DataTypes.STRING, allowNull: true },
      viewer_count: { type: DataTypes.INTEGER, allowNull: true },
      started_at: DataTypes.TIMESTAMP,
      ended_at: DataTypes.TIMESTAMP,
   };
}
export class TwitchStreamViews extends Model {
   static table = 'twitch_stream_views';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      id: { primaryKey: true, autoIncrement: true },
      viewCount: DataTypes.INTEGER,
   };
   static stream() {
      return this.hasOne(TwitchStream);
   }
}
export class TwitchClip extends Model {
   static table = 'twitch_clips';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
      embed_url: { type: DataTypes.STRING, allowNull: true },
      broadcaster_id: { type: DataTypes.STRING, allowNull: true },
      broadcaster_name: { type: DataTypes.STRING, allowNull: true },
      creator_id: { type: DataTypes.STRING, allowNull: true },
      creator_name: { type: DataTypes.STRING, allowNull: true },
      game_id: { type: DataTypes.STRING, allowNull: true },
      language: { type: DataTypes.STRING, allowNull: true },
      title: { type: DataTypes.STRING, allowNull: true },
      view_count: { type: DataTypes.INTEGER, allowNull: true },
      clip_created_at: DataTypes.TIMESTAMP,
      thumbnail_url: { type: DataTypes.STRING, allowNull: true },
   };
}
export class TwitchGame extends Model {
   static table = 'twitch_games';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
      name: { type: DataTypes.STRING, allowNull: true },
      box_art_url: { type: DataTypes.STRING, allowNull: true },
   };
}
Relationships.belongsTo(TwitchChannelStats, TwitchChannel);
Relationships.belongsTo(TwitchChannelFollows, TwitchChannel);
Relationships.belongsTo(TwitchStream, TwitchChannel);
Relationships.belongsTo(TwitchStreamViews, TwitchStream);
Relationships.belongsTo(TwitchClip, TwitchChannel);

export interface TwitchChannelData extends BaseChannelData {
   type: 'galegotwitch';
   twitch: string;
}

/** Refrescar os usuarios: Recoller a información da web e con iso refrescar a información das canles de twitch  */

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

/** Refrescar os streams: Cada minuto ir ver que canles están en directo e actualizar con iso a información do directo e as visualizacións */

/** Refrescar os seguimientos: Unha vez o día comprobar os seguementos de todas as canlees e gardar tamén o reconto de cada canle xunto coas visualizacións da mesma. */

/** Refrescar os clips: Tamén unha vez o día, gardar ou actualizar a información que haxa de todos os clips. */

/** Refrescar os xogos: Cando haxa xogos novos, ou unha vez o día, habería que recollere as miniaturas dos xogos para amosalas no discord e nas estatísticas. */






/** Refresca os datos de youtube e comproba o último vídeo da canle. */