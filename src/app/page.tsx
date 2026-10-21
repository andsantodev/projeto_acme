import { redirect } from "next/navigation";

import { homeRouteFor } from "@/lib/navigation";
import { getCurrentUser } from "@/services/current-user";

export default async function RootPage() {
  const user = await getCurrentUser();

  redirect(user ? homeRouteFor(user.role) : "/login");
}
