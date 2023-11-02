import { app } from 'mu';
import fuzzySearch from './fuzzy-search/fuzzy-search';
import getAllAddresses from './address-check/address-check';
import { locationInFlandersSchema, municipalitiesQuerySchema, postalCodeQuerySchema, provinces, searchQuerySchema, europeanCountries } from './types';
import prettyError from './util/errors';
import getMunicipalitySuggestions from './municipalities/municipalities';
import getPostalCodeSuggestions from './postal-codes/postal-codes';

app.get('/search', async ( req, res ) => {
  const query = searchQuerySchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).send(prettyError(query.error));
    return;
  }
  try {
    res.send(await fuzzySearch(query.data.query));
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get('/verified-addresses', async (req, res)=>{
  const query = locationInFlandersSchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).send(prettyError(query.error));
    return;
  }
  try {
    res.send(await getAllAddresses(query.data));
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get('/municipalities', async (req,res)=>{
  const query = municipalitiesQuerySchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).send(prettyError(query.error));
    return;
  }
  try {
    res.send(await getMunicipalitySuggestions(query.data.postalCode,query.data.province))
  } catch (e) {
    res.status(500).send(e);
  }
})

app.get('/postal-codes', async (req,res)=> {
  const query = postalCodeQuerySchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).send(prettyError(query.error));
    return;
  }
  try {
    res.send(await getPostalCodeSuggestions(query.data.municipality,query.data.province))
  } catch (e) {
    res.status(500).send(e);
  }
})

app.get('/provinces', async (_req,res)=> {
    res.send(provinces);
})

app.get('/countries', async (_req,res)=>{
  res.send(europeanCountries);
})

