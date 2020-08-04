export interface ENVIRONMENT {
  NODE_ENV: string;
  DB_CONNECTION_STRING: string;
  FRONT_END_ORIGIN_URI: string;
  PORT: number;
}

import { config } from "dotenv";

const APP_ENV = (config().parsed as unknown) as ENVIRONMENT;

export default APP_ENV;
