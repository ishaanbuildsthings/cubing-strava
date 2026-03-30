interface CubeLoaderProps {
  message?: string;
}

export function CubeLoader({ message }: CubeLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
      <div className="flex gap-4 text-3xl text-muted-foreground">
        {["event-222", "event-333", "event-444"].map((event, i) => (
          <i
            key={event}
            className={`cubing-icon ${event} animate-bounce`}
            style={{
              animationDelay: `${i * 150}ms`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
