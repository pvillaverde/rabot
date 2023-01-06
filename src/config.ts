interface MastodonCredentials {
   access_token: string,
   timeout_ms: number,
   api_url: string,
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
      bot_token: string;
   };
   twitch: {
      bot_token: string;
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
   google: JSON.parse((Deno.env.get("RABOT_GOOGLE_CREDENTIALS") as string).trim()),
   discord: JSON.parse(Deno.env.get("RABOT_DISCORD_CREDENTIALS") as string),
   twitch: JSON.parse(Deno.env.get("RABOT_TWITCH_CREDENTIALS") as string),
   galegotube: JSON.parse(Deno.env.get("RABOT_GALEGOTUBE_CREDENTIALS") as string),
   galegotwitch: JSON.parse(Deno.env.get("RABOT_GALEGOTWITCH_CREDENTIALS") as string),
   podgalego: JSON.parse(Deno.env.get("RABOT_PODGALEGO_CREDENTIALS") as string),
}
console.log(Credentials);
export const Config = {
   
};
