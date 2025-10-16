export const ErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
      <div className="card bg-base-200 shadow-xl max-w-md w-full">
        <div className="card-body items-center text-center">
          <div className="text-6xl mb-4">💥</div>
          <h2 className="card-title text-2xl">Oops! Something broke</h2>
          <p className="text-base-content/70 mt-2">
            We encountered an unexpected error. This has been logged and we'll look into it.
          </p>
          {error?.message && (
            <div className="alert alert-warning mt-4 text-left text-sm">
              <code className="text-xs">{error.message}</code>
            </div>
          )}
          <div className="card-actions mt-6">
            <button
              className="btn btn-primary"
              onClick={resetErrorBoundary}
            >
              Try Again
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => window.location.href = '/'}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
