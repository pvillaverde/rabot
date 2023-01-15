import moment from "npm:moment";
import { fetchJsonData } from "./utils.service.ts";
import { Config, Credentials } from "../config.ts";
import log from "./logger.service.ts";
import { DiscordEmbed } from "https://deno.land/x/discordeno@17.0.1/mod.ts";
import { updateOrSendMessage } from "../bot/utils/helpers.ts";

const logger = log.getLogger('agendaService');

interface agendaField {
   title: string;
   events: string[];
}

export async function refreshAgenda() {
   const fields: agendaField[] = [];
   const day = moment();
   while (moment(day).diff(moment(), 'days') < Config.axenda.days) {
      fields.push({
         title: moment(day).locale(Config.axenda.locale).format('dddd - D [de] MMMM'),
         events: await fetchEvents(day.toDate()),
      });
      day.add(1, 'day');
   }
   updateCalendar(fields);
}

/**
 * Recupera os eventos entre un intervalo de datas concreto.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function fetchEvents(day: Date) {
   try {
      logger.debug(`Getting calendar for day: ${day}`)
      const timeMin = moment(day).startOf('day').toISOString();
      const timeMax = moment(day).endOf('day').toISOString();
      const calendarQueryUrl = `https://www.googleapis.com/calendar/v3/calendars/${Config.axenda.calendarId}/events?orderBy=startTime&singleEvents=true&timeMax=${timeMax}&timeMin=${timeMin}&key=${Credentials.google.appKey}`
      logger.info(calendarQueryUrl);
      const calendarJson = await fetchJsonData(calendarQueryUrl)
      logger.debug(calendarJson);
      const events = calendarJson.items;
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
   logger.info(`Updating agenda Calendar`);
   // Se xa está publicada a mensaxe, facemos un patch. En caso contrario un post e gardamos a ID da mensaxe.
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
   const message = { embeds: [calendarMessage] };
   await updateOrSendMessage(message as any, Config.axenda.discordChannelId, Config.axenda.discordChannelMessageId);
}