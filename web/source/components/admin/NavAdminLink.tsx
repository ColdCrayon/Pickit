import { Link } from "react-router-dom";
export default function NavAdminLink() {
  return (
    <Link
      className="hidden sm:inline-flex px-6 py-2.5 bg-gray-700/80 text-white font-bold rounded-xl hover:bg-gray-600/80"
      to="/admin"
    >
      ADMIN
    </Link>
  );
}
