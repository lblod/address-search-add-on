import { app } from 'mu';

import prettyError from './util/errors';
import fuzzySearch from './fuzzy-search';
import { locationInFlandersSchema } from './types/api-schemas';
import getAllVerifiedAddresses from './address-check';
import { postalCodesQuerySchema, postalNamesQuerySchema, provinceQuerySchema, searchQuerySchema } from './types';
import { getPostalCodes, getPostalNames, getProvinces, initializeStore } from './store';
import cors, { CorsOptions } from 'cors';
import { europeanCountries } from './types/constants';

const corsOptions: CorsOptions   = {
  origin: ['http://localhost:4200','http://localhost:9300'],
  methods: ['GET'],
  optionsSuccessStatus: 200,
}

initializeStore().then(()=>{
  app.use(cors(corsOptions));
  app.get('/search', async ( req, res ) => {
    const query = searchQuerySchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).send(`Client error: illegal query parameters. Parsing result:\n${prettyError(query.error)}`);
      return;
    }
    try {
      res.send(await fuzzySearch(query.data.query));
    } catch (e) {
      console.log(`Error when querying fuzzy search:\n${e}`);
      res.status(500).send(e);
    }
  });
  
  app.get('/verified-addresses', async (req, res)=>{
    const query = locationInFlandersSchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).send(`Client error: illegal query parameters. Parsing result:\n${prettyError(query.error)}`);
      return;
    }
    try {
      res.send(await getAllVerifiedAddresses(query.data));
    } catch (e) {
      console.log(`Error when querying basisregisters to verify address:\n${e}`);
      res.status(500).send(e);
    }
  });

  app.get('/postal-names', async (req,res)=>{
    const query = postalNamesQuerySchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).send(`Client error: illegal query parameters. Parsing result:\n${prettyError(query.error)}`);
      return;
    }
    try {
      res.send(getPostalNames(query.data.postalCode, query.data.province));
    } catch (e) {
      console.log(`Error when filtering postal names:\n${e}`);
      res.status(500).send(e);
    }
  });

  app.get('/postal-codes', async (req,res)=>{ 
    const query = postalCodesQuerySchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).send(`Client error: illegal query parameters. Parsing result:\n${prettyError(query.error)}`);
      return;
    }
    try {
      res.send(getPostalCodes(query.data.postalName,query.data.province));
    } catch (e) {
      console.log(`Error when filtering postal codes:\n${e}`);
      res.status(500).send(e);
    }
  });

  app.get('/provinces', async (req,res)=>{
    const query = provinceQuerySchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).send(`Client error: illegal query parameters. Parsing result:\n${prettyError(query.error)}`);
      return;
    }
    try {
      res.send(getProvinces(query.data.postalCode,query.data.postalName));
    } catch (e) {
      console.log(`Error when filtering provinces:\n${e}`);
      res.status(500).send(e);
    }
  });

  app.get('/countries', async (_req,res)=>{
    res.send(europeanCountries);
  })

  console.log(`Server started. au-address-search component can be used now.`)
}).catch((err)=>{
  console.error('Failed to initialise store with error:');
  console.error(err);
  process.exit(-1);
});
