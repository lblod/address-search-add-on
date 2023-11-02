import { ZodError } from 'zod';
import {  generateErrorMessage } from 'zod-error';


export default function prettyError(e: ZodError):string {
  return generateErrorMessage(e.issues,{delimiter:{error:'\n'}});
}
