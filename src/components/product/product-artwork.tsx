import Image from "next/image";

const palettes: Record<string, string> = {
  digital: "from-sky-100 via-sky-50 to-indigo-100 text-sky-700",
  home: "from-amber-100 via-orange-50 to-rose-100 text-amber-700",
  fashion: "from-rose-100 via-pink-50 to-fuchsia-100 text-rose-700",
  food: "from-lime-100 via-emerald-50 to-teal-100 text-emerald-700",
  beauty: "from-purple-100 via-violet-50 to-pink-100 text-purple-700",
  books: "from-stone-100 via-amber-50 to-yellow-100 text-stone-700",
};

type ProductArtworkProps = {
  name: string;
  categorySlug: string;
  imageUrl: string | null;
  preload?: boolean;
};

export function ProductArtwork({
  name,
  categorySlug,
  imageUrl,
  preload = false,
}: ProductArtworkProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        preload={preload}
        unoptimized
      />
    );
  }

  const palette =
    palettes[categorySlug] ??
    "from-neutral-100 via-neutral-50 to-neutral-200 text-neutral-500";

  return (
    <div
      aria-hidden="true"
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${palette}`}
    >
      <span className="px-4 text-center text-4xl font-semibold tracking-widest sm:text-5xl">
        {name.slice(0, 2)}
      </span>
    </div>
  );
}
