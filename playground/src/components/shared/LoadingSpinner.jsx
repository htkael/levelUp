export const LoadingSpinner = ({
  size = "lg",
  fullPage = false,
  text
}) => {
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="flex flex-col items-center gap-4">
          <span className={`loading loading-spinner loading-${size}`}></span>
          {text && <p className="text-base-content/70">{text}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center py-12">
      <div className="flex flex-col items-center gap-4">
        <span className={`loading loading-spinner loading-${size}`}></span>
        {text && <p className="text-base-content/70">{text}</p>}
      </div>
    </div>
  )
}
