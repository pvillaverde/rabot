import { createBot, Intents, startBot, Channel, enableCachePlugin, enableCacheSweepers, enablePermissionsPlugin } from "../deps.ts";
import { Credentials } from "../config.ts";
import { events } from "./events/mod.ts";
import log from "../services/logger.service.ts";


export const logger = log.getLogger('discordService');
export const targetChannels = {
   galegotube: [] as Channel[],
   galegotwitch: [] as Channel[],
   podgalego: [] as Channel[],
}

import "./events/guildDelete.ts";
import "./events/ready.ts";
import "./events/mod.ts";
import "./events/guildCreate.ts";
/* const paths = ["./src/bot/events"];
await fastFileLoader(paths).catch((err) => {
   logger.critical(`Unable to Import ${paths}`);
   logger.critical(err);
   Deno.exit(1);
}); */
export const DiscordBot = enableCachePlugin(createBot({
   token: Credentials.discord.token,
   intents: Intents.Guilds | Intents.GuildMessages,
   events,
}));

enableCacheSweepers(DiscordBot);
enablePermissionsPlugin(DiscordBot);
// Another way to do events
/* DiscordBot.events.messageCreate = function (b, message) {
   // Process the message here with your command handler.
}; */
export default async function startDiscordBot() {
   logger.debug(`Starting Discord Bot`);
   await startBot(DiscordBot);
   return DiscordBot;
}