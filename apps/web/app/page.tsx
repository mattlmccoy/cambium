import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-light tracking-tight text-stone-900">
          Cambium
        </h1>
        <p className="text-xl text-stone-500 font-light">
          Custom furniture, locally crafted from regional wood.
          <br />
          Designed by you. Made near you.
        </p>
        <Link
          href="/configure/side-table"
          className="inline-block px-8 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm tracking-wide"
        >
          Design Your Side Table
        </Link>
      </div>
    </div>
  );
}
