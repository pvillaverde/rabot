import { readLines, moment } from "./deps.ts";


const now = moment();
const errorLog = await Deno.open('./error.log');
for await (const line of readLines(errorLog)) {
   if (!line.length) continue;
   const error = JSON.parse(line);
   const timestamp = new Date(error.datetime);
   // if (now.diff(moment(timestamp), 'minutes') <= 60) {
   //    Deno.exit(1);
   // }
   // If there is any error, it's unhealthy. It should delete the error.log file when restarted.
   Deno.exit(1);
}
Deno.exit(0);