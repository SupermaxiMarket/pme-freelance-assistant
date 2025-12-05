// backend/src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
// const clientRoutes = require('./clients');
// const documentRoutes = require('./documents');
// const taskRoutes = require('./tasks');
// const paymentRoutes = require('./payments');
// const dashboardRoutes = require('./dashboard');
// const aiRoutes = require('./ai');

// Définir les préfixes pour chaque groupe de routes
router.use('/auth', authRoutes);
// router.use('/clients', clientRoutes);
// router.use('/documents', documentRoutes);
// router.use('/tasks', taskRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/dashboard', dashboardRoutes);
// router.use('/ai', aiRoutes);

module.exports = router;
