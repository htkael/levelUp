export const EmptyState = ({
  icon = "📦",
  title = "No items found",
  description = "Get started by creating your first item",
  actionLabel,
  onAction
}) => {
  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body items-center text-center py-12">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-base-content/70 mt-2 max-w-md">
          {description}
        </p>
        {actionLabel && onAction && (
          <button className="btn btn-primary mt-4" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
