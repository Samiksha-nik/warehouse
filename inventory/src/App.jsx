import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Sidebar from './component/Sidebar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardOverview from './pages/DashboardOverview';
import Header from './component/Header';

// Master Pages - Company & Location
import CountryMaster from './pages/masters/company-location/CountryMaster';
import StateMaster from './pages/masters/company-location/StateMaster';
import CityMaster from './pages/masters/company-location/CityMaster';
import CompanyMaster from './pages/masters/company-location/CompanyMaster';
import LocationMaster from './pages/masters/company-location/LocationMaster';
import AddressMaster from './pages/masters/company-location/AddressMaster';

// Master Pages - Account Management
import CustomerMaster from './pages/masters/account-management/CustomerMaster';
import SupplierMaster from './pages/masters/account-management/SupplierMaster';

// Master Pages - Inventory Management
import UnitMaster from './pages/masters/inventory-management/UnitMaster';
import GradeMaster from './pages/masters/inventory-management/GradeMaster';
import HSNMaster from './pages/masters/inventory-management/HSNMaster';
import CategoryMaster from './pages/masters/inventory-management/CategoryMaster';
import SubCategoryMaster from './pages/masters/inventory-management/SubCategoryMaster';

// Master Pages - Product Management
import ProductMaster from './pages/masters/inventory-management/product-management/ProductMaster';
import ProductMasterOnline from './pages/masters/inventory-management/product-management/ProductMasterOnline';
import RawMaterialMaster from './pages/masters/inventory-management/product-management/RawMaterialMaster';

// Operations
import LabelGenerator from './pages/operations/LabelGenerator';
import AssignInventory from './pages/operations/AssignInventory';
import StockTransfer from './pages/operations/StockTransfer';
import Dispatch from './pages/operations/Dispatch';
import ReturnRefund from './pages/operations/ReturnRefund';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<DashboardOverview />} />

            {/* Master Pages - Company & Location */}
            <Route path="/masters/company-location/country" element={<CountryMaster />} />
            <Route path="/masters/company-location/state" element={<StateMaster />} />
            <Route path="/masters/company-location/city" element={<CityMaster />} />
            <Route path="/masters/company-location/company" element={<CompanyMaster />} />
            <Route path="/masters/company-location/location" element={<LocationMaster />} />
            <Route path="/masters/company-location/address" element={<AddressMaster />} />

            {/* Master Pages - Account Management */}
            <Route path="/masters/account-management/customer" element={<CustomerMaster />} />
            <Route path="/masters/account-management/supplier" element={<SupplierMaster />} />

            {/* Master Pages - Inventory Management */}
            <Route path="/masters/inventory-management/unit" element={<UnitMaster />} />
            <Route path="/masters/inventory-management/grade" element={<GradeMaster />} />
            <Route path="/masters/inventory-management/hsn" element={<HSNMaster />} />
            <Route path="/masters/inventory-management/category" element={<CategoryMaster />} />
            <Route path="/masters/inventory-management/sub-category" element={<SubCategoryMaster />} />

            {/* Master Pages - Product Management */}
            <Route path="/masters/inventory-management/product-management/product" element={<ProductMaster />} />
            <Route path="/masters/inventory-management/product-management/product-online" element={<ProductMasterOnline />} />
            <Route path="/masters/inventory-management/product-management/raw-material" element={<RawMaterialMaster />} />

            {/* Operations */}
            <Route path="/label-generator" element={<LabelGenerator />} />
            <Route path="/assign-inventory" element={<AssignInventory />} />
            <Route path="/stock-transfer" element={<StockTransfer />} />
            <Route path="/dispatch" element={<Dispatch />} />
            <Route path="/operations/return-refund" element={<ReturnRefund />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
