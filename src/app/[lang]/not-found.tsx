import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

// Shown for unknown pages. Bilingual because it can't always know the language.
export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="space-y-3">
        <p className="text-5xl font-bold text-primary">404</p>
        <h1 className="text-xl font-semibold">الصفحة غير موجودة · Page not found</h1>
        <Link href="/" className={buttonClass("secondary")}>
          الرئيسية · Home
        </Link>
      </div>
    </main>
  );
}
