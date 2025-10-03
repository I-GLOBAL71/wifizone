import { RouterOSAPI } from 'node-routeros';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MIKROTIK_HOST || !process.env.MIKROTIK_API_USER || !process.env.MIKROTIK_API_PASSWORD) {
    throw new Error("MikroTik environment variables are not set");
}

export const router = new RouterOSAPI({
  host: process.env.MIKROTIK_HOST,
  user: process.env.MIKROTIK_API_USER,
  password: process.env.MIKROTIK_API_PASSWORD,
});