import { createBot, Intents, startBot, calculatePermissions, Guild, Channel, Bot, sendMessage, getDmChannel } from "https://deno.land/x/discordeno@13.0.0/mod.ts";
import { Config, Credentials } from "../config.ts";
import log from "./logger.service.ts";


const logger = log.getLogger('discordService');
export const targetChannels = {
   galegotube: [] as Channel[],
   galegotwitch: [] as Channel[],
   podgalego: [] as Channel[],
}
export const DiscordBot = createBot({
   token: Credentials.discord.token,
   intents: Intents.Guilds | Intents.GuildMessages,
   events: {
      ready() { logger.debug("Successfully connected to Discord Gateway"); },
      /** Cando se arranca o bot e se une a un novo servidor ou o engaden por primeira vez */
      async guildCreate(bot: Bot, guild: Guild) {
         logger.info(`Joined new server: ${guild.name}`)
         return await getChannelList(bot);
      },
      /** Cando se elimina o bot dalgún servidor */
      async guildDelete(bot: Bot, guildId: bigint) {
         const guild = await DiscordBot.helpers.getGuild(guildId);
         logger.info(`Removed from a server: ${guild.name}`)
         return await getChannelList(bot);
      }
   },
});
// Another way to do events
/* DiscordBot.events.messageCreate = function (b, message) {
   // Process the message here with your command handler.
}; */
export default async function startDiscordBot() {
   logger.debug(`Starting Discord Bot`);
   await startBot(DiscordBot);
   return DiscordBot;
}

export async function getChannelList(bot: Bot) {
   for (const platform of (Object.keys(targetChannels) as ("galegotube" | "galegotwitch" | "podgalego")[])) {
      const channelName = Config[platform].discordChannelName;
      targetChannels[platform] = [];
      for (const guildId of DiscordBot.activeGuildIds) {
         const guild = await DiscordBot.helpers.getGuild(guildId);
         const targetChannel = guild.channels.find((c: Channel) => c.name === channelName);
         if (!targetChannel) {
            logger.warning(`Configuration problem! Guild ${guild.name} does not have a #${channelName} channel!`)
            sendMessageToDiscordOwner(bot, guild, `Ocurriu un erro ao configurar o bot, non atopo a canle #${channelName} no servidor ${guild.name}, engádea para recibir as notificacións de ${platform}.`);
         } else {
            const permissions = calculatePermissions(targetChannel.permissions as bigint);

            if (permissions.some((p: string) => p === 'SEND_MESSAGES')) {
               logger.info(`Member of server ${guild.name}, target channel is #${targetChannel.name}`)
               targetChannels[platform].push(targetChannel);
            } else {
               logger.warning(`Permission problem! I do not have SEND_MESSAGES permission on channel #${targetChannel.name} on ${guild.name}: announcement sends will fail.`)
               sendMessageToDiscordOwner(bot, guild, `Ocurriu un erro ao configurar o bot, comproba que ten os permisos de escritura na canle #${channelName} do servidor ${guild.name}.`);
            }
         }
      }
      logger.info(`Discovered ${targetChannels[platform].length} channels to announce to for ${channelName}.`)
   }
   return targetChannels;
}

async function sendMessageToDiscordOwner(bot: Bot, guild: Guild, content: string) {
   const userChannel = await getDmChannel(bot, guild.ownerId);
   sendMessage(bot, userChannel.id, { content })
}