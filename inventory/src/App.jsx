import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Sidebar from './component/Sidebar';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardOverview from './pages/DashboardOverview';
import Header from './component/Header';
import axios from 'axios';
import Login from './pages/Auth/Login';
import Logout from './pages/Auth/Logout';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

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
import AssignInventory from './pages/operations/AssignInventory';
import StockTransfer from './pages/operations/StockTransfer';
import Dispatch from './pages/operations/Dispatch';
import ReturnRefund from './pages/operations/ReturnRefund';
import Label from './pages/operations/Label';
import Order from './pages/operations/order-management/Order';
import OrderApproval from './pages/operations/order-management/OrderApproval';

// Reports
import StockReport from './pages/reports/stockReport';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
        <Header />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
                      <DashboardOverview />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />

          {/* Other Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <DashboardOverview />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/company-location/country"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <CountryMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/company-location/state"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <StateMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/company-location/city"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <CityMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/company-location/company"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <CompanyMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/company-location/location"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <LocationMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/company-location/address"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <AddressMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/account-management/customer"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <CustomerMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/account-management/supplier"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <SupplierMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/inventory-management/unit"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <UnitMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/inventory-management/grade"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <GradeMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/inventory-management/hsn"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <HSNMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/inventory-management/category"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <CategoryMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/inventory-management/sub-category"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <SubCategoryMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/inventory-management/product-management/product"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <ProductMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/inventory-management/product-management/product-online"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <ProductMasterOnline />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/inventory-management/product-management/raw-material"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <RawMaterialMaster />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assign-inventory"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <AssignInventory />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-transfer"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <StockTransfer />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispatch"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <Dispatch />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/return-refund"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <ReturnRefund />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/order"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <Order />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-approval"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <OrderApproval />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/stock-report"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <StockReport />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/label"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                      <Label />
                    </main>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          </Routes>
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </BrowserRouter>
  );
}

export default App;