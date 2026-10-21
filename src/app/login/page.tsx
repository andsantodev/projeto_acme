import type { Metadata } from "next";

import { ProductMark } from "@/components/app-shell/product-mark";
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
        <span className="text-[15px] font-semibold">{PRODUCT_NAME}</span>
      </div>

      <h1 className="mt-10 text-[28px] leading-[1.15] font-semibold tracking-[-0.015em]">
        Entrar no portal
      </h1>
      <p className="mt-2 text-muted">
        O assistente responde dúvidas de onboarding a partir dos documentos da
        empresa. O que não for resolvido vira chamado para TI ou RH.
      </p>

      <h2 className="mt-10 text-base font-semibold">Quem usa o portal</h2>
      <dl className="mt-3 flex flex-col gap-3">
        {PROFILES.map((profile) => (
          <div key={profile.role}>
            <dt className="font-medium">{profile.role}</dt>
            <dd className="text-muted">{profile.access}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
