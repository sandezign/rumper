import { Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function QuotaModal({
  resetsAt,
  onClose,
}: {
  resetsAt: string | null;
  onClose: () => void;
}) {
  const resetLabel = resetsAt
    ? new Date(resetsAt).toLocaleString("id-ID", {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }) + " WIB"
    : "tengah malam WIB";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-feature text-brand-green-dark">
          <Clock className="size-6" aria-hidden />
        </div>
        <DialogHeader className="mt-md items-center">
          <DialogTitle>Kuota harian habis</DialogTitle>
          <DialogDescription>
            Kuota token gratis Anda untuk hari ini sudah terpakai. Kuota direset otomatis pada{" "}
            <b className="text-foreground">{resetLabel}</b>.
          </DialogDescription>
        </DialogHeader>
        <p className="mt-md rounded-md bg-surface-feature px-md py-sm text-caption text-brand-green-dark">
          Butuh kuota lebih besar untuk riset lokasi tanpa batas? Fitur berlangganan segera hadir —
          laporan yang sudah selesai tetap bisa Anda baca.
        </p>
        <Button className="mt-lg w-full" onClick={onClose}>
          Mengerti
        </Button>
      </DialogContent>
    </Dialog>
  );
}
