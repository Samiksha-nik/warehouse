// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_super_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/inventoryDB',
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax'
  }
}));

// Debug middleware to log session info (remove in production)
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  next();
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// MongoDB Connection using environment variable
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventoryDB';

mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB database connection established successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Import routes
const countriesRouter = require('./routes/countries');
const statesRouter = require('./routes/states');
const citiesRouter = require('./routes/cities');
const companiesRouter = require('./routes/companies');
const locationsRouter = require('./routes/locations');
const addressesRouter = require('./routes/addressRoutes');
const customersRouter = require('./routes/customers');
const unitsRouter = require('./routes/units');
const gradesRouter = require('./routes/grades');
const hsnRouter = require('./routes/hsn');
const categoriesRouter = require('./routes/categories');
const subCategoriesRouter = require('./routes/subCategories');
const productsRouter = require('./routes/products');
const productsOnlineRouter = require('./routes/productsonline');
const rawMaterialsRouter = require('./routes/rawMaterials');
const labelsRouter = require('./routes/labels');
const inventoryRouter = require('./routes/inventory');
const dispatchRouter = require('./routes/dispatch');
const returnsRouter = require('./routes/returns');
const stockTransfersInwardRouter = require('./routes/stockTransfersInward');
const stockTransfersOutwardRouter = require('./routes/stockTransfersOutward');
const assignmentsRouter = require('./routes/assignments');
const suppliersRouter = require('./routes/suppliers');
const qrRoutes = require('./routes/qrRoutes');
const stockReportRouter = require('./routes/stockReport');
const authRouter = require('./routes/auth');

// Use routes with consistent /api prefix
app.use('/api/countries', countriesRouter);
app.use('/api/states', statesRouter);
app.use('/api/cities', citiesRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/customers', customersRouter);
app.use('/api/units', unitsRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/hsn', hsnRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/sub-categories', subCategoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/products-online', productsOnlineRouter);
app.use('/api/raw-materials', rawMaterialsRouter);
app.use('/api/labels', labelsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/dispatch', dispatchRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/stock-transfers-inward', stockTransfersInwardRouter);
app.use('/api/stock-transfers-outward', stockTransfersOutwardRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/qr', qrRoutes);
app.use('/api/stock-report', stockReportRouter);
app.use('/api/auth', authRouter);

// Basic route
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});