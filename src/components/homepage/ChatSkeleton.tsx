export default function ChatSkeleton() {
  return (
    <div className="w-full border bg-card text-card-foreground">
      <div className="flex items-center gap-4 p-4">
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-20 animate-pulse bg-muted"></div>
          <div className="h-3 w-32 animate-pulse bg-muted"></div>
        </div>
      </div>

      <div className="max-h-150 space-y-4 p-4 pt-0">
        <div className="flex items-start">
          <div className="max-w-[75%] space-y-2">
            <div className="h-12 w-80 animate-pulse bg-secondary"></div>
            <div className="h-8 w-64 animate-pulse bg-secondary"></div>
          </div>
        </div>
      </div>

      <div className="border-border border-t">
        <div className="flex items-center">
          <div className="h-12 flex-1 animate-pulse bg-background"></div>
          <div className="h-12 w-16 animate-pulse bg-primary"></div>
        </div>
      </div>
    </div>
  );
}
