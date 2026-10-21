"use server";

import { redirect } from "next/navigation";

import { validateCredentials } from "@/lib/credentials";
import { homeRouteFor } from "@/lib/navigation";
import { signIn } from "@/services/auth";
import { getCurrentUser } from "@/services/current-user";

export type LoginState = { error?: string };

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const credentials = validateCredentials(
    String(formData.get("email") ?? ""),
    String(formData.get("password") ?? ""),
  );

  if (!credentials.ok) {
    return { error: credentials.message };
  }

  const signedIn = await signIn(credentials.email, credentials.password);

  if (!signedIn) {
    return { error: "E-mail ou senha incorretos." };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { error: "Esta conta não tem perfil no portal. Fale com o TI." };
  }

  redirect(homeRouteFor(user.role));
}
