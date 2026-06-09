import { redirect } from 'next/navigation';

// /upgrade → redirect to pricing page
export default function UpgradePage() {
  redirect('/pricing');
}
