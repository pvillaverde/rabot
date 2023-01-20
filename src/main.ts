import { cron, everyMinute, every15Minute, hourly, daily } from "./deps.ts";
import { refreshData } from "./acodega/mod.ts";
import { refreshYoutubeStats } from "./acodega/youtube.ts";
import startDiscordBot from "./bot/mod.ts";
import { refreshAgenda } from "./services/agenda.service.ts";
import log from "./services/logger.service.ts";
import { refreshClips, refreshFollowers, refreshGames, refreshStreams, refreshTwitch } from "./acodega/twitch.ts";
import { fetchUsers } from "./services/twitch.service.ts";

async function bootStrapApp() {
   const logger = log.getLogger();
   logger.info(`
    ----------------------------------
   |              RABOT               |
   |  Pablo Villaverde Castro © 2023  |
   |     Obradoiro Dixital Galego     |
    ----------------------------------
   `);
   // Refrescado inicial dos datos da web de Obradoiro Dixital Galego
   await startDiscordBot();
   /* await refreshData(); */
   /* await refreshFollowers();
   await refreshClips(); */
   await refreshTwitch();
   await refreshStreams();
   await refreshGames();

   everyMinute(async () => {
      logger.debug("everyMinute cron")
      // Comprobar se hai canles emitindo en twitch
      await refreshStreams();

      // Actualizar as mensaxes de discord coas canles que estén emitindo

      // Se é o primeiro momento que se detecta a canle en activo, enviar publicación as RRSS
   });

   every15Minute(async () => {
      logger.debug("every15Minute cron")
      // Refrescar os datos de ObradoiroDixitalGalego
      await refreshData();
      // Comprobar se hai novos vídeos en Youtube

      // Comprobar se hai novos capítulos nos podcasts.
   });

   hourly(async () => {
      logger.debug("hourly cron")
      // Actualizar axenda do Discord
      await refreshAgenda();

   });

   daily(async () => {
      logger.debug("Daily cron at 1:00")

      //TODO: Obter as estatísticas de GalegoTube unha vez o día.
      await refreshYoutubeStats();
   })

   cron("5 0 0 * * *", () => {
      logger.debug("Daily cron at 5:00")
      // Crear unha imaxe diaria cos datos que haxa no calendario.

   });
}
bootStrapApp();