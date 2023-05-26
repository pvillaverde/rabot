import { Credentials } from "../config.ts";
import log from "./logger.service.ts";
import { splitInChunks } from "./utils.service.ts";

const logger = log.getLogger('twitchService');
/* JSON.parse(Deno.env.get("RABOT_GOOGLE_CREDENTIALS") as string), */

/**
 * Get the default request options for making API calls to Twitch.
 * @returns {Object} - An object containing the base URL and headers for the request.
 */
async function fetchTwitchEndpoint(url: string) {
   const baseURL = "https://api.twitch.tv/helix";
   // Automatically remove "oauth:" prefix if it's present
   const oauthPrefix = 'oauth:';
   let oauthBearer;
   try { oauthBearer = JSON.parse(Deno.env.get("RABOT_TWITCH_TOKEN") as string).access_token; } catch (_error) { oauthBearer = 'noAuth'; }
   if (oauthBearer.startsWith(oauthPrefix)) {
      oauthBearer = oauthBearer.substr(oauthPrefix.length);
   }
   // Construct default request options
   const response = await fetch(baseURL + url, {
      method: "GET",
      headers: {
         'Client-ID': Credentials.twitch.client_id,
         "Authorization": `Bearer ${oauthBearer}`,
      },
   });
   const data = await response.json();
   // throw errors if not authenticated
   if (data.status >= 400) { throw data; }
   return data;
}

/**
 * Handle error status codes.
 * @param {any} error - The error object thrown.
 * @returns {Promise} - A promise that resolves to the new access token if the error status is 401.
 * @throws {any} - Rejects the promise and throws the error if the error status is not 401.
 */
async function handleErrorStatus(error: any): Promise<any> {
   if (error && error.status === 401) {
      try {
         return await getAccessToken();
      } catch (_error) { /* */ }
   }
   logger.error(error);
   throw error;
}

/** Refresh access token from Twitch API
 * @returns Object with access_token.
 */
async function getAccessToken() {
   logger.warning("Refreshing twitch access token")
   try {
      const url = `https://id.twitch.tv/oauth2/token?client_id=${Credentials.twitch.client_id}&client_secret=${Credentials.twitch.client_secret}&grant_type=client_credentials`;
      const response = await fetch(url, {
         method: "POST",
         headers: {
            'Client-ID': Credentials.twitch.client_id,
         },
      });
      const data = await response.json();
      Deno.env.set("RABOT_TWITCH_TOKEN", JSON.stringify(data));
      return data;
   } catch (error) {
      logger.critical(`Error while refreshing access token`);
      logger.critical(error);
      throw error;
   }
}

export interface TwitchUserData {
   id: string;
   login: string;
   display_name: string;
   type: string;
   broadcaster_type: string;
   description: string;
   profile_image_url: string;
   offline_image_url: string;
   created_at: Date;
   view_count: number;
}

/**
 * Fetch user data from Twitch API
 * @param {string[]} channelNames - An array of channel names to fetch data for
 * @returns {Promise<TwitchUserData[]>} - A promise that resolves to an array of user data objects
 */
export async function fetchUsers(channelNames: string[]): Promise<TwitchUserData[]> {
   // Maximum number of channels we can request in a single query.
   const maxPerRequest = 100;
   const channelsInChunks = splitInChunks(channelNames, maxPerRequest);
   try {
      let users: TwitchUserData[] = [];
      for (const cNames of channelsInChunks) {
         const data = await fetchTwitchEndpoint(`/users?login=${cNames.join('&login=')}`);
         users = users.concat(data.data || []);
      }
      return users;
   } catch (error) {
      return handleErrorStatus(error)
         .then(() => fetchUsers(channelNames))
         .catch(() => []);
   }
}

export interface TwitchStreamData {
   id: string;
   type: string;
   user_id: string;
   user_login: string;
   user_name: string;
   game_id: string;
   game_name: string;
   title: string;
   viewer_count: number;
   started_at: Date;
   ended_at: Date;
   thumbnail_url: string;
   language: string;
   is_mature: boolean;
   tags: string[];
   live_messages: string;
}

/**
 * Fetch streams data from Twitch API
 * @param {string[]} channelNames - An array of channel names to fetch data for
 * @returns {Promise<TwitchStreamData[]>} - A promise that resolves to an array of stream data objects
 */
export async function fetchStreams(channelNames: string[]): Promise<TwitchStreamData[]> {
   // Maximum number of channels we can request in a single query.
   const maxPerRequest = 100;
   const channelsInChunks = splitInChunks(channelNames, maxPerRequest);
   try {
      const requests = channelsInChunks.map((cNames: string[]) =>
         fetchTwitchEndpoint(`/streams?user_login=${cNames.join('&user_login=')}`));
      const responses = await Promise.all(requests);
      // get the data array from each response
      const responsesStreamsData: TwitchStreamData[][] = responses.map(response => response.data || []);
      // flatten the array of arrays into a single array
      const streams = responsesStreamsData.reduce((array, data) => array.concat(data), []);
      return streams;
   } catch (error) {
      return handleErrorStatus(error)
         .then(() => fetchStreams(channelNames))
         .catch(() => []);
   }
}

export interface TwitchGameData {
   id: string;
   name: string;
   box_art_url: string,
}

/**
 * Fetch game data from Twitch API
 * @param {string[]} gameIds - An array of game ids to fetch data for
 * @returns {Promise<TwitchGameData[]>} - A promise that resolves to an array of game data objects
 */
export async function fetchGames(gameIds: string[]): Promise<TwitchGameData[]> {
   try {
      const response = await fetchTwitchEndpoint(`/games?id=${gameIds.join('&id=')}`)
      return response.data || [];
   } catch (error) {
      return handleErrorStatus(error)
         .then(() => fetchGames(gameIds))
         .catch(() => []);
   }
}

export interface TwitchFollowersData {
   viewCount: number;
   followCount: number;
   from_id: string;
   from_login: string;
   from_name: string;
   to_id: string;
   to_login: string;
   to_name: string;
   followed_at: Date;

   twitchchannelId?: string;
}
/**
 * Fetch channel followers from Twitch API
 * @param {string} channelId - The id of the channel to fetch followers for
 * @param {string} cursor - The cursor used for pagination
 * @param {TwitchFollowersData[]} previousQueryFollowers - The followers data from previous queries
 * @returns {Promise<TwitchFollowersData[]>} - A promise that resolves to an array of followers data objects
 */
export async function fetchChannelFollowers(channelId: string, cursor?: string, previousQueryFollowers: TwitchFollowersData[] = []): Promise<TwitchFollowersData[]> {
   // Set pagination cursor
   const pagination = cursor ? `&after=${cursor}` : '';
   try {
      const response = await fetchTwitchEndpoint(`/users/follows?to_id=${channelId}&first=100${pagination}`)
      // If there is a cursor in the response, send another fetch and concat results
      const responseFollowers = response.data || [];
      if (response.pagination.cursor) {
         return await fetchChannelFollowers(channelId, response.pagination.cursor, responseFollowers.concat(previousQueryFollowers));
      } else {
         return responseFollowers.concat(previousQueryFollowers);
      }
   } catch (error) {
      return handleErrorStatus(error)
         .then(() => fetchChannelFollowers(channelId, cursor, previousQueryFollowers))
         .catch(() => []);
   }
}

export interface TwitchClipData {
   id: string;
   url: string;
   embed_url: string;
   broadcaster_id: string;
   broadcaster_name: string;
   creator_id: string;
   creator_name: string;
   game_id: string;
   language: string;
   title: string;
   view_count: number;
   created_at: Date;
   thumbnail_url: string;
}
/**
 * Fetch clips from Twitch API
 * @param {string} broadcasterId - The id of the broadcaster to fetch clips for
 * @param {string} cursor - The cursor used for pagination
 * @param {TwitchClipData[]} previousQueryClips - The clips data from previous queries
 * @returns {Promise<TwitchClipData[]>} - A promise that resolves to an array of clips data objects
 */
export async function fetchClips(broadcasterId: string, cursor?: string, previousQueryClips: TwitchClipData[] = []): Promise<TwitchClipData[]> {
   // Set pagination cursor
   const pagination = cursor ? `&after=${cursor}` : '';
   try {
      const response = await fetchTwitchEndpoint(`/clips?broadcaster_id=${broadcasterId}&first=100${pagination}`)
      // If there is a cursor in the response, send another fetch and concat results
      const responseClips = response.data || [];
      if (response.pagination.cursor) {
         return await fetchClips(broadcasterId, response.pagination.cursor, responseClips.concat(previousQueryClips));
      } else {
         return responseClips.concat(previousQueryClips);
      }
   } catch (error) {
      return handleErrorStatus(error)
         .then(() => fetchClips(broadcasterId, cursor, previousQueryClips))
         .catch(() => []);
   }
}