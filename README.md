> [!WARNING]\
> This project is deprecated and no longer maintained as of 2024-05-19. It has been replaced by the newer [RADIOD](https://github.com/pvillaverde/radio_dixital)

# RABOT - ACODG

## Rede Autómata de BOTs da A.C. Obradoiro Dixital Galego

Esta aplicación encárgase de obter a información das canles rexistradas na [Asociación Cultural Obradoiro Dixital Galego](https://obradoirodixitalgalego.gal) e dinfundir o novo contido que xeran estes proxectos en galego pola rede, a través das canlees da asociación (Twitter, Mastodon e Discord).

## Funcións (feitas e por desenvolver)

- [x] Feito en DENO en lugar de NODEjs
- [x] Tarefas de CRON que se executen cada minuto, cada 15 minutos, cada hora, cada día...
- [x] Cada 15 minutos ten que refrescar a información dende a páxina web, para que en caso de que haxa cambios, consulte ou deixe de consultar as canles pertinentes.
- [x] Tanto para Youtube como para Podcast, non vale con que comprobe que sexa do último día. Ten que verificar tamén que sexa o derradeiro. Pode haber publicación retrasadas porque saen en privado/oculto.
- [x] Utilizar a librería DenoDB para gardar os datos en BBDD (ven sexa Sqlite local ou conectar a PostgreSQL despois)
- [x] Servizo de publicación a Twitter e Mastodon, coa configuración segundo a comunidade (Twitch, Youtube, Podcast, Blogomillo) e a posibilidade de desactivar cada servizo.
- [x] Configuración inicial do Bot de Discord: https://deno.land/x/discordeno@17.0.1
- [x] Configuración das canles de Discord correspondentes (galegotwitch, galegotube, podgalego, blogomillo) e envío de mensaxe na que corresponda.
- [x] Proba do envío de notificacións a twitter, mastodon e discord das actualizacións de GalegoTube. **Neste punto, poderíamos publicar o servizo e prescindir de Galtubot**
- [x] Consulta cada hora do calendario de Google e actualización da mensaxe na canle #axenda do Discord. **Unha vez feito isto, podemos prescindir de Calengram**
- [x] Consulta dos datos de Twitch cada minuto para ver que canles están en directo. Envío das notificacións a Twitter e Mastodon cando unha canle entra en directo.
- [x] Envío e actualización das mensaxes de Discord cando hai canles en directo, incluíndo a miniatura da transmisión como fai actualmente **timbot**.

## Funcionalidades extra

- [x] Os RSS de Podcast non permiten obter máis datos, pero cos de Youtube poderíamos gardar certas estatísticas, ao igual que se fai coas de Twitch. Poderíase facer o que fan os bots de estatísticas dende este.
- [ ] Creación dunha imaxe co calendario do día ou da semana para publicar nas redes
- [x] Gardado das estatísticas de Youtube diariamente.
- [ ] Gardar nunha táboa da base de datos os servidores de Discord nos que está conectado. Con esta información pódese:
  - [ ] Configurar unha canle para cada tipo de contido, gardando a ID da canle na fila da base de datos.
  - [ ] Configurar unha canle para actualizar a axenda, podendo configurarse en distintos discord.
  - [ ] Comando de Axuda que indique o resto de comandos e que se poda combinar co resto de comandos para depurar problemas de permisos, nomes de canles, instrucións de como engadir no teu servidor, etc..
  - [ ] Comandos de administración para listar en que servidores está e opcionalmente sacalos deles?
  - [ ] Comando para configurar unha canle de clips onde se publiquen diariamente os clips. Sería interesante que en función das estrelas que reciban os clips, a partir de X Estrelas vaia a unha canle destacada.
