import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Transactions from "./pages/Transactions";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "patients", Component: Patients },
      { path: "doctors", Component: Doctors },
      { path: "appointments", Component: Appointments },
      { path: "records", Component: MedicalRecords },
      { path: "transactions", Component: Transactions },
      { path: "inventory", Component: Inventory },
      { path: "settings", Component: Settings },
    ],
  },
]);