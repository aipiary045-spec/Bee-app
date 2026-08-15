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
import { FlyingBees } from "@/components/motion/flying-bees";
import { YardScene } from "@/components/yard/yard-scene";
import type { YardHiveData } from "@/components/yard/yard-hive";

const features = [
  {
    icon: ClipboardList,
    title: "Field-ready Quick Log",
    description:
      "Record queen sightings, brood, stores, mites, and add or pull supers in one glove-friendly form — then get back to the yard.",
  },
  {
    icon: Hexagon,
    title: "A yard you can see",
    description:
      "Every colony shows as a stack. Open a hive for history, or tap Log at the stand without hunting through menus.",
  },
  {
    icon: DollarSign,
    title: "Finances in one ledger",
    description:
      "Honey sales, nucs, feed, and treatments sit together so you can see season profit, not just what you spent.",
  },
  {
    icon: QrCode,
    title: "Hive tags",
    description:
      "Print a code for each box and open Quick Log from your phone — handy when you run more than a couple of colonies.",
  },
  {
    icon: Sun,
    title: "Weather for your town",
    description:
      "Set your yard location and Home shows local conditions plus a seasonal forage note for the month you are in.",
  },
  {
    icon: ShieldCheck,
    title: "Private to your account",
    description:
      "Your records stay behind your sign-in. Built for working beekeepers, not a shared spreadsheet in the truck.",
  },
];

const uses = [
  {
    title: "Backyard",
    body: "A few hives behind the house. Keep queen notes and mite counts where you can find them next week.",
  },
  {
    title: "Side-line",
    body: "Treatments and sugar add up. The ledger shows where the season money is going before harvest.",
  },
  {
    title: "Shared stand",
    body: "Family or club help on the same yard. One hive history so the next visit starts from the same story.",
  },
];

const demoHives: YardHiveData[] = [
  {
    id: "demo-north",
    name: "North",
    status: "active",
    super_count: 3,
    medium_count: 2,
    shallow_count: 1,
  },
  {
    id: "demo-maple",
    name: "Maple",
    status: "active",
    super_count: 2,
    medium_count: 2,
    shallow_count: 0,
  },
  {
    id: "demo-gate",
    name: "Gate",
    status: "active",
    super_count: 1,
    medium_count: 0,
    shallow_count: 1,
  },
  {
    id: "demo-creek",
    name: "Creek",
    status: "active",
    super_count: 2,
    medium_count: 1,
    shallow_count: 1,
  },
  {
    id: "demo-hill",
    name: "Hill",
    status: "active",
    super_count: 1,
    medium_count: 1,
    shallow_count: 0,
  },
  {
    id: "demo-orchard",
    name: "Orchard",
    status: "active",
    super_count: 3,
    medium_count: 2,
    shallow_count: 1,
  },
];

export default function WelcomePage() {
  return (
    <div className="relative">
      <section className="relative mx-auto flex min-h-[calc(100vh-5.5rem)] w-full max-w-6xl flex-col justify-center px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <BrandWatermark
          className="-right-8 top-0 sm:right-0 sm:top-8 lg:right-4"
          size={520}
        />
        <FlyingBees className="opacity-80" />
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-honey-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-64 w-64 rounded-full bg-meadow-400/15 blur-3xl" />

        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl fade-up">
            <div className="mb-8 flex items-center gap-4">
              <div className="float-slow">
                <BrandLogo size={110} className="h-24 w-24 sm:h-28 sm:w-28" priority />
              </div>
            </div>

            <p className="font-display text-5xl font-bold tracking-tight text-hive-900 sm:text-6xl lg:text-7xl">
              The yard,
              <span className="block text-honey-700">in your pocket.</span>
            </p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-hive-600 sm:text-xl">
              Hive records for working beekeepers — inspections, mites, harvests,
              and costs in one calm place. Set your own yard. Invite your own
              season.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">Start your yard</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          <div className="fade-up-delay-2 hidden sm:block">
            <YardScene
              hives={demoHives}
              interactive={false}
              showWeather
              weather={{
                condition: "Sunny",
                temperatureF: 78,
                windSpeedMph: 8,
                humidity: 42,
                location: "Your town",
                observedAt: "2026-08-15T14:00",
              }}
            />
          </div>
        </div>
      </section>

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

          <div className="stagger-in mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="group">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-honey-500/15 text-honey-800 ring-1 ring-honey-400/25 transition-transform duration-300 group-hover:-translate-y-1 group-hover:bg-honey-500/25">
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

      <section className="relative overflow-hidden border-t border-wax-300/50">
        <BrandWatermark
          className="-left-20 bottom-0 rotate-[-12deg] opacity-60"
          size={340}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="fade-up max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-honey-700">
              Who it is for
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-hive-900 sm:text-4xl">
              One app for a backyard, a side-line, or a shared stand
            </h2>
          </div>

          <div className="stagger-in mt-14 grid gap-10 lg:grid-cols-3">
            {uses.map((item) => (
              <figure
                key={item.title}
                className="lift-card surface-panel rounded-2xl p-6"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-honey-700">
                  {item.title}
                </p>
                <p className="font-display mt-3 text-lg leading-relaxed text-hive-800 sm:text-xl">
                  {item.body}
                </p>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-wax-300/50">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="fade-up max-w-xl">
            <h2 className="font-display text-3xl font-bold text-hive-900 sm:text-4xl">
              Ready for the next inspection?
            </h2>
            <p className="mt-3 text-base text-hive-600">
              Create an account, name your yard, and add the first hive in a
              couple of minutes.
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
        Apiary · Hive records for working beekeepers
      </footer>
    </div>
  );
}
