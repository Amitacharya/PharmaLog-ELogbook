import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function RouteLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  
  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="h-1 w-full bg-slate-200/50 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 animate-pulse"
          style={{
            animation: "loading-bar 1.5s ease-in-out infinite",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-200 rounded w-1/2" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 bg-slate-200 rounded flex-1" />
            <div className="h-10 bg-slate-200 rounded w-24" />
            <div className="h-10 bg-slate-200 rounded w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-6 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
      </div>
    </div>
  );
}
