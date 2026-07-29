import { AuthProvider } from '../../services/auth';

export default function AdminLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
