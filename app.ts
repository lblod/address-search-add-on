import { app } from 'mu';
import fuzzySearch from './fuzzy-search/fuzzy-search';
import { z } from 'zod';
import getAllAddresses from './address-check/address-check';
import { locationInFlandersSchema } from './types';
import { generateErrorMessage } from 'zod-error';



//TODO finish zod check of query schema
const searchQuerySchema = z.object({
  query: z.string(),
});

app.get('/search', async ( req, res ) => {
  const query = searchQuerySchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).send(generateErrorMessage(query.error.issues));
    return;
  }
  res.send(await fuzzySearch(query.data.query));
});

app.get('/verified-address', async (req, res)=>{
  const query = locationInFlandersSchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).send(generateErrorMessage(query.error.issues));
    return;
  }
  res.send(await getAllAddresses(query.data));
});

app.get('/test', async (_req,res)=>{
  try {
    const addresses = await getAllAddresses({
      municipality:'Affligem',
      street:'Schaapschuur',
      housenumber: '1',
      postalCode: '1790'
    });
    res.status(200).send(addresses);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});
