import { sendMessage } from "../deps.ts";
import { DiscordBot, targetChannels } from "../mod.ts";

export async function sendMessageToDiscordChannels(platform: "galegotube" | "galegotwitch" | "podgalego", content: string) {
   for (const channel of targetChannels[platform]) {
      await sendMessage(DiscordBot, channel.id, { content });
   }
   return;
}