import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import { LandingPage } from "./pages/public/LandingPage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { GetStartedPage } from "./pages/public/GetStartedPage";

import { SearchPage } from "./pages/customer/SearchPage";
import { VehicleDetailsPage } from "./pages/customer/VehicleDetailsPage";
import { PaymentPage } from "./pages/customer/PaymentPage";
import { BookingHistoryPage } from "./pages/customer/BookingHistoryPage";
import { BookingDetailsPage } from "./pages/customer/BookingDetailsPage";
import { ProfilePage } from "./pages/customer/ProfilePage";
import { VerificationPage } from "./pages/customer/VerificationPage";

import { OwnerDashboardPage } from "./pages/owner/OwnerDashboardPage";
import { VehicleFormPage } from "./pages/owner/VehicleFormPage";
import { AvailabilityPage } from "./pages/owner/AvailabilityPage";
import { OwnerBookingsPage, OwnerEarningsPage } from "./pages/owner/OwnerBookingsEarningsPage";

import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { VerificationQueuePage } from "./pages/admin/VerificationQueuePage";
import { VehicleApprovalPage } from "./pages/admin/VehicleApprovalPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import {
  BookingMonitoringPage,
  PaymentMonitoringPage,
  DisputesPage,
} from "./pages/admin/AdminMonitoringPages";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/get-started" element={<GetStartedPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />

                {/* Customer */}
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute roles={["CUSTOMER"]}>
                      <BookingHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings/:id"
                  element={
                    <ProtectedRoute>
                      <BookingDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings/:id/pay"
                  element={
                    <ProtectedRoute roles={["CUSTOMER"]}>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/verification"
                  element={
                    <ProtectedRoute>
                      <VerificationPage />
                    </ProtectedRoute>
                  }
                />

                {/* Owner */}
                <Route
                  path="/owner"
                  element={
                    <ProtectedRoute roles={["OWNER"]}>
                      <OwnerDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/vehicles/new"
                  element={
                    <ProtectedRoute roles={["OWNER"]}>
                      <VehicleFormPage mode="create" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/vehicles/:id/edit"
                  element={
                    <ProtectedRoute roles={["OWNER"]}>
                      <VehicleFormPage mode="edit" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/vehicles/:id/availability"
                  element={
                    <ProtectedRoute roles={["OWNER"]}>
                      <AvailabilityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/bookings"
                  element={
                    <ProtectedRoute roles={["OWNER"]}>
                      <OwnerBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/earnings"
                  element={
                    <ProtectedRoute roles={["OWNER"]}>
                      <OwnerEarningsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/verifications"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <VerificationQueuePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/vehicles"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <VehicleApprovalPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <BookingMonitoringPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <PaymentMonitoringPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/disputes"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <DisputesPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
