import { readLines, moment } from "./deps.ts";


const now = moment();
const errorLog = await Deno.open('./error.log');
for await (const line of readLines(errorLog)) {
   if (!line.length) continue;
   const error = JSON.parse(line);
   const timestamp = new Date(error.ts);
   if (now.diff(moment(timestamp), 'minutes') <= 5) {
      Deno.exit(1);
   }
}
Deno.exit(0);