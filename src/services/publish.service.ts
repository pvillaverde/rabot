import log from "./logger.service.ts";
import { createRestAPIClient, TwitterApi } from '../deps.ts';
import { Config, Credentials } from '../config.ts';
import { sendMessageToDiscordChannels } from '../bot/utils/helpers.ts';
import { PodcastChannelData } from '../acodega/podcast.ts';
import { YoutubeChannelData } from '../acodega/youtube.ts';
import { TwitchChannelData } from '../acodega/twitch.ts';


const logger = log.getLogger('publishService');

export function publish(channel: PodcastChannelData | YoutubeChannelData | TwitchChannelData, mastodon = true, twitter = true, discord = true) {
   logger.info(`Publishing update for channel ${channel.title}: ${channel.lastFeedEntry.title}`)
   if (mastodon) { publishMastodon(channel); }
   if (twitter) { publishTwitter(channel); }
   if (discord) { publishDiscord(channel); }

}
async function publishMastodon(channel: PodcastChannelData | YoutubeChannelData | TwitchChannelData) {
   // Se Mastodon non está habilitado para a plataforma non facemos nada.
   if (!Config[channel.type].mastodon) return;
   try {
      const messageStatus = Config[channel.type].messageTemplate
         .replace(/{channelName}/g, channel.title)
         .replace(/{mentionUser}/g, channel.mastodon ? ` (${channel.mastodon})` : ``)
         .replace(/{title}/g, channel.lastFeedEntry && channel.lastFeedEntry.title ? channel.lastFeedEntry.title : ``)
         .replace(/{url}/g, channel.lastFeedEntry && channel.lastFeedEntry.link ? channel.lastFeedEntry.link : ``)

      const mastodon = await createRestAPIClient(Credentials[channel.type].mastodon);
      const status = await mastodon.v1.statuses.create({ status: messageStatus, visibility: 'public', });

      logger.debug(`Published mastodon status in ${status.url}`);
   } catch (error) {
      logger.error(`Error publishing mastodon status`);
      logger.error(error);
   }
}

async function publishTwitter(channel: PodcastChannelData | YoutubeChannelData | TwitchChannelData) {
   // Se Twitter non está habilitado para a plataforma non facemos nada.
   if (!Config[channel.type].twitter) return;
   try {
      const messageStatus = Config[channel.type].messageTemplate
         .replace(/{channelName}/g, channel.title)
         .replace(/{mentionUser}/g, channel.twitter ? ` (${channel.twitter})` : ``)
         .replace(/{title}/g, channel.lastFeedEntry && channel.lastFeedEntry.title ? channel.lastFeedEntry.title : ``)
         .replace(/{url}/g, channel.lastFeedEntry && channel.lastFeedEntry.link ? channel.lastFeedEntry.link : ``)

      const twitter = new TwitterApi(Credentials[channel.type].twitter);
      const status = await twitter.v2.tweet(messageStatus);
      logger.debug(status);
      logger.debug(`Published twitter status for channel ${channel.title}`);
   } catch (error) {
      logger.error(`Error publishing twitter status`);
      logger.error(error);
   }
}

async function publishDiscord(channel: PodcastChannelData | YoutubeChannelData | TwitchChannelData) {
   // Se Discord non está habilitado para a plataforma non facemos nada.
   if (!Config[channel.type].discord) return;
   try {
      const messageStatus = Config[channel.type].messageTemplate
         .replace(/{channelName}/g, channel.title)
         .replace(/{mentionUser}/g, '')
         .replace(/{title}/g, channel.lastFeedEntry && channel.lastFeedEntry.title ? channel.lastFeedEntry.title : ``)
         .replace(/{url}/g, channel.lastFeedEntry && channel.lastFeedEntry.link ? channel.lastFeedEntry.link : ``)

      await sendMessageToDiscordChannels(channel.type, messageStatus)
      logger.debug(`Published discord status for channel ${channel.title}`);
   } catch (error) {
      logger.error(`Error publishing discord status`);
      logger.error(error);
   }
}