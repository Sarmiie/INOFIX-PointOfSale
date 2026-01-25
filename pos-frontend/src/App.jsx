import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./components/layout/AdminLayout";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import CreateProductPage from "./pages/CreateProductPage";
import CreateCustomerPage from "./pages/CreateCustomerPage";
import EditProductPage from "./pages/EditProductPage";
import EditCustomerPage from "./pages/EditCustomerPage";
import TransactionDetail from "./pages/TransactionDetail";
import Transactions from "./pages/Transactions";
import POS from "./pages/Pos";
import { Toaster } from "react-hot-toast";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            style: {
              background: "#4ade80",
              color: "#ffffff",
            },
            iconTheme: {
              primary: "#ffffff",
              secondary: "#4ade80",
            },
          },
          error: {
            style: {
              background: "#f87171",
              color: "#ffffff",
            },
          },
        }}
      />
      ;
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/create" element={<CreateProductPage />} />
          <Route path="/products/edit/:id" element={<EditProductPage />} />

          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/create" element={<CreateCustomerPage />} />
          <Route path="/customers/edit/:id" element={<EditCustomerPage />} />

          <Route path="/pos" element={<POS />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
        </Route>

        {/* Catch all - redirect ke login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
