import { DataTypes, Model, moment } from "../deps.ts";
import { logger, BaseChannelData } from "./mod.ts";
import { publish } from "../services/publish.service.ts";
import { fetchJsonData, getFeedData } from "../services/utils.service.ts";

export class BlogSite extends Model {
   static table = 'blog_sites';
   static timestamps = true; // adds created_at and updated_at fields

   static fields = {
      rss: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
      site_name: DataTypes.STRING,
      site_date: DataTypes.DATETIME,
      type: DataTypes.STRING,
      twitter: { type: DataTypes.STRING, allowNull: true },
      mastodon: { type: DataTypes.STRING, allowNull: true },
      last_entry_date: { type: DataTypes.DATETIME, allowNull: true },
      last_entry_title: { type: DataTypes.STRING, allowNull: true },
      last_entry_link: { type: DataTypes.STRING, allowNull: true },
   };

   static defaults = {
      type: "blogomillo",
   };
}

export interface BlogSiteData extends BaseChannelData {
   type: 'blogomillo';
   rss: string;
}


/** Refresca os datos de youtube e comproba o último vídeo da canle. */
export async function refreshBlog() {
   const updateSites: BlogSiteData[] = await fetchJsonData('https://obradoirodixitalgalego.gal/api/blogomillo.json');
   // Recorre cada canle e obtén o seu último vídeo
   logger.debug(`START: Refreshing ${updateSites.length} blog sites`);
   for (const site of updateSites) {
      try {
         // Obtemos a información do RSS
         const feedData = await getFeedData(site.rss, "rss");
         if (feedData && feedData.item && feedData.item.length) {
            site.type = "blogomillo";
            site.lastFeedEntry = {
               title: feedData.item[0].title,
               published: new Date(feedData.item[0].pubDate),
               link: feedData.item[0].link,
            }
         }
         // Buscamos se existe xa na BBDD e en caso contrario creámolo.
         let currentSite = await BlogSite.find(site.rss)
         if (!currentSite) {
            currentSite = new BlogSite();
            currentSite.rss = site.rss;
            currentSite.site_name = site.title;
            currentSite.site_date = site.lastFeedEntry?.published as Date;
            currentSite.twitter = site.twitter as string;
            currentSite.mastodon = site.mastodon as string;
            await currentSite.save();
         }
         // Se ten último blog e é distinto do último que recuperou RABOT, publica nas canles que toque.
         if (site.lastFeedEntry && site.lastFeedEntry.link && currentSite.last_entry_link != site.lastFeedEntry.link) {
            // Doble verificación para evitar un spam de que o blog é da última hora.
            const isLessThanHourAgo = moment().diff(site.lastFeedEntry.published, 'hours') < 1;
            // Triple verificación, comprobar que o blog sexa posterior o blog anterior.
            const isAfterLastVideo = moment(site.lastFeedEntry.published).isAfter(moment(currentSite.last_entry_date as string));
            if (isLessThanHourAgo && (isAfterLastVideo || !currentSite.last_entry_date)) {
               currentSite.last_entry_date = site.lastFeedEntry?.published as Date;
               currentSite.last_entry_title = site.lastFeedEntry?.title as string;
               currentSite.last_entry_link = site.lastFeedEntry?.link as string;
               publish(site);
            }
         }
         currentSite.site_name = site.title;
         currentSite.twitter = site.twitter as string;
         currentSite.mastodon = site.mastodon as string;
         await currentSite.update();
         logger.debug(currentSite);
      } catch (error) {
         logger.critical(`Erro ao actualizar o blogue ${site.title}`);
         logger.critical(error);
      }
   }
   logger.info(`Refreshed ${updateSites.length} blog sites with their last entry`);
   return true;
}