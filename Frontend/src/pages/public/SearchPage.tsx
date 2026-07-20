import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Clock, X, ArrowRight } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import ProductGrid from '@/components/product/ProductGrid';
import { Breadcrumb } from '@/components/ui/Navigation';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const { query, setQuery, results, isLoading, recentSearches, saveSearch, clearRecentSearches } = useSearch();

  React.useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery, setQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearch(query.trim());
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container-wide">
          <Breadcrumb items={[{ label: 'Search' }]} />
          <div className="mt-5 max-w-2xl">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, brands, categories…"
                  autoFocus
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base bg-white"
                />
              </div>
              <button type="submit" className="px-6 py-3.5 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors">
                Search
              </button>
            </form>

            {/* Recent searches */}
            {!query && recentSearches.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Searches</span>
                  <button onClick={clearRecentSearches} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); setSearchParams({ q: s }); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-600 transition-colors"
                    >
                      <Clock size={12} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        {query && (
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              {isLoading ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''} for `}
              {!isLoading && <strong className="text-gray-900">"{query}"</strong>}
            </p>
          </div>
        )}
        <ProductGrid products={results} isLoading={isLoading} columns={4} emptyMessage={query ? `No results for "${query}". Try different keywords.` : 'Enter a search term above.'} />
      </div>
    </div>
  );
};

export default SearchPage;
