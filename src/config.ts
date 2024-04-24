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
   blogomillo: {
      twitter: TwitterCredentials;
      mastodon: MastodonCredentials;
   };
   postgresql?: {
      host: string;
      username: string;
      password: string;
      database: string;
   }
   mysql?: {
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
      charset: string; // utf8mb4
   }
}
export const Credentials: Credentials = {
   google: JSON.parse(Deno.env.get("RABOT_GOOGLE_CREDENTIALS") as string),
   discord: JSON.parse(Deno.env.get("RABOT_DISCORD_CREDENTIALS") as string),
   twitch: JSON.parse(Deno.env.get("RABOT_TWITCH_CREDENTIALS") as string),
   galegotube: JSON.parse(Deno.env.get("RABOT_GALEGOTUBE_CREDENTIALS") as string),
   galegotwitch: JSON.parse(Deno.env.get("RABOT_GALEGOTWITCH_CREDENTIALS") as string),
   podgalego: JSON.parse(Deno.env.get("RABOT_PODGALEGO_CREDENTIALS") as string),
   blogomillo: JSON.parse(Deno.env.get("RABOT_BLOGOMILLO_CREDENTIALS") as string),
   postgresql: JSON.parse(Deno.env.get("RABOT_POSTGRESQL_CREDENTIALS") as string),
   mysql: JSON.parse(Deno.env.get("RABOT_MYSQL_CREDENTIALS") as string),
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
      messageTemplate: '🤖🎬 {channelName}{mentionUser} acaba de publicar o vídeo "{title}". Dálle unha ollada en\n{url} #GalegoTube #Youtubeiras #ObradoiroDixital'
   },
   galegotwitch: {
      mastodon: true,
      twitter: true,
      discord: true,
      discordChannelName: "📡emitindo-twitch-galego",
      messageTemplate: '🤖📺 {channelName}{mentionUser} está agora en directo emitindo "{title}". Dálle unha ollada en\n{url} #GalegoTwitch #TwitchEnGalego #ObradoiroDixital'
   },
   podgalego: {
      mastodon: true,
      twitter: false,
      discord: true,
      discordChannelName: "🔊podgalego",
      messageTemplate: '🤖🔊 {channelName}{mentionUser} acaba de publicar un novo falangullo : "{title}". Podes escoitalo en\n{url} #PodGalego #ObradoiroDixital'
   },
   blogomillo: {
      mastodon: true,
      twitter: true,
      discord: true,
      discordChannelName: "🌽blogomillo",
      messageTemplate: '🤖🌽 {channelName}{mentionUser} acaba de publicar unha nova entrada no blogomillo : "{title}". Podes leela en\n{url} #Blogomillo #ObradoiroDixital'
   },
};