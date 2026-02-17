import { redirect } from 'next/navigation';

// Redirect to the admin dashboard
export default function AdminPage() {
  redirect('/admin/dashboard');
}
