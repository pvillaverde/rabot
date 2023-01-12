import { PodcastChannel, YoutubeChannel, TwitchChannel } from './acodega.service.ts';
import log from "./logger.service.ts";
import { login } from 'npm:masto';
import { TwitterApi } from 'npm:twitter-api-v2';
import { Config, Credentials } from '../config.ts';
import { sendMessageToDiscordChannels } from '../bot/utils/helpers.ts';


const logger = log.getLogger('publishService');

export function publish(channel: PodcastChannel | YoutubeChannel | TwitchChannel) {
   logger.info(`Publishing update for channel ${channel.title}: ${channel.lastFeedEntry.title}`)
   publishMastodon(channel);
   publishTwitter(channel);
   publishDiscord(channel);

}
async function publishMastodon(channel: PodcastChannel | YoutubeChannel | TwitchChannel) {
   // Se Mastodon non está habilitado para a plataforma non facemos nada.
   if (!Config[channel.type].mastodon) return;
   try {
      const messageStatus = Config[channel.type].messageTemplate
         .replace(/{channelName}/g, channel.title)
         .replace(/{mentionUser}/g, channel.mastodon ? ` (${channel.mastodon})` : ``)
         .replace(/{title}/g, channel.lastFeedEntry && channel.lastFeedEntry.title ? channel.lastFeedEntry.title : ``)
         .replace(/{url}/g, channel.lastFeedEntry && channel.lastFeedEntry.link ? channel.lastFeedEntry.link : ``)

      const mastodon = await login(Credentials[channel.type].mastodon);
      const status = await mastodon.v1.statuses.create({ status: messageStatus, visibility: 'public', });

      logger.debug(`Published mastodon status in ${status.url}`);
   } catch (error) {
      logger.error(`Error publishing mastodon status`, error);
   }
}

async function publishTwitter(channel: PodcastChannel | YoutubeChannel | TwitchChannel) {
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
      logger.error(`Error publishing twitter status`, error);
   }
}

async function publishDiscord(channel: PodcastChannel | YoutubeChannel | TwitchChannel) {
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
      logger.error(`Error publishing discord status`, error);
   }
}