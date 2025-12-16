import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuPage from "./menuList";
import CartPage from "./cart";
import OrdersPage from "./orders";
import ProtectedRoute from "./ProtectedRoute";

function NotFound() {
  return (
    <div className="p-10 text-2xl font-bold text-red-500">
      404 - Page Not Found
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Menu page always accessible */}
        <Route path="/" element={<MenuPage />} />

        {/* Protected routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
