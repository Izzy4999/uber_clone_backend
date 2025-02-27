import { config } from "dotenv";
import { cleanEnv, port, str } from "envalid";

config();
const env = cleanEnv(process.env, {
  PORT: port(),
//   SECRET_KEY: str(),
//   CLOUD_NAME: str(),
//   CLOUD_API_KEY: str(),
//   CLOUD_API_SECRET_KEY: str(),
//   SMTP_HOST: str(),
//   SMTP_PORT: port(),
//   SMTP_MAIL: str(),
//   SMTP_PASSWORD: str(),
//   SMTP_SERVICE: str(),
  ACCESS_TOKEN: str(),
  ACCESS_TOKEN_EXPIRE: str(),
  REFRESH_TOKEN: str(),
  REFRESH_TOKEN_EXPIRE: str(),
//   KEY: str(),
//   ALGORITHM: str(),
});

export default env;
