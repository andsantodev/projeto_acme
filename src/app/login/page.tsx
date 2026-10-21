import type { Metadata } from "next";

import { ProductMark } from "@/components/app-shell/product-mark";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PRODUCT_NAME } from "@/lib/product";

export const metadata: Metadata = {
  title: "Entrar",
};

const PROFILES = [
  { role: "Colaborador", access: "Assistente de onboarding e meus chamados" },
  { role: "Atendente de TI", access: "Fila de chamados de TI" },
  { role: "Atendente de RH", access: "Fila de chamados de RH" },
];

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col justify-center px-6 py-12">
      <div className="flex items-center gap-2">
        <ProductMark />
        <span className="text-brand font-semibold">{PRODUCT_NAME}</span>
      </div>

      <h1 className="mt-10 text-display font-semibold">
        Entrar no portal
      </h1>
      <p className="mt-2 text-muted">
        O assistente responde dúvidas de onboarding a partir dos documentos da
        empresa. O que não for resolvido vira chamado para TI ou RH.
      </p>

      <Card className="mt-10" title="Quem usa o portal">
        <dl className="flex flex-col gap-3">
          {PROFILES.map((profile) => (
            <div key={profile.role}>
              <dt>
                <Badge>{profile.role}</Badge>
              </dt>
              <dd className="mt-1 text-muted">{profile.access}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </main>
  );
}
