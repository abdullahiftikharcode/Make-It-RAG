const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const billingRoutes = require('./routes/billing');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/billing', billingRoutes); 