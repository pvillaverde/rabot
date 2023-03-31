import { events } from "./mod.ts";
import { Config } from "../../config.ts";
import { DiscordBot, logger, targetChannels } from "../mod.ts";
import { Guild, Channel, Bot, sendMessage, getDmChannel, hasChannelPermissions, Member, leaveGuild } from "../../deps.ts";

events.guildCreate = async (bot: Bot, guild: Guild) => {
   logger.info(`Joined new server: ${guild.name}`)

   try {
      for (const platform of (Object.keys(targetChannels) as ("galegotube" | "galegotwitch" | "podgalego")[])) {
         if (!Config[platform].discord) continue;
         const channelName = Config[platform].discordChannelName;
         const targetChannel = guild.channels.find((c: Channel) => c.name === channelName);
         if (!targetChannel) {
            logger.warning(`Configuration problem! Guild ${guild.name} does not have a #${channelName} channel!`)
            /* await sendMessageToDiscordOwner(bot, guild, `Ocurriu un erro ao configurar o bot, non atopo a canle \`${channelName}\` no servidor \`${guild.name}\`, engádea para recibir as notificacións de ${platform}.`); */
         } else {
            const member = DiscordBot.members.get(DiscordBot.transformers.snowflake(`${bot.id}${guild.id}`))
            if (hasChannelPermissions(DiscordBot, targetChannel, member as Member, ['SEND_MESSAGES', 'VIEW_CHANNEL'])) {
               logger.info(`Member of server ${guild.name}, target channel is #${targetChannel.name}`)
               targetChannels[platform].push(targetChannel);
            } else {
               logger.warning(`Permission problem! I do not have SEND_MESSAGES permission on channel #${targetChannel.name} on ${guild.name}: announcement sends will fail.`)
               await sendMessageToDiscordOwner(bot, guild, `Ocurriu un erro ao configurar o bot, comproba que ten os permisos de escritura na canle \`#${channelName}\` do servidor \`${guild.name}\`.`);
            }
         }
      }
   } catch (error) {
      logger.critical(error);
      logger.critical(`Houbo un erro ao enviarlle mensaxe o dono do discord ${guild.name}, así que marcho que teño que marchar.`);
      leaveGuild(bot, guild.id);     
   }
}

async function sendMessageToDiscordOwner(bot: Bot, guild: Guild, content: string) {
   const userChannel = await getDmChannel(bot, guild.ownerId);
   return await sendMessage(bot, userChannel.id, { content })
}