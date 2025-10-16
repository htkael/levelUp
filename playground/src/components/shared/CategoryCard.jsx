import { Link } from "react-router-dom"

export const CategoryCard = ({ category }) => {

  return (
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body">
        {/* Color indicator & Name */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            ></div>
            <h3 className="card-title text-lg">{category.name}</h3>
          </div>

          {/* Actions Dropdown */}
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
              <li>
                <Link to={`/categories/${category.id}`}>
                  View Details
                </Link>
              </li>
              <li><a>Edit</a></li>
              <li><a className="text-error">Delete</a></li>
            </ul>
          </div>
        </div>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-base-content/70 mt-2">
            {category.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-4 mt-4 text-sm">
          <div>
            <span className="text-base-content/60">Activities: </span>
            <span className="font-semibold">{category.activities}</span>
          </div>
          {category.lastEntry && (
            <div>
              <span className="text-base-content/60">Last entry: </span>
              <span className="font-semibold">{category.lastEntry}</span>
            </div>
          )}
        </div>

        {/* View Details Link */}
        <div className="card-actions justify-end mt-4">
          <Link
            to={`/categories/${category.id}`}
            className="btn btn-sm btn-ghost"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  )
}
