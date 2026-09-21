import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import GoogleSignInButton from "./GoogleSignInButton";
import type { User } from "@/lib/api";

export default function LoginModal({
  onLogin,
  onClose,
}: {
  onLogin: (u: User) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <span className="text-micro-uppercase text-brand-green-dark">Rumper</span>
          <DialogTitle>Masuk untuk mulai cek lokasi</DialogTitle>
          <DialogDescription>
            Gratis 50.000 token per hari untuk chat dan deep research lokasi rumah incaran Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-lg">
          <GoogleSignInButton onLogin={onLogin} />
        </div>
        <p className="mt-md text-caption text-text-tertiary">
          Dengan masuk, Anda setuju data lokasi yang Anda kirim dipakai hanya untuk menyiapkan
          analisis risiko dan tidak dibagikan ke penjual, agen, atau developer.
        </p>
      </DialogContent>
    </Dialog>
  );
}
