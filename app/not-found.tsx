import Link from "next/link";
import AcmeLogo from "./ui/acme-logo";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <AcmeLogo />
      </div>
      <div className="flex justify-center h-full items-center flex-col p-5">
        <h2 className="text-3xl font-bold">Not Found</h2>
        <p className="text-gray-500 font-medium text-base md:text-xl mt-2">
          Could not find requested resource
        </p>
        <Link
          href="/"
          className="flex items-center w-fit mt-4 gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
        >
          <span>Return Home</span> <ArrowRightIcon className="w-5 md:w-6" />
        </Link>
      </div>
    </main>
  );
}
