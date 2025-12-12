import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import memoryscapeRoutes from './routes/memoryscapeRoutes';
import assessmentsRoutes from './routes/assessmentsRoutes';
import agitationRoutes from './routes/agitationRoutes';
import vitalsRoutes from './routes/vitalsRoutes';
import narrativeRoutes from './routes/narrativeRoutes';
import familyRoutes from './routes/familyRoutes';
import clinicianRoutes from './routes/clinicianRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json() as any);

// Routes
// Casting routes to any to avoid overload errors due to potential type mismatches in environment
app.use('/auth', authRoutes as any);
app.use('/patients', patientRoutes as any);
app.use('/memoryscape', memoryscapeRoutes as any);
app.use('/assessments', assessmentsRoutes as any);
app.use('/agitation', agitationRoutes as any);
app.use('/vitals', vitalsRoutes as any);
app.use('/', narrativeRoutes as any); 
app.use('/family', familyRoutes as any);
app.use('/clinician', clinicianRoutes as any);
app.use('/export', clinicianRoutes as any);

// Health check
app.get('/', (req, res) => {
  res.send('NeuroScan API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});