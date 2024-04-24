import { TwitchChannel, TwitchGame, TwitchStream } from "../../acodega/twitch.ts";
import { sendMessage, editMessage, BigString, EditMessage, CreateMessage, DiscordEmbed, humanizeDuration, crosspostMessage, ChannelTypes, Channel, Message } from "../../deps.ts";
import { DiscordBot, logger, targetChannels } from "../mod.ts";

/**
 * getidString - Returns the id transformed into a string
 * @param {BigInt} id - the id of of a guild, message or channel
 * @returns {string}
*/
export function getidString(id: BigInt) {
   return DiscordBot.transformers.reverse.snowflake(id as bigint);
}

/**
 * crosspostAnnouncementChannel - sends a message from Discord Annoucement Channels to other Discords that follow that cannel
 * @param {Channel} channel - the discord channel to check if it's an annoucement channel and publish crossposts
 * @param {Message} message - the discord message that has just been sent.
 * @returns {Promise}
*/
export async function crosspostAnnouncementChannel(channel: Channel, message: Message) {
   if (message.editedTimestamp) return; // Do not crosspost edited messages.
   if (channel.type == ChannelTypes.GuildAnnouncement) {
      try {
         await crosspostMessage(DiscordBot, channel.id, message.id);
      } catch (error) {
         logger.error(`Couldn't crosspost message ${message.id}.`)
         logger.error(error);
      }
   }
   return;
}
/**
 * sendMessageToDiscordChannels - sends a message to the Discord channels associated with the specified platform
 * @param {string} platform - the platform to send the message to (options: "galegotube", "galegotwitch", "podgalego", "blogomillo")
 * @param {string} content - the message to send
 * @returns {Promise}
*/
export async function sendMessageToDiscordChannels(platform: "galegotube" | "galegotwitch" | "podgalego" | "blogomillo", content: string) {
   for (const channel of targetChannels[platform]) {
      const message = await sendMessage(DiscordBot, channel.id, { content });
      /* crosspostAnnouncementChannel(channel, message); */
   }
   return;
}
/**
 * updateOrSendMessage - updates or sends a message to a specific Discord channel
 * @param {Object} message - the message to send or update (either a CreateMessage or EditMessage object)
 * @param {string} channelId - the id of the Discord channel to send the message to
 * @param {string} [messageId] - the id of the message to update (if provided, message will be edited, otherwise it will be sent)
 * @returns {Promise}
*/
export async function updateOrSendMessage(message: CreateMessage | EditMessage, channelId: BigString, messageId?: BigString) {
   if (messageId) {
      try {
         return await editMessage(DiscordBot, channelId, messageId, message as EditMessage);
      } catch (error) {
         logger.error(`Couldn't edit message ${messageId}.`)
         logger.error(error);
      }
   } else {
      try {
         return await sendMessage(DiscordBot, channelId, message as CreateMessage);
      } catch (error) {
         logger.error(`Couldn't send message ${messageId}.`)
         logger.error(error);
      }
   }
   return;
}

/**
 * createLiveEmbedForStream - creates a DiscordEmbed object for a live Twitch stream
 * @param {Object} stream - the Twitch stream object
 * @param {Object} channel - the Twitch channel object
 * @param {Object} game - the Twitch game object
 * @returns {Object} liveEmbed - the DiscordEmbed object for the live stream
 */
export function createLiveEmbedForStream(stream: TwitchStream, channel: TwitchChannel, game: TwitchGame) {
   const isLive = stream.type === "live";
   const liveEmbed: DiscordEmbed = {
      title: stream.title as string,
      url: `https://twitch.tv/${(stream.user_login as string || stream.user_name as string).toLowerCase()}`,
      fields: [],
   }
   if (game && game.box_art_url) {
      liveEmbed.thumbnail = { url: (game.box_art_url as string).replace('{width}', '288').replace('{height}', '384') };
   }
   // Add game
   switch (stream.game_name) {
      case 'Just Chatting':
         liveEmbed.fields?.push({ name: "A que andamos?", value: "De Parola™", inline: false })
         break;
      case 'Talk Shows & Podcasts':
         liveEmbed.fields?.push({ name: "A que andamos?", value: "Podcasts e De Parola™", inline: false })
         break;
      default:
         liveEmbed.fields?.push({ name: "A que andamos?", value: stream.game_name as string, inline: false })
         break;
   }
   // Etiquetas
   if (stream.tags) {
      liveEmbed.fields?.push({ name: "Etiquetas", value: stream.tags as string, inline: false })
   }
   if (isLive) {
      // Se o stream está en directo
      liveEmbed.color = 0x9146ff;
      liveEmbed.author = { name: `${stream.user_name} está agora en directo!`, icon_url: channel.profile_image_url as string }
      liveEmbed.description = `Axiña, [preme para velo en twitch](https://twitch.tv/${(stream.user_login as string || stream.user_name as string).toLowerCase()})`;
      if (stream.thumbnail_url) {
         const thumbnailBuster = (Date.now() / 1000).toFixed(0);
         liveEmbed.image = {
            url: (stream.thumbnail_url as string).replace('{width}', '1280').replace('{height}', '720') + `?t=${thumbnailBuster}`,
         }
      }
      liveEmbed.fields?.push({ name: "Estado", value: `:red_circle: Emitindo con ${stream.viewer_count} espectadores`, inline: true })
   } else {
      // Se xa rematou o directo.
      liveEmbed.color = 0x808080;
      liveEmbed.author = { name: `${stream.user_name} estivo en directo!**`, icon_url: channel.profile_image_url as string }
      liveEmbed.fields?.push({ name: "Estado", value: `:white_circle: A emisión xa rematou.`, inline: true })
   }
   // Add uptime
   const now = new Date(stream.ended_at as Date).getTime();
   const startedAt = new Date(stream.started_at as Date).getTime();
   const streamDuration = humanizeDuration((now - startedAt), {
      delimiter: ', ',
      largest: 2,
      round: true,
      units: ['y', 'mo', 'w', 'd', 'h', 'm'],
      language: 'gl',
      fallbacks: ['gl', 'es'],
   });
   liveEmbed.fields?.push({ name: "Tempo en emisión", value: streamDuration, inline: true });
   return liveEmbed;
}