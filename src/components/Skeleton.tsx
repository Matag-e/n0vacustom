import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-8 w-1/3 rounded-full" />
        </div>
      </div>
    </div>
  );
}
