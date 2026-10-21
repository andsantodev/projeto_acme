import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProductMark } from "@/components/app-shell/product-mark";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { homeRouteFor } from "@/lib/navigation";
import { PRODUCT_NAME } from "@/lib/product";
import { getCurrentUser } from "@/services/current-user";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

const DEMO_ACCOUNTS = [
  {
    role: "Colaborador",
    email: "ana@acme.demo",
    password: "acme@123",
  },
  {
    role: "Atendente de TI",
    email: "ti@acme.demo",
    password: "acme@456",
  },
  {
    role: "Atendente de RH",
    email: "rh@acme.demo",
    password: "acme@789",
  },
];

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(homeRouteFor(user.role));
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col justify-center px-6 py-12">
      <div className="flex items-center gap-2">
        <ProductMark />
        <span className="text-brand font-semibold">{PRODUCT_NAME}</span>
      </div>

      <h1 className="mt-10 text-display font-semibold">Entrar no portal</h1>
      <p className="mt-2 text-muted">
        O assistente responde dúvidas de onboarding a partir dos documentos da
        empresa. O que não for resolvido vira chamado para TI ou RH.
      </p>

      <LoginForm />

      <Card className="mt-10" title="Contas de demonstração">
        <dl className="flex flex-col gap-3">
          {DEMO_ACCOUNTS.map((account) => (
            <div key={account.email}>
              <dt>
                <Badge>{account.role}</Badge>
              </dt>
              <dd className="mt-1 text-muted">
                <span className="text-ink">{account.email}</span> ·{" "}
                {account.password}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </main>
  );
}
