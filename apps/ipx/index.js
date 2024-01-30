import { listen } from "listhen";
import consola from "consola";
import { createApp, toNodeListener } from "h3";
import { createIPX, ipxHttpStorage, createIPXH3Handler } from "ipx";

const logger = consola.withTag("[IPX]");

const { IPX_HTTP_DOMAINS, IPX_HTTP_MAX_AGE } = process.env;

const allowedDomains = IPX_HTTP_DOMAINS
  ? IPX_HTTP_DOMAINS.split(",")
  : ["files.vandal.services"];

logger.info(`Iniciating...`);
logger.info(`Allowed domains:`, allowedDomains);

const ipx = createIPX({
  httpStorage: ipxHttpStorage({
    domains: allowedDomains,
    maxAge: IPX_HTTP_MAX_AGE,
  }),
});

logger.success(`Ready.`);

const app = createApp();

app.use("/", createIPXH3Handler(ipx));

listen(toNodeListener(app));
