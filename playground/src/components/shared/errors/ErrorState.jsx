export const ErrorState = ({
  error,
  onRetry,
  title = "Failed to load data",
  icon = "⚠️"
}) => {
  if (!error) return null

  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body items-center text-center py-12">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-base-content/70 mt-2 max-w-md">
          {error.message || error || "Something went wrong while loading the data"}
        </p>
        {onRetry && (
          <button className="btn btn-primary mt-4" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
