import dotenv from 'dotenv'

import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export default {
  port: process.env.PORT,
  database_url: process.env.DB_URL,
  bcrypt_salt_round: process.env.BCRYPT_SALT_ROUNDS,
  default_pass: process.env.DEFAULT_PASS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  node_env: process.env.NODE_ENV,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
  // cloudenary image api
  api_secret: process.env.API_SECRET,
  api_key: process.env.API_KEY,
  cloud_name: process.env.CLOUD_NAME,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
}
