import { createBrowserRouter, Navigate, useLocation } from "react-router";
import { useAuth } from './context/AuthContext';
import { canAccess } from './roleAccess';
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Transactions from "./pages/Transactions";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";

function ProtectedPage({ path, children }: { path: string; children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  return canAccess(user?.role, path) ? <>{children}</> : <Navigate to="/" replace state={{ from: location.pathname }} />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <ProtectedPage path="/"><Dashboard /></ProtectedPage> },
      { path: "patients", element: <ProtectedPage path="/patients"><Patients /></ProtectedPage> },
      { path: "doctors", element: <ProtectedPage path="/doctors"><Doctors /></ProtectedPage> },
      { path: "appointments", element: <ProtectedPage path="/appointments"><Appointments /></ProtectedPage> },
      { path: "records", element: <ProtectedPage path="/records"><MedicalRecords /></ProtectedPage> },
      { path: "transactions", element: <ProtectedPage path="/transactions"><Transactions /></ProtectedPage> },
      { path: "inventory", element: <ProtectedPage path="/inventory"><Inventory /></ProtectedPage> },
      { path: "settings", element: <ProtectedPage path="/settings"><Settings /></ProtectedPage> },
    ],
  },
]);