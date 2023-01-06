import * as log from "https://deno.land/std@0.171.0/log/mod.ts";
// https://medium.com/deno-the-complete-reference/using-logger-in-deno-44c5b2372bf3
await log.setup({
   //define handlers
   handlers: {
      console: new log.handlers.ConsoleHandler("DEBUG", {
         formatter: "{datetime} [{loggerName}-{levelName}] {msg}"
      }),
      file: new log.handlers.RotatingFileHandler('ERROR', {
         filename: './error.log',
         maxBytes: 10485760,
         maxBackupCount: 5,
         formatter: rec => JSON.stringify({ region: rec.loggerName, ts: rec.datetime, level: rec.levelName, data: rec.msg })
      })
   },
   //assign handlers to loggers  
   loggers: {
      default: { level: "DEBUG", handlers: ["console", "file"], },
      acodegaService: { level: "DEBUG", handlers: ["console", "file"], },
      publishService: { level: "DEBUG", handlers: ["console", "file"], },
   },
});

export default log;