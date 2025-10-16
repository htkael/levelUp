export const LoadingSkeleton = ({ count = 3, type = "card" }) => {
  if (type === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton w-4 h-4 rounded-full"></div>
                <div className="skeleton h-6 w-32"></div>
              </div>
              <div className="skeleton h-4 w-full mb-2"></div>
              <div className="skeleton h-4 w-2/3"></div>
              <div className="flex gap-4 mt-4">
                <div className="skeleton h-4 w-20"></div>
                <div className="skeleton h-4 w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="skeleton w-12 h-12 rounded-full"></div>
                <div className="flex-1">
                  <div className="skeleton h-5 w-1/3 mb-2"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === "table") {
    return (
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th><div className="skeleton h-4 w-24"></div></th>
              <th><div className="skeleton h-4 w-32"></div></th>
              <th><div className="skeleton h-4 w-20"></div></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, i) => (
              <tr key={i}>
                <td><div className="skeleton h-4 w-full"></div></td>
                <td><div className="skeleton h-4 w-full"></div></td>
                <td><div className="skeleton h-4 w-full"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}
