import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Page not found</h2>
        <p className="mt-2 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/dashboard/scanner" className={cn(buttonVariants(), "mt-4")}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
