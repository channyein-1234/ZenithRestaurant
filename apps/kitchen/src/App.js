
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HistoryPage from "./history";
import KitchenDashboard from "./kitchenDashboard";
import ProtectedRoute from "./ProtectedRoute";
import LoginForm from "./loginform";


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
        {/* Login route */}
        <Route path="/" element={<LoginForm />} />

        {/* Protected routes */}
        <Route
          path="/kitchenDashboard"
          element={
            <ProtectedRoute>
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
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