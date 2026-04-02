"use client";

import { useState, useRef, useEffect } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { UserAvatar } from "@/lib/components/user-avatar";
import { countryCodeToFlag } from "@/lib/countries";

export function UserSearch() {
  const trpc = useTRPC();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: results, isFetching } = useQuery({
    ...trpc.user.search.queryOptions({ query: debouncedQuery }),
    enabled: debouncedQuery.length >= 1,
  });

  const isLoading = query.length >= 1 && (query !== debouncedQuery || isFetching);

  const handleSelect = (username: string) => {
    setQuery("");
    setOpen(false);
    router.push(`/profile/${username}`);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => { if (query.length >= 1) setOpen(true); }}
          className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:border-muted-foreground/40 transition-colors"
        />
      </div>
      {open && query.length >= 1 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-y-auto max-h-[220px] z-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          ) : results && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No users found</p>
          ) : results ? (
            results.map((user) => (
              <button
                key={user.id}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-neutral-800 transition-colors text-left"
                onClick={() => handleSelect(user.username)}
              >
                <UserAvatar user={user} size="sm" rounded="full" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user.username}
                    {user.country && <span className="ml-1.5">{countryCodeToFlag(user.country)}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </button>
            ))
          ) : null}
        </div>
      )}
    </div>
  );
}
