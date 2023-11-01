import { ZodError } from 'zod';
import {  generateErrorMessage } from 'zod-error';


export default function prettyError(e: ZodError) {
  return generateErrorMessage(e.issues,{delimiter:{error:'\n'}});
}
