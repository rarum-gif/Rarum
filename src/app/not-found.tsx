import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="font-display text-sunset text-[140px]">404</p>
      <h1 className="mt-2 text-xl font-bold text-white">Diese Seite ist selten – so selten, dass es sie nicht gibt.</h1>
      <Button asChild className="mt-6"><Link href="/">Zur Startseite</Link></Button>
    </div>
  );
}
