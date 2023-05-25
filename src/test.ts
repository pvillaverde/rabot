import { parse } from "https://deno.land/x/xml/mod.ts";

const channel = {  }
const rssFeedUrl = `https://anchor.fm/s/cdf6f338/podcast/rss`;
const response = await fetch(rssFeedUrl);
const xml = await response.text();
const feedData = parse(xml).rss.channel;
if (feedData && feedData.item && feedData.item.length) {
   channel.type = "galegotube";
   channel.published = feedData.published;
   channel.lastFeedEntry = {
      title: feedData.item[0].title,
      published: new Date(feedData.item[0].pubDate),
      link: feedData.item[0].link,
   }
}
console.log(channel);