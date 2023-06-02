// import { parse } from "https://deno.land/x/xml/mod.ts";

// const channel = {  }
// const rssFeedUrl = `https://anchor.fm/s/cdf6f338/podcast/rss`;
// const response = await fetch(rssFeedUrl);
// const xml = await response.text();
// const feedData = parse(xml).rss.channel;
// if (feedData && feedData.item && feedData.item.length) {
//    channel.type = "galegotube";
//    channel.published = feedData.published;
//    channel.lastFeedEntry = {
//       title: feedData.item[0].title,
//       published: new Date(feedData.item[0].pubDate),
//       link: feedData.item[0].link,
//    }
// }
// console.log(channel);

// const Library = require('twitter-api-v2');
// const TwitterApi = Library.TwitterApi
// import { TwitterApi } from 'npm:twitter-api-v2@1.13';
// const messageStatus = "test";
// const credentials = {
// };

// const twitter = new TwitterApi(credentials);
// twitter.v2.tweet(messageStatus).then(console.log).catch(console.error);

import * as https from 'node:https';
const options = {
   hostname: 'httpbin.org',
   port: 443,
   path: '/anything',
   method: 'POST',
   body: '{"text":"test"}',
 };

 const req = https.request(options, (res) => {
   console.log('statusCode:', res.statusCode);
   console.log('headers:', res.headers);

   res.on('data', (d) => {
     console.log(d);
   });
 });

 req.on('error', (e) => {
   console.error(e);
 });
 req.end();