import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LogNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-hive-900">
        Visit not found
      </h1>
      <p className="mt-2 text-hive-600">
        That log doesn’t exist or you don’t have access to it.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/logs">Back to logs</Link>
      </Button>
    </div>
  );
}
