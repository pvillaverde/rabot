import { moment } from "../deps.ts";
import { fetchJsonData } from "./utils.service.ts";
import { Config, Credentials } from "../config.ts";
import log from "./logger.service.ts";
import { DiscordEmbed } from "../deps.ts";
import { updateOrSendMessage } from "../bot/utils/helpers.ts";

const logger = log.getLogger('agendaService');

interface agendaField {
   title: string;
   events: string[];
}

export async function refreshAgenda() {
   if (!Config.axenda.enable) return;
   const fields: agendaField[] = [];
   const day = moment();
   while (moment(day).diff(moment(), 'days') < Config.axenda.days) {
      fields.push({
         title: moment(day).locale(Config.axenda.locale).format('dddd - D [de] MMMM'),
         events: await fetchEvents(day.toDate()),
      });
      day.add(1, 'day');
   }
   return await updateCalendar(fields);
}

/**
 * Recupera os eventos do calendario dun día concreto.
 * @param {Date} day O día do calendario do que vamos a recuperar os eventos.
 */
async function fetchEvents(day: Date) {
   try {
      const timeMin = moment(day).startOf('day').toISOString();
      const timeMax = moment(day).endOf('day').toISOString();
      const calendarQueryUrl = `https://www.googleapis.com/calendar/v3/calendars/${Config.axenda.calendarId}/events?orderBy=startTime&singleEvents=true&timeMax=${timeMax}&timeMin=${timeMin}&key=${Credentials.google.appKey}`
      const calendarJson = await fetchJsonData(calendarQueryUrl)
      const events = calendarJson.items;
      logger.debug(`Getting calendar for day: ${day}: ${JSON.stringify(events)}`)
      if (events.length) {
         const timeRangeEvents = events.map(
            (event: { summary: string, start: { dateTime: Date, date: Date } }) => `⬜ ${moment(event.start.dateTime || event.start.date).format('HH:mm')} | ${event.summary}`
         );
         return timeRangeEvents;
      } else {
         return [];
      }
   } catch (error) {
      logger.error(`Error while fetching calendar events`);
      logger.error(error);
   }
}

async function updateCalendar(fields: agendaField[]) {
   const calendarMessage: DiscordEmbed = {
      color: 0x9146ff,
      title: `Calendario`,
      url: `https://calendar.google.com/calendar/u/0/embed?src=${Config.axenda.calendarId}`,
      fields: fields.map(day => {
         return {
            name: day.title,
            value: day.events.map((e) => e.substring(2)).join('\n'),
         };
      })
   }
   calendarMessage.fields?.push({ name: 'Última actualización', value: moment().locale(Config.axenda.locale).format('yyyy-MM-DD HH:mm'), inline: true });
   const content = `Nesta axenda van actualizándose os horarios de Twitch das/dos @Twitcheiras .

   Se alguén con ese rol non sae ainda e quere facelo , pedidelle a un @Admins ou @XuntaDirectiva que vos pase a ligazón, logo poderedes engadirvos vos mesmas/os sen problema 👍 
   
   E para quen só quere engadir isto ao seu propio google calendar porque prefire lelo alí, tedes esta ligazón:
   👉  https://calendar.google.com/calendar/u/0?cid=Z2FsZWdvdHdpdGNoQGdtYWlsLmNvbQ`
   const message = { content, embeds: [calendarMessage] };
   try {
      await updateOrSendMessage(message as any, Config.axenda.discordChannelId, Config.axenda.discordChannelMessageId);
      logger.info(`Updated agenda Calendar`);
   } catch (error) {
      logger.error(`Error while updating calendar events`);
      logger.error(error);
   }
}