import { events } from "./mod.ts";
import { DiscordBot, logger } from "../mod.ts";

events.guildDelete = async (_bot, guildId) => {
   const guild = await DiscordBot.helpers.getGuild(guildId);
   logger.info(`Removed from a server: ${guild.name}`)
}