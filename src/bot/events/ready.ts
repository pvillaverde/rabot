import { events } from "./mod.ts";
import { logger } from "../mod.ts";

events.ready = () => {
   logger.debug("Successfully connected to Discord Gateway");
}
events.debug = (args) => {
   logger.debug(args)
}