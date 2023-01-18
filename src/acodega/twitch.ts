import { DataTypes, Model, Relationships } from "../deps.ts";
import { logger, BaseChannelData } from "./mod.ts";
import { fetchJsonData, splitInChunks } from "../services/utils.service.ts";
import { publish } from "../services/publish.service.ts";
import { fetchChannelFollowers, fetchClips, fetchGames, fetchUsers, TwitchClipData, TwitchFollowersData, TwitchGameData, TwitchUserData } from "../services/twitch.service.ts";

interface Values { [key: string]: any };
export class TwitchChannel extends Model {
   static table = 'twitch_channels';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      channel_id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
      login: DataTypes.STRING,
      display_name: DataTypes.STRING,
      type: { type: DataTypes.STRING, allowNull: true },
      broadcaster_type: { type: DataTypes.STRING, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      profile_image_url: { type: DataTypes.STRING, allowNull: true },
      offline_image_url: { type: DataTypes.STRING, allowNull: true },
      view_count: { type: DataTypes.INTEGER, allowNull: true },
      channel_created_at: DataTypes.TIMESTAMP,

      twitter: { type: DataTypes.STRING, allowNull: true },
      mastodon: { type: DataTypes.STRING, allowNull: true },
      disabled: DataTypes.BOOLEAN,
   };

   static defaults = {
      type: "galegotwitch",
      disabled: true,
   };
}
export class TwitchChannelStats extends Model {
   static table = 'twitch_channel_stats';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      stats_id: { primaryKey: true, autoIncrement: true },
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
      follow_id: { primaryKey: true, autoIncrement: true },
      from_id: { type: DataTypes.STRING, allowNull: true },
      from_login: { type: DataTypes.STRING, allowNull: true },
      from_name: { type: DataTypes.STRING, allowNull: true },
      to_id: { type: DataTypes.STRING, allowNull: true },
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
      stream_id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
      user_id: { type: DataTypes.STRING, allowNull: true },
      user_login: { type: DataTypes.STRING, allowNull: true },
      user_name: { type: DataTypes.STRING, allowNull: true },
      game_id: { type: DataTypes.STRING, allowNull: true },
      game_name: { type: DataTypes.STRING, allowNull: true },
      title: { type: DataTypes.STRING, allowNull: true },
      viewer_count: { type: DataTypes.INTEGER, allowNull: true },
      started_at: DataTypes.TIMESTAMP,
      ended_at: DataTypes.TIMESTAMP,
      live_messages: { type: DataTypes.TEXT, allowNull: true },
   };
}
export class TwitchStreamViews extends Model {
   static table = 'twitch_stream_views';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      streamview_id: { primaryKey: true, autoIncrement: true },
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
      clip_id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
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
      game_id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
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

/**
 * Refresh users from obradoirodixitalgalego.gal and Twitch Api, disabling those that are no longer on ACODEGA.
 * @returns {Promise} - A promise that resolves when the users have been updated.
 */
export async function refreshTwitch() {
   try {
      const updateChannels: TwitchChannelData[] = await fetchJsonData('https://obradoirodixitalgalego.gal/api/twitch.json');
      // Recorre cada canle e obtén o seu último vídeo
      logger.debug(`START: Refreshing ${updateChannels.length} Twitch channels`);
      const channelNames = updateChannels.map(c => c.twitch);
      const twitchChannels: TwitchUserData[] = await fetchUsers(channelNames);
      for (const channel of twitchChannels) {
         // Buscamos se existe xa na BBDD e en caso contrario creámolo.
         const channelData = updateChannels.find(c => c.twitch.toLowerCase() === channel.login) as TwitchChannelData;
         let currentChannel = await TwitchChannel.find(channel.id)
         if (!currentChannel) {
            currentChannel = new TwitchChannel();
            currentChannel.channel_id = channel.id;
            currentChannel.login = channel.login;
            currentChannel.display_name = channel.display_name;
            currentChannel.channel_created_at = channel.created_at;
            await currentChannel.save();
         }
         // Actualizamos os datos que poden mudar.
         currentChannel.login = channel.login;
         currentChannel.display_name = channel.display_name;
         currentChannel.broadcaster_type = channel.type;
         currentChannel.description = channel.description;
         currentChannel.profile_image_url = channel.profile_image_url;
         currentChannel.offline_image_url = channel.offline_image_url;
         currentChannel.view_count = channel.view_count;
         currentChannel.twitter = channelData.twitter as string;
         currentChannel.mastodon = channelData.mastodon as string;
         currentChannel.disabled = false;
         await currentChannel.update();
         logger.debug(currentChannel);
      }
      const allChannels = await TwitchChannel.all();
      for (const channel of allChannels) {
         const isUpdated = updateChannels.some(c => c.twitch.toLowerCase() === channel.login);
         channel.disabled = !isUpdated;
         await channel.update();
      }
      logger.info(`Refreshed ${updateChannels.length} twitch channels`);
   } catch (error) { logger.error(error); }
   return true;
}

/** Refrescar os streams: Cada minuto ir ver que canles están en directo e actualizar con iso a información do directo e as visualizacións */
export async function refreshStreams() {
   const currentChannels = await TwitchChannel.where('disabled', false).all();
   // Cos nomes das canlees actuais, buscar os streams que están actualmente en emisión.
   // Se o stream é novo, enviar unha notificación inicial.
   // Se o stream non é novo, actualizar a mensaxe do discord.
   // Crear ou actualizar os datos do Stream.
   // Co listado de streams que tiñamos activo, comprobar os que xa non están en directo. Se xan on o están, actualizar o directo coa data de fin e cerrar a notificación de discord.
}
/**
 * Refresh followers for the current channels, also storing stats of the current viewCount and followCount
 * @returns {Promise} - A promise that resolves when the users have been updated.
 */
export async function refreshFollowers() {
   logger.debug(`START: Refreshing Followers`);
   const currentChannels = await TwitchChannel.where('disabled', false).all();
   let followers: TwitchFollowersData[] = [];
   for (const channel of currentChannels) {
      const channelFollowers = await fetchChannelFollowers(channel.channel_id as string);
      followers = followers.concat(channelFollowers);
      // Gardamos as estatísticas da canle.
      const stats = new TwitchChannelStats();
      stats.viewCount = channel.view_count;
      stats.followCount = channelFollowers.length;
      stats.twitchchannelId = channel.channel_id
      await stats.save();
   }
   // Borramos os antigos, por se alguén deixou de seguir
   await TwitchChannelFollows.delete();
   // Creamos os seguementos actuais.
   for (const follower of followers) {
      follower.twitchchannelId = follower.to_id;
   }
   const chunks = splitInChunks(followers, 1000);
   for (const chunk of chunks) {
      await TwitchChannelFollows.create(chunk as Values);
   }
   logger.info(`Refreshed ${followers.length} for ${currentChannels.length} channels`);
}
/**
 * Refresh clips for all channels from Twitch API.
 * @returns {Promise} - A promise that resolves when the clips have been updated.
 */
export async function refreshClips() {
   logger.debug(`START: Refreshing Clips`);
   const currentChannels = await TwitchChannel.where('disabled', false).all();
   let clips: TwitchClipData[] = [];
   for (const channel of currentChannels) {
      const channelClips = await fetchClips(channel.channel_id as string);
      clips = clips.concat(channelClips);
   }
   for (const clip of clips) {
      let currentClip = await TwitchClip.find(clip.id)
      if (!currentClip) {
         currentClip = new TwitchClip();
         currentClip.clip_id = clip.id;
         currentClip.url = clip.url;
         currentClip.embed_url = clip.embed_url;
         currentClip.broadcaster_id = clip.broadcaster_id;
         currentClip.broadcaster_name = clip.broadcaster_name;
         currentClip.creator_id = clip.creator_id;
         currentClip.creator_name = clip.creator_name;
         currentClip.game_id = clip.game_id;
         currentClip.language = clip.language;
         currentClip.title = clip.title;
         currentClip.view_count = clip.view_count;
         currentClip.created_at = clip.created_at;
         currentClip.thumbnail_url = clip.thumbnail_url;
         await currentClip.save();
      }
      currentClip.view_count = clip.view_count;
      currentClip.update();
   }
   logger.info(`Refreshed ${clips.length} for ${currentChannels.length} channels`);
}
/**
 * Refresh games for all streams from Twitch API.
 * @returns {Promise} - A promise that resolves when the games have been updated.
 */
export async function refreshGames() {
   logger.debug(`START: Refreshing Games`);
   const missingGames = await TwitchStream.select('game_id')
      .leftJoin(TwitchGame, TwitchGame.field('id'), TwitchStream.field('game_id'))
      .where(TwitchGame.field("id"), null).all();
   const games: TwitchGameData[] = await fetchGames(missingGames.map((s) => s.game_id as string));
   for (const game of games) {
      const currentGame = new TwitchGame();
      currentGame.game_id = game.id;
      currentGame.name = game.name;
      currentGame.box_art_url = game.box_art_url;
      await currentGame.save();
   }
   logger.info(`Refreshed ${missingGames.length} missing games`);
}