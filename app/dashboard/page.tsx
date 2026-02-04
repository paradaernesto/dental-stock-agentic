import { redirect } from "next/navigation";

/**
 * Dashboard page - Redirects to root
 * 
 * This route is kept for backward compatibility.
 * The dashboard now lives at the root route (/).
 */
export default function DashboardPage() {
  redirect("/");
}
