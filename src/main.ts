import { cron, everyMinute, every15Minute, hourly } from "./deps.ts";
import { refreshData } from "./acodega/mod.ts";
import { refreshYoutubeStats } from "./acodega/youtube.ts";
import startDiscordBot from "./bot/mod.ts";
import { refreshAgenda } from "./services/agenda.service.ts";
import log from "./services/logger.service.ts";
import { refreshClips, refreshFollowers, refreshGames, refreshStreams } from "./acodega/twitch.ts";

async function bootStrapApp() {
   const logger = log.getLogger();
   logger.info(`
    ----------------------------------
   |              RABOT               |
   |  Pablo Villaverde Castro © 2024  |
   |     Obradoiro Dixital Galego     |
    ----------------------------------
   `);
   // Refrescado inicial dos datos da web de Obradoiro Dixital Galego
   await Deno.writeTextFile("./healthcheck.txt", new Date().toISOString());
   await startDiscordBot();
   await refreshData();
   await refreshGames();

   everyMinute(() => {
      logger.debug("everyMinute cron")
      // Comprobar se hai canles emitindo en twitch, actualizar mensaxes de discord e enviar das demáis redes.
      new Promise((resolve,reject) => refreshStreams().then(resolve).catch(reject));
      new Promise((resolve,reject) => Deno.writeTextFile("./healthcheck.txt", new Date().toISOString()).then(resolve).catch(reject));
   });

   every15Minute(async () => {
      logger.debug("every15Minute cron");
      // Refrescar os datos de ObradoiroDixitalGalego, novos vídeos de YT, podcasts e usuarios de twitch
      await refreshData();
      // Se hai xogos pendentes, refrescar a lista
      await refreshGames()
   });

   hourly(async () => {
      logger.debug("hourly cron")
      // Actualizar axenda do Discord
      await refreshAgenda();

   });

   cron("5 16 * * *", async () => {
      logger.debug("Daily cron at 2:00")

      // Obter as estatísticas de GalegoTube unha vez o día.
      await refreshYoutubeStats();
      // Refrescar os seguidores de Twitch - Deshabilitado. Dende Agosto de 2023 xa non se pode sen permisos de moderador en cada canle. https://dev.twitch.tv/docs/api/reference/#get-channel-followers
      //await refreshFollowers();
      // Refrescar os clips de Twitch
      await refreshClips();
      // Crear unha imaxe diaria cos datos que haxa no calendario.
   });

   cron("0 5 * * *", () => {
      logger.debug("Daily cron at 5:00")
      // Crear unha imaxe diaria cos datos que haxa no calendario.

   });
}
bootStrapApp();
