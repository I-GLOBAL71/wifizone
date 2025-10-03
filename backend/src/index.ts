import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import ambassadorRoutes from './routes/ambassador.routes';
import tariffRoutes from './routes/tariff.routes';
import webhookRoutes from './routes/webhook.routes';
import purchaseRoutes from './routes/purchase.routes';
import settingsRoutes from './routes/settings.routes';

dotenv.config();

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// --- API Endpoints ---
app.use('/api/ambassadors', ambassadorRoutes);
app.use('/api', tariffRoutes);
app.use('/api', webhookRoutes);
app.use('/api', purchaseRoutes);
app.use('/api', settingsRoutes);


// --- Server Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});