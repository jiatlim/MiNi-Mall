type SearchFormProps = {
  search: string;
  category: string;
};

export function SearchForm({ search, category }: SearchFormProps) {
  return (
    <form action="/" method="get" className="flex w-full flex-col gap-2 sm:flex-row">
      {category ? (
        <input type="hidden" name="category" value={category} />
      ) : null}
      <label htmlFor="search" className="sr-only">
        搜索商品
      </label>
      <input
        key={search}
        id="search"
        name="search"
        type="search"
        defaultValue={search}
        placeholder="搜索商品名称，例如：耳机"
        className="h-11 flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
      />
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-900 px-6 text-sm font-medium text-white transition hover:bg-neutral-700"
      >
        搜索
      </button>
    </form>
  );
}
