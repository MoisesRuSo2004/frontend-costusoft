import type { Metadata } from "next";
import UserDashboard from "@/app/modules/user/dashboard/UserDashboard";

export const metadata: Metadata = {
  title: "User",
};

export default function UserPage() {
  return <UserDashboard />;
}
