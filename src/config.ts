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
      client_id: string;
      project_id: string;
      auth_uri: string;
      token_uri: string;
      auth_provider_x509_cert_url: string;
      client_secret: string;
      redirect_uris: string[];
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
}
export const Credentials: Credentials = {
   google: JSON.parse(Deno.env.get("RABOT_GOOGLE_CREDENTIALS") as string),
   discord: JSON.parse(Deno.env.get("RABOT_DISCORD_CREDENTIALS") as string),
   twitch: JSON.parse(Deno.env.get("RABOT_TWITCH_CREDENTIALS") as string),
   galegotube: JSON.parse(Deno.env.get("RABOT_GALEGOTUBE_CREDENTIALS") as string),
   galegotwitch: JSON.parse(Deno.env.get("RABOT_GALEGOTWITCH_CREDENTIALS") as string),
   podgalego: JSON.parse(Deno.env.get("RABOT_PODGALEGO_CREDENTIALS") as string),
}
export const Config = {
   galegotube: {
      mastodon: false,
      twitter: false,
      discord: true,
      discordChannelName: "🟥youtube-galego",
      messageTemplate: '🤖🎬 {channelName}{mentionUser} acaba de publicar o vídeo "{title}" no #GalegoTube #Youtubeiras. Dálle unha ollada en\n{url}'
   },
   galegotwitch: {
      mastodon: false,
      twitter: false,
      discord: true,
      discordChannelName: "📡emitindo-twitch-galego",
      messageTemplate: '🤖📺 {channelName}{mentionUser} está agora en directo emitindo  "{title}" en #GalegoTwitch #TwitchEnGalego. Dálle unha ollada en\n{url}'
   },
   podgalego: {
      mastodon: false,
      twitter: false,
      discord: false,
      discordChannelName: "🎙️podgalego",
      messageTemplate: '🤖🎙️ {channelName}{mentionUser} acaba de publicar un nodo falangullo : "{title}" #PodGalego. Podes escoitalo en\n{url}'
   },
};