import Link from "next/link";

import { ProductMark } from "@/components/app-shell/product-mark";
import { PRODUCT_NAME } from "@/lib/product";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col justify-center px-6 py-12">
      <div className="flex items-center gap-2">
        <ProductMark />
        <span className="text-brand font-semibold">{PRODUCT_NAME}</span>
      </div>

      <h1 className="mt-10 text-display font-semibold">
        Página não encontrada
      </h1>
      <p className="mt-2 text-muted">
        O endereço não existe ou o chamado não está disponível para você.
      </p>

      <Link
        className="mt-8 flex h-10 w-fit items-center rounded-control bg-ink px-4 font-medium text-surface transition-colors hover:bg-ink/90"
        href="/"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
