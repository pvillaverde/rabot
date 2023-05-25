interface MastodonCredentials {
   accessToken: string,
   url: string,
}

interface TwitterCredentials {
   appKey: string;
   appSecret: string;
   accessToken: string;
   accessSecret: string;
}

interface Credentials {
   google: {
      appKey: string;
   };
   discord: {
      token: string;
   };
   twitch: {
      client_id: string;
      client_secret: string;
   };
   galegotube: {
      twitter: TwitterCredentials;
      mastodon: MastodonCredentials;
   };
   galegotwitch: {
      twitter: TwitterCredentials;
      mastodon: MastodonCredentials;
   };
   podgalego: {
      twitter: TwitterCredentials;
      mastodon: MastodonCredentials;
   };
   postgresql?: {
      host: string;
      username: string;
      password: string;
      database: string;
   }
}
export const Credentials: Credentials = {
   google: JSON.parse(Deno.env.get("RABOT_GOOGLE_CREDENTIALS") as string),
   discord: JSON.parse(Deno.env.get("RABOT_DISCORD_CREDENTIALS") as string),
   twitch: JSON.parse(Deno.env.get("RABOT_TWITCH_CREDENTIALS") as string),
   galegotube: JSON.parse(Deno.env.get("RABOT_GALEGOTUBE_CREDENTIALS") as string),
   galegotwitch: JSON.parse(Deno.env.get("RABOT_GALEGOTWITCH_CREDENTIALS") as string),
   podgalego: JSON.parse(Deno.env.get("RABOT_PODGALEGO_CREDENTIALS") as string),
   postgresql: JSON.parse(Deno.env.get("RABOT_POSTGRESQL_CREDENTIALS") as string),
}
export const Config = {
   logger: {
      ConsoleLogLevel: Deno.env.get("RABOT_CONSOLE_LOG_LEVEL") as "NOTSET" | "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL",
   },
   axenda: {
      enable: true,
      calendarId: "galegotwitch@gmail.com",
      discordChannelId: "777124459400134666",
      discordChannelMessageId: "983067688555397120",
      locale: 'gl',
      days: 4,
   },
   galegotube: {
      mastodon: true,
      twitter: true,
      discord: true,
      discordChannelName: "🟥youtube-galego",
      messageTemplate: '🤖🎬 {channelName}{mentionUser} acaba de publicar o vídeo "{title}" no #GalegoTube #Youtubeiras. Dálle unha ollada en\n{url}'
   },
   galegotwitch: {
      mastodon: true,
      twitter: true,
      discord: true,
      discordChannelName: "📡emitindo-twitch-galego",
      messageTemplate: '🤖📺 {channelName}{mentionUser} está agora en directo emitindo "{title}" en #GalegoTwitch #TwitchEnGalego. Dálle unha ollada en\n{url}'
   },
   podgalego: {
      mastodon: true,
      twitter: false,
      discord: true,
      discordChannelName: "🔊podgalego",
      messageTemplate: '🤖🔊 {channelName}{mentionUser} acaba de publicar un novo falangullo : "{title}" #PodGalego. Podes escoitalo en\n{url}'
   },
};