import { sendMessage, editMessage, BigString, EditMessage, CreateMessage } from "../../deps.ts";
import { DiscordBot, logger, targetChannels } from "../mod.ts";

export async function sendMessageToDiscordChannels(platform: "galegotube" | "galegotwitch" | "podgalego", content: string) {
   for (const channel of targetChannels[platform]) {
      await sendMessage(DiscordBot, channel.id, { content });
   }
   return;
}

export async function updateOrSendMessage(message: CreateMessage | EditMessage, channelId: BigString, messageId?: BigString) {
   if (messageId) {
      try {
         await editMessage(DiscordBot, channelId, messageId, message as EditMessage);
      } catch (error) {
         logger.error(`Couldn't edit message ${messageId}.`)
         logger.error(error);
      }
   } else {
      try {
         await sendMessage(DiscordBot, channelId, message as CreateMessage);
      } catch (error) {
         logger.error(`Couldn't send message ${messageId}.`)
         logger.error(error);
      }
   }
   return;
}