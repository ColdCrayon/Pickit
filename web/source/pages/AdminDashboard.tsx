// web/src/pages/AdminDashboard.tsx
import TicketForm from "../components/admin/TicketForm";
// If you want the helper styles, import once (optional):
import "../styles/admin.css";

export default function AdminDashboard() {
  return (
    <div className="page admin-page">
      <h1 className="page__title">Admin Dashboard</h1>
      <TicketForm />
    </div>
  );
}
