import { events } from "./mod.ts";
import { DiscordBot, logger, targetChannels } from "../mod.ts";

events.guildDelete = async (_bot, guildId) => {
   const guild = await DiscordBot.helpers.getGuild(guildId);

   for (const platform of (Object.keys(targetChannels) as ("galegotube" | "galegotwitch" | "podgalego" | "blogomillo")[])) {
      targetChannels[platform] = targetChannels[platform].filter(c => c.guildId != guildId);
   }
   logger.info(`Removed from a server: ${guild.name}`)
}