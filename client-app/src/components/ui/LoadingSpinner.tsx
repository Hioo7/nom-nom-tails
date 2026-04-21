export function LoadingSpinner({ fullPage = false }: { fullPage?: boolean }) {
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-orange-500" />
      </div>
    );
  }
  return <span className="loading loading-spinner loading-md text-orange-500" />;
}
