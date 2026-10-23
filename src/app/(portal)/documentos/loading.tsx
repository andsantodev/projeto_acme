import { Spinner } from "@/components/ui/spinner";

export default function LoadingDocuments() {
  return (
    <div className="grid flex-1 place-items-center py-16 text-muted">
      <Spinner label="Carregando documentos" />
    </div>
  );
}
