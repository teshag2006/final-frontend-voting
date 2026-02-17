import { redirect } from 'next/navigation';

/**
 * Media root page redirect
 * Automatically redirects to the dashboard
 */
export default function MediaPage() {
  redirect('/media/dashboard');
}
