import { readLines } from "https://deno.land/std@0.78.0/io/mod.ts";
import moment from "https://deno.land/x/momentjs@2.29.1-deno/mod.ts";


const now = moment();
const errorLog = await Deno.open('./error.log');
for await (const line of readLines(errorLog))
{
   const error = JSON.parse(line);
   const timestamp = new Date(error.ts);
	if (now.diff(moment(timestamp), 'minutes') <= 5) {
		Deno.exit(1);
	} else {
		Deno.exit(0);
	}
}