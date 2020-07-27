export interface ENVIRONMENT {
  NODE_ENV: string;
  DB_USER: string;
  DB_PASSWORD: string;
  FRONT_END_ORIGIN_URI: string;
  PORT: number;
}

import { config } from "dotenv";

const APP_ENV = (config().parsed as unknown) as ENVIRONMENT;

export default APP_ENV;
