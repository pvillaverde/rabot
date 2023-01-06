import { PodcastChannel, YoutubeChannel, TwitchChannel } from './acodega.service.ts';
import log from "./logger.service.ts";

const logger = log.getLogger('publishService');

export function publish(channel: PodcastChannel | YoutubeChannel | TwitchChannel) {
   logger.debug("publish", channel)
   publishMastodon(channel);
   publishTwitter(channel);
   publishDiscord(channel);

}
function publishMastodon(channel: PodcastChannel | YoutubeChannel | TwitchChannel) {
   logger.debug("publish", channel)
   /* if (!config.mastodon) return;
   const client = new Mastodon({
      access_token: config.mastodon.access_token,
      timeout_ms: config.mastodon.timeout_ms,
      api_url: config.mastodon.api_url,
   });
   let message = config.mastodon.messageTemplate
      .replace(/{channelName}/g, channel.name)
      .replace(/{title}/g, Discord.Util.escapeMarkdown(videoTitle))
      .replace(/{url}/g, videoLink);
   try {
      var success = await client.post('statuses', { status: message });
      console.log('[YoutubeMonitor-Mastodon]', `Enviouse actualización a Mastodon da canle: ${channel.name}`);
   } catch (error) {
      new FileDatabaseService('live-messages').put('last-error', moment());
      console.error('[YoutubeMonitor-Mastodon]', `Non se puido enviar o toot da canle ${channel.name}`, error);
   } */
}

function publishTwitter(channel: PodcastChannel | YoutubeChannel | TwitchChannel) {
   logger.debug("publish", channel)

   /* if (!config.twitter) return;
   const client = new TwitterApi({
      appKey: config.twitter.appKey,
      appSecret: config.twitter.appSecret,
      accessToken: config.twitter.accessToken,
      accessSecret: config.twitter.accessSecret,
   });
   let message = config.twitter.messageTemplate
      .replace(/{channelName}/g, channel.name)
      .replace(/{twitterUser}/g, channel.twitter && channel.twitter.startsWith('@') ? `(${channel.twitter})` : '')
      .replace(/{title}/g, Discord.Util.escapeMarkdown(videoTitle))
      .replace(/{url}/g, videoLink);
   try {
      var success = await client.v2.tweet(message);
      console.log('[YoutubeMonitor-Twitter]', `Enviouse actualización a twitter da canle: ${channel.name}`);
   } catch (error) {
      new FileDatabaseService('live-messages').put('last-error', moment());
      console.error('[YoutubeMonitor-Twitter]', `Non se puido enviar o tweet da canle ${channel.name}`, error);
   } */
}

function publishDiscord(channel: PodcastChannel | YoutubeChannel | TwitchChannel) {
   logger.debug("publish", channel)

}