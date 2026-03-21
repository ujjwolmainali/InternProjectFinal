"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const formatSegment = (segment: string) =>
  segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function Breadcrumb() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname) return null;

  const segments = pathname.split("/").filter(Boolean);
  const current = segments[segments.length - 1] || "Home";

  return (
    <nav className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex items-center gap-1">
      {/* Home */}
      <Link href="/" className="hover:text-gray-900 dark:hover:text-white">
        Home
      </Link>

      <span className="mx-1">›</span>

      {/* Previous / Back */}
      {segments.length > 1 && (
        <>
          <button
            onClick={() => router.back()}
            className="hover:text-gray-900 dark:hover:text-white cursor-pointer"
          >
            Prev
          </button>
          <span className="mx-1">›</span>
        </>
      )}

      {/* Current page */}
      <span className="font-medium text-gray-900 dark:text-white">
        {formatSegment(current)}
      </span>
    </nav>
  );
}
