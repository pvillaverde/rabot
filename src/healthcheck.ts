import { readLines, moment } from "./deps.ts";


const now = moment();
const errorLog = await Deno.open('./error.log');
for await (const line of readLines(errorLog)) {
   const error = JSON.parse(line);
   const timestamp = new Date(error.ts);
   if (now.diff(moment(timestamp), 'minutes') <= 5) {
      Deno.exit(1);
   } else {
      Deno.exit(0);
   }
}