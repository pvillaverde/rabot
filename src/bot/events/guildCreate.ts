import { events } from "./mod.ts";
import { Config } from "../../config.ts";
import { DiscordBot, logger, targetChannels } from "../mod.ts";
import { Guild, Channel, Bot, sendMessage, getDmChannel, hasChannelPermissions, requireBotChannelPermissions } from "../deps.ts";

events.guildCreate = async (bot: Bot, guild: Guild) => {
   logger.info(`Joined new server: ${guild.name}`)

   for (const platform of (Object.keys(targetChannels) as ("galegotube" | "galegotwitch" | "podgalego")[])) {
      const channelName = Config[platform].discordChannelName;
      const targetChannel = guild.channels.find((c: Channel) => c.name === channelName);
      if (!targetChannel) {
         logger.warning(`Configuration problem! Guild ${guild.name} does not have a #${channelName} channel!`)
         sendMessageToDiscordOwner(bot, guild, `Ocurriu un erro ao configurar o bot, non atopo a canle \`${channelName}\` no servidor \`${guild.name}\`, engádea para recibir as notificacións de ${platform}.`);
      } else {
         const member = await DiscordBot.helpers.getMember(guild.id, DiscordBot.id);
         console.log(hasChannelPermissions(DiscordBot, targetChannel, member, ['SEND_MESSAGES', 'VIEW_CHANNEL']))
         if (hasChannelPermissions(DiscordBot, targetChannel, member, ['SEND_MESSAGES', 'VIEW_CHANNEL'])) {

            sendMessage(bot, targetChannel.id, { content: "test" }).catch(console.log);
            logger.info(`Member of server ${guild.name}, target channel is #${targetChannel.name}`)

            targetChannels[platform].push(targetChannel);
         } else {
            logger.warning(`Permission problem! I do not have SEND_MESSAGES permission on channel #${targetChannel.name} on ${guild.name}: announcement sends will fail.`)
            sendMessageToDiscordOwner(bot, guild, `Ocurriu un erro ao configurar o bot, comproba que ten os permisos de escritura na canle \`#${channelName}\` do servidor \`${guild.name}\`.`);
         }
      }
   }
}

async function sendMessageToDiscordOwner(bot: Bot, guild: Guild, content: string) {
   const userChannel = await getDmChannel(bot, guild.ownerId);
   sendMessage(bot, userChannel.id, { content })
}