import { AuthProvider } from '../../services/auth';
import { AdminFeedbackProvider } from '../../components/admin/AdminFeedbackProvider';

export const metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminFeedbackProvider>{children}</AdminFeedbackProvider>
    </AuthProvider>
  );
}
