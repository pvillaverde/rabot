import { createBot, Intents, startBot } from "https://deno.land/x/discordeno@13.0.0/mod.ts";
import { Credentials } from "../config.ts";
import log from "./logger.service.ts";


const logger = log.getLogger('discordService');
export const DiscordBot = createBot({
   token: Credentials.discord.token,
   intents: Intents.Guilds | Intents.GuildMessages,
   events: {
      ready() {
         logger.debug("Successfully connected to Discord Gateway");
      },
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