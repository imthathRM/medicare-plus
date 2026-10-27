import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import patientRoutes from './patientRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import admissionRoutes from './admissionRoutes.js';
import billingRoutes from './billingRoutes.js';
import pharmacyRoutes from './pharmacyRoutes.js';
import staffRoutes from './staffRoutes.js';
import reportRoutes from './reportRoutes.js';

const apiRouter = Router();

// Modular Route Mounts
apiRouter.use('/health', healthRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/doctors', doctorRoutes);
apiRouter.use('/departments', departmentRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/admissions', admissionRoutes);
apiRouter.use('/billing', billingRoutes);
apiRouter.use('/invoices', billingRoutes); // Canonical alias for invoices
apiRouter.use('/pharmacy', pharmacyRoutes);
apiRouter.use('/inventory', pharmacyRoutes); // Canonical alias for inventory
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/reports', reportRoutes);

export default apiRouter;
