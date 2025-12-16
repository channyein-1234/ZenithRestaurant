
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./dashboard";
import MenuList from "./menulist";
import LoginForm from "./loginform";
import ProtectedRoute from "./ProtectedRoute";
import AdminLogoPage from "./profile";

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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <MenuList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logo"
          element={
            <ProtectedRoute>
              < AdminLogoPage/>
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



// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AdminDashboard from "./dashboard";
// import MenuList from "./menulist";
// import LoginForm from "./loginform";
// import AdminLogoPage from "./profile";


// function NotFound() {
//   return (
//     <div className="p-10 text-2xl font-bold text-red-500">
//       404 - Page Not Found
//     </div>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Admin Dashboard Route */}
//         <Route path="/" element={<LoginForm />} />
//         <Route path="/dashboard" element={<AdminDashboard />} />
//         <Route path="/menu" element={<MenuList />} />
//         <Route path="/logo" element={<AdminLogoPage />} />




//         {/* 404 Page */}
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;