# RABOT: Rede Automatizada de Barullo, Ondas e Transmisións

- [X] Feito en DENO en lugar de NODEjs
- [X] Tarefas de CRON que se executen cada minuto, cada 15 minutos, cada hora, cada día...
- [X] Cada 15 minutos ten que refrescar a información dende a páxina web, para que en caso de que haxa cambios, consulte ou deixe de consultar as canles pertinentes.
- [ ] Tanto para Youtube como para Podcast, non vale con que comprobe que sexa do último día. Ten que verificar tamén que sexa o derradeiro. Pode haber publicación retrasadas porque saen en privado/oculto.
- [ ] Librería para facer unha BBDD https://deno.land/x/aloedb@0.9.0
- [X] Servizo de publicación a Twitter e Mastodon, coa configuración segundo a comunidade (Twitch, Youtube, Podcast) e a posibilidade de desactivar cada servizo.
- [X] Configuración inicial do Bot de Discord: https://deno.land/x/discordeno@17.0.1
- [X] Configuración das canles de Discord correspondentes (galegotwitch, galegotube, podgalego) e envío de mensaxe na que corresponda.
- [X] Proba do envío de notificacións a twitter, mastodon e discord das actualizacións de GalegoTube. **Neste punto, poderíamos publicar o servizo e prescindir de Galtubot**
- [ ] Consulta cada hora do calendario de Google e actualización da mensaxe na canle #axenda do Discord. **Unha vez feito isto, podemos prescindir de Calengram**
- [ ] Consulta dos datos de Twitch cada minuto para ver que canles están en directo. Envío das notificacións a Twitter e Mastodon cando unha canle entra en directo.
- [ ] Envío e actualización das mensaxes de Discord cando hai canles en directo, incluíndo a miniatura da transmisión como fai actualmente **timbot**.

## Funcionalidades extra
- [ ] Os RSS de Podcast non permiten obter máis datos, pero cos de Youtube poderíamos gardar certas estatísticas, ao igual que se fai coas de Twitch. Poderíase facer o que fan os bots de estatísticas dende este.
- [ ] Creación dunha imaxe co calendario do día ou da semana para publicar nas redes
- [ ]
- [ ]
