/**
 * Bezahlfunktionen ein/aus.
 * Standard: AUS – alles im Spiel ist für alle kostenlos (auch „Premium“-Gegenstände,
 * Umgebungen und lange Endlos-Runden). Später einschalten mit NEXT_PUBLIC_MONETIZATION=on
 * (dann zusätzlich Stripe-Schlüssel setzen, siehe README).
 */
export const MONETIZATION = process.env.NEXT_PUBLIC_MONETIZATION === "on";
