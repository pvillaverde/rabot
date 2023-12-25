import { readLines, moment } from "./deps.ts";

const now = moment();
const healthcheckFile = await Deno.open('./healthcheck.txt');
for await (const line of readLines(healthcheckFile)) {
   if (!line.length) continue;
   const timestamp = new Date(line);
   // If there is no update on healthcheck file in the last 15 minutes, container is unhealthy.
   if (now.diff(moment(timestamp), 'minutes') >= 120) {
      Deno.exit(1);
   }
}
Deno.exit(0);