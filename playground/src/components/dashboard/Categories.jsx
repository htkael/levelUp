import { useNavigate } from "react-router-dom"

export const Categories = ({ categories }) => {
  const navigate = useNavigate()
  const handleCatClick = (categoryId) => {
    navigate(`/categories/${categoryId}`)
  }
  const handleManageCatClick = () => {
    navigate("/categories")
  }
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Categories</h3>
        <div className="space-y-3">
          {categories && categories.length > 0 ? (
            categories.map(category => (
              <div key={category.name} onClick={() => handleCatClick(category.id)} className="flex items-center justify-between p-2 hover:bg-base-200 rounded cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-base-content/70">{category.activities} activities</div>
                  </div>
                </div>
                <div className="text-xs text-base-content/50">{category.lastEntry}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-base-content/50 mb-2">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h4 className="font-medium text-base-content/70 mb-1">No categories yet</h4>
              <p className="text-sm text-base-content/50">Create your first category to start organizing your activities</p>
            </div>
          )}
          <button onClick={handleManageCatClick} className="btn btn-ghost btn-sm w-full">Manage Categories</button>
        </div>
      </div>
    </div>
  )
}
