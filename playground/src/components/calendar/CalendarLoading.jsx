export const CalendarLoadingOverlay = () => {
  return (
    <div className="absolute inset-0 bg-base-100/60 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="text-sm font-medium text-base-content/80">
          Updating calendar...
        </span>
      </div>
    </div>
  )
}
