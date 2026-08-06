import Link from "next/link";
import {
  ClipboardList,
  DollarSign,
  Hexagon,
  QrCode,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { BrandLogo, BrandWatermark } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ClipboardList,
    title: "Field-ready Quick Log",
    description:
      "Record queen sightings, brood, stores, mites, and actions in one glove-friendly form — then get back to the yard.",
  },
  {
    icon: Hexagon,
    title: "Live hive tracking",
    description:
      "Keep every colony organized with status, frame counts, and a clear history of what happened in each box.",
  },
  {
    icon: DollarSign,
    title: "Finances",
    description:
      "Log honey sales, nucs, and yard costs together — see season profit, not just what you spent.",
  },
  {
    icon: QrCode,
    title: "Yard QR codes",
    description:
      "Print a code for each hive and open Quick Log from your phone at the stand — no digging through menus.",
  },
  {
    icon: Sun,
    title: "Local weather context",
    description:
      "Agra-area conditions surface on your dashboard so inspection days and forage notes stay grounded in the season.",
  },
  {
    icon: ShieldCheck,
    title: "Private to your yard",
    description:
      "Your apiary data stays behind your account with secure sign-in — built for working beekeepers, not spreadsheets.",
  },
];

const testimonials = [
  {
    quote:
      "I used to lose notes on paper scraps in the truck. Quick Log from the QR code means the inspection is saved before I close the lid.",
    name: "Marcus Hale",
    role: "Hobbyist · 8 hives · Prague, OK",
  },
  {
    quote:
      "Treatments and sugar run up fast. Seeing expenses by category finally told us where the season money was going.",
    name: "Elena Brooks",
    role: "Side-line · 22 hives · Stillwater area",
  },
  {
    quote:
      "We run Agra outyards with part-time help. Shared hive history and mite counts keep everyone working from the same story.",
    name: "Jonah Reed",
    role: "Small commercial · Lincoln County",
  },
];

export default function WelcomePage() {
  return (
    <div className="relative">
      {/* Hero — one composition: brand, headline, support, CTAs, dominant mark */}
      <section className="relative mx-auto flex min-h-[calc(100vh-5.5rem)] w-full max-w-6xl flex-col justify-center px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <BrandWatermark
          className="-right-8 top-0 sm:right-0 sm:top-8 lg:right-4"
          size={520}
        />
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-honey-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-64 w-64 rounded-full bg-meadow-400/15 blur-3xl" />

        <div className="relative z-10 max-w-2xl fade-up">
          <div className="mb-8 flex items-center gap-4">
            <div className="float-slow">
              <BrandLogo size={110} className="h-24 w-24 sm:h-28 sm:w-28" priority />
            </div>
          </div>

          <p className="font-display text-5xl font-bold tracking-tight text-hive-900 sm:text-6xl lg:text-7xl">
            Apiary
          </p>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-hive-600 sm:text-xl">
            Modern yard records for Oklahoma beekeepers — inspections, mites,
            costs, and hive history in one calm place.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">Start managing your yard</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative border-t border-wax-300/50 bg-gradient-to-b from-wax-50/40 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="fade-up max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-honey-700">
              Built for the stand
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-hive-900 sm:text-4xl">
              Everything you need between the smoker and the supper table
            </h2>
            <p className="mt-4 text-base leading-relaxed text-hive-600">
              Apiary keeps field work fast and winter planning clear — without
              turning your phone into another cluttered dashboard.
            </p>
          </div>

          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className="fade-up group"
                style={{ animationDelay: `${0.06 * (index + 1)}s` }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-honey-500/15 text-honey-800 ring-1 ring-honey-400/25 transition-colors group-hover:bg-honey-500/25">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-hive-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-hive-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative overflow-hidden border-t border-wax-300/50">
        <BrandWatermark
          className="-left-20 bottom-0 rotate-[-12deg] opacity-60"
          size={340}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="fade-up max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-honey-700">
              From the yard
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-hive-900 sm:text-4xl">
              Beekeepers who keep better notes keep better bees
            </h2>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <figure
                key={item.name}
                className="fade-up relative border-l-2 border-honey-500/40 pl-5"
                style={{ animationDelay: `${0.08 * (index + 1)}s` }}
              >
                <blockquote className="font-display text-lg leading-relaxed text-hive-800 sm:text-xl">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-5">
                  <p className="text-sm font-semibold text-hive-900">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-hive-500">{item.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-wax-300/50">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="fade-up max-w-xl">
            <h2 className="font-display text-3xl font-bold text-hive-900 sm:text-4xl">
              Ready for the next inspection?
            </h2>
            <p className="mt-3 text-base text-hive-600">
              Create your account and add your first hive in a couple of
              minutes.
            </p>
          </div>
          <div className="fade-up flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">Create account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-wax-300/40 px-4 py-8 text-center text-xs text-hive-500 sm:px-6">
        Apiary · Built for Agra, Oklahoma beekeepers
      </footer>
    </div>
  );
}
