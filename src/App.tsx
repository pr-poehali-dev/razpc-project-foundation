import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import EditorBar from "./components/editor/EditorBar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import BuildDetail from "./pages/BuildDetail";
import Configurator from "./pages/Configurator";
import Works from "./pages/Works";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Reviews from "./pages/Reviews";
import Contacts from "./pages/Contacts";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import UiKit from "./pages/UiKit";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCatalog from "./pages/admin/AdminCatalog";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminWarehouse from "./pages/admin/AdminWarehouse";
import AdminWarehouseItems from "./pages/admin/AdminWarehouseItems";
import AdminWarehouseModel from "./pages/admin/AdminWarehouseModel";
import AdminWarehouseUnits from "./pages/admin/AdminWarehouseUnits";
import AdminWarehouseUnit from "./pages/admin/AdminWarehouseUnit";
import AdminWarehouseReceive from "./pages/admin/AdminWarehouseReceive";
import AdminWarehouseLots from "./pages/admin/AdminWarehouseLots";
import AdminWarehouseLot from "./pages/admin/AdminWarehouseLot";
import AdminWarehouseMachines from "./pages/admin/AdminWarehouseMachines";
import AdminWarehouseBuild from "./pages/admin/AdminWarehouseBuild";
import AdminWarehouseMachine from "./pages/admin/AdminWarehouseMachine";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminDebts from "./pages/admin/AdminDebts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ContentProvider>
          <EditorBar />
          <Routes>
            {/* Публичный сайт */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/:slug" element={<BuildDetail />} />
              <Route path="/configurator" element={<Configurator />} />
              <Route path="/works" element={<Works />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/ui-kit" element={<UiKit />} />
            </Route>

            {/* Админ-панель */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin", "manager", "builder", "moderator"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="catalog"
                element={
                  <ProtectedRoute roles={["admin", "builder"]}>
                    <AdminCatalog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="leads"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminLeads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="customers"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminCustomers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="analytics"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="warehouse"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminWarehouse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="warehouse/items"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminWarehouseItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="warehouse/models/:id"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminWarehouseModel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="warehouse/units"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminWarehouseUnits />
                  </ProtectedRoute>
                }
              />
              <Route
                path="warehouse/units/:id"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminWarehouseUnit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="warehouse/receive"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminWarehouseReceive />
                  </ProtectedRoute>
                }
              />
              <Route
                path="warehouse/lots"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminWarehouseLots />
                  </ProtectedRoute>
                }
              />
              <Route
                path="warehouse/lots/:id"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminWarehouseLot />
                  </ProtectedRoute>
                }
              />
              <Route
                path="warehouse/machines"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminWarehouseMachines />
                  </ProtectedRoute>
                }
              />
              <Route
                path="warehouse/build"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminWarehouseBuild />
                  </ProtectedRoute>
                }
              />
              <Route
                path="warehouse/machines/:id"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminWarehouseMachine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="finance"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminFinance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="debts"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <AdminDebts />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ContentProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;