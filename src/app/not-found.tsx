import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="font-display text-7xl font-medium text-fg-subtle">404</p>
      <h1 className="mt-4 font-display text-2xl font-medium">Diese Seite ist selten – so selten, dass es sie nicht gibt.</h1>
      <Button asChild className="mt-6"><Link href="/">Zur Startseite</Link></Button>
    </div>
  );
}
