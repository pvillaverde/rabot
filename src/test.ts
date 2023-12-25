import { parse } from "./deps.ts";
/** Obtén o último elemento dun feed de RSS e quédase cos datos máis relevantes. */
export async function getFeedData(rssURL: string, feedType: "rss" | "youtube"): Promise<undefined | any> {
   try {
      console.log(1)
      const response = await fetch(rssURL);
      if (response.status !== 200) {
         throw response.statusText;
      }
      console.log(2, response)
      const xml = await response.text();
      console.log(3, xml)
      const json = parse(xml) as any;
      console.log(4, json)
      if (feedType == "rss" && json.rss && json.rss.channel) {
         return json.rss.channel;
      } else if (feedType == "youtube" && json.feed) {
         return json.feed;
      } else {
         throw json;
      }
      console.log(5)
   } catch (error) {
      console.log(`No valid RSS feed for ${rssURL}`)
      console.log(error);
      return undefined;
   }
}
async function test() {
   const channel_uuid = "UCrOJBRzSq9NyOOD37PaGrDg"
   /* fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel_uuid}`).then(console.log).catch(console.error); */
   // Obtemos a información do RSS
   const feedData = await getFeedData(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel_uuid}`, `youtube`);
   console.log(feedData);
}
test();
Deno.exit(0)