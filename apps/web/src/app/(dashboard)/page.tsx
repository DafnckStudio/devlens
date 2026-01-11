import { redirect } from 'next/navigation';

// Redirect root dashboard route to /dashboard
export default function DashboardIndexPage() {
  redirect('/dashboard');
}
