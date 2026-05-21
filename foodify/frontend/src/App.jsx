import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import CustomerHomePage from "./pages/CustomerHomePage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import RestaurantDashboardPage from "./pages/RestaurantDashboardPage";
import FavoritesPage from "./pages/FavoritesPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminRestaurantsPage from "./pages/admin/AdminRestaurantsPage";
import AdminMenuPage from "./pages/admin/AdminMenuPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminDealsPage from "./pages/admin/AdminDealsPage";
import AdminTopShopsPage from "./pages/admin/AdminTopShopsPage";
import AdminHomeChefsPage from "./pages/admin/AdminHomeChefsPage";
import AdminBrandsPage from "./pages/admin/AdminBrandsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminRidersPage from "./pages/admin/AdminRidersPage";
import AdminOrderAssignPage from "./pages/admin/AdminOrderAssignPage";
import { useAuth } from "./context/AuthContext";
import OrderToastContainer from "./components/OrderToastContainer";
import "./admin.css";

const ProtectedRoute = ({ role, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;
  if (role && user.role !== role) return <Navigate to="/auth" replace />;
  return children;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/customer"
          element={
            <ProtectedRoute role="customer">
              <CustomerHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu/:restaurantId"
          element={
            <ProtectedRoute role="customer">
              <MenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute role="customer">
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute role="customer">
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation"
          element={
            <ProtectedRoute role="customer">
              <OrderConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute role="customer">
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/favourites"
          element={
            <ProtectedRoute role="customer">
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant"
          element={
            <ProtectedRoute role="restaurant">
              <RestaurantDashboardPage />
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/restaurants"
          element={
            <ProtectedRoute role="admin">
              <AdminRestaurantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute role="admin">
              <AdminMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute role="admin">
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/deals"
          element={
            <ProtectedRoute role="admin">
              <AdminDealsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/top-shops"
          element={
            <ProtectedRoute role="admin">
              <AdminTopShopsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/home-chefs"
          element={
            <ProtectedRoute role="admin">
              <AdminHomeChefsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/brands"
          element={
            <ProtectedRoute role="admin">
              <AdminBrandsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute role="admin">
              <AdminAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/riders"
          element={
            <ProtectedRoute role="admin">
              <AdminRidersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/order-assign"
          element={
            <ProtectedRoute role="admin">
              <AdminOrderAssignPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
      <OrderToastContainer />
    </>
  );
}

export default App;
