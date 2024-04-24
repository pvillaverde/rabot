const webhookUrl = Deno.env.get("WEBHOOK_URL") as string;

const embeds = [
   {
      title: "<:patria:804013150911332382>  **Asociación Cultural Obradoiro Dixital Galego**",
      description: `Ola! Dámosche a benvida ó *fogar do contido en galego na rede* <:patria:804013150911332382> .  Esta é unha comunidade que engloba a *Podgalego*, *Twitch en galego*, o *Blogomillo* e *Youtube en galego*. `,
      color: 0x26ABFF,
   },
   {
      title: ":closed_book:  **Normas**",
      description: `Coa fin de garantir a convivencia e bo funcionamento, pedímosche que aceptes as seguintes reglas se queres participar no servidor:

      **1. Respeto**: Non faltarllo a ninguén e, por suposto, nada de comentarios misóxinos, racistas, homófobos, etc  <:cancelado:777330962563596338>
      
      **2. Lingua:** O Galego é a lingua vehícular de comunicación no servidor <:patria:804013150911332382>
      
      **3. NSFW:** Non utilizar contido [NSFW](https://gl.wikipedia.org/wiki/NSFW) (avatares, nomes de usuario, alcumes, estados, imáxes, memes e discusións).
      
      **4.** Somos unha comunidade positiva, inclusiva e solidaria. Traballamos para compartir e desfrutar do contido en galego.
      
      Estas normas aplicaranse polo espíritu das mesmas, non polo sentido literal do anteriormente exposto. O servidor da **ACODG** basease nun sistema de ***advertencia -> silencio -> expulsión*** para xestionar as infraccións das normas.`,
      color: 0xFF0000,
   },
   {
      title: ":point_right_tone1:  Que vas atopar no noso servidor?",
      description: `Un punto de encontro con centos de persoas que producen ou apoian o contido en galego onde falar, colaborar e coñecer outra xente que axuda a espallar a lingua pola rede.

      Polo demáis, aquí tes unha pequena guía do que podes facer e atopar neste servidor:

      • Nas canles de <#796436639936544768> , <#776164735217172561> e <#802363333092966400> podes recibir avisos cando algunha canle da comunidade está en directo ou sube un novo vídeo ou podcast.

      • Na <#777124459400134666> tamén podes consultar os vindeiros directos que están programados. Se queres que tamén figuren aquí os teus, fainos chegar a consulta a través de <#1066824437439135805>.

      • Formas parte da asociación? Podes solicitar acceso as canles internas a través do fío fixado na canle de <#1066824437439135805> 

      • Fas contido en galego nas redes? Na mesma canle de <#1066824437439135805> atoparás outro fío fixado onde podes solicitar os roles de <@&802364122637271071> , <@&772546744008835092> ou <@&802365200942235678> 

      • Na canle de <#807659864565481477>, compártense servidores de Discord de comunidades amigas. Se queres engadir o teu, abre un fío en <#1066824437439135805>  solicitándoo.

      • Se queredes compartir anuncios de eventos, programas especiais ou ou facer algún tipo de “spam”, pedímosvos que o fagades a través da canle <#833754648430116914> 

      • Se tendes dúbidas, suxestións ou calquera consulta para os <@&790974974487298048> , abre un fío en <#1066824437439135805> e responderémosche axiña!

      • <#776176411912044564> é a canle principal de texto de interacción da comunidade e <#919656368850468944> máis específica para temática de videoxogos, onde tamén se publican avisos de xogos que estén de balde.
      
      Explórao, participa e agardamos que desfrutes do servidor e axudes a espallar o contido en galego na rede!`,
      color: 0xFFD700,
   },
   {
      title: ":innocent: Asóciate!",
      description: `Para manter, mellorar e expandir o proxecto, podes constribuír co tecido asociativo [afiliandote](https://obradoirodixitalgalego.gal/asociate) a Asociación Cultural Obradoiro Dixital Galego.

      Podes consultar máis información sobre as vantaxes e as cotas de socio na nosa páxina web
      
      https://obradoirodixitalgalego.gal`,
      color: 0x26ABFF,
   },
   {
      title: ":busts_in_silhouette: Invitación ó servidor",
      description: `Se queres invitar a alguén a este servidor, podes utilizar esta ligazón: http://discord.gg/pTbpHp9zwE`,
      color: 0x26ABFF,
   },
];

const payload = {
   username: 'Obradoiro Dixital Galego',
   avatar_url: 'https://obradoirodixitalgalego.gal/acodega.png',
   embeds,
};

const response = await fetch(webhookUrl, {
   method: "POST",
   headers: {
      "Content-Type": "application/json",
   },
   body: JSON.stringify(payload),
});

if (response.ok) {
   console.log("Message sent successfully!");
} else {
   console.error("Failed to send message:", await response.text());
}
