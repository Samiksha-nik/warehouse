// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const qrRoutes = require('./routes/qrRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Use routes
app.use('/countries', countriesRouter);
app.use('/states', statesRouter);
app.use('/cities', citiesRouter);
app.use('/companies', companiesRouter);
app.use('/locations', locationsRouter);
app.use('/addresses', addressesRouter);
app.use('/customers', customersRouter);
app.use('/units', unitsRouter);
app.use('/grades', gradesRouter);
app.use('/hsn', hsnRouter);
app.use('/categories', categoriesRouter);
app.use('/sub-categories', subCategoriesRouter);
app.use('/products', productsRouter);
app.use('/products-online', productsOnlineRouter);
app.use('/raw-materials', rawMaterialsRouter);
app.use('/labels', labelsRouter);
app.use('/inventory', inventoryRouter);
app.use('/api/dispatch', dispatchRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/stock-transfers-inward', stockTransfersInwardRouter);

// Routes
app.use('/api/labels', labelsRouter);
app.use('/api/customers', require('./routes/customers'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/subCategories', require('./routes/subCategories'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/units', require('./routes/units'));
app.use('/api/hsn', require('./routes/hsn'));
app.use('/api/products', require('./routes/products'));
app.use('/api/productsonline', require('./routes/productsonline'));
app.use('/api/rawMaterials', require('./routes/rawMaterials'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/suppliers', require('./routes/suppliers'));

// Basic route (you'll add more routes later)
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(port, () => {
  console.log(Server is running on port: ${port});
});