import { useCategories } from "../hooks/useCategories"
import { ErrorAlert } from "../components/shared/errors/ErrorAlert.jsx"
import { CategoryCard } from "../components/categories/CategoryCard.jsx"
import { EmptyState } from "../components/shared/EmptyState.jsx"
import { LoadingSkeleton } from "../components/shared/LoadingSkeleton.jsx"
import { CreateCategory } from "../components/categories/CreateCategory.jsx"
import { useState } from "react"

export const Categories = () => {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const { data, isLoading, error, refetch } = useCategories()
  const categories = data || []
  const isEmpty = categories.length === 0

  const handleCreateCategory = () => {
    setIsAddOpen(true)
  }

  const handleCloseCreate = () => {
    setIsAddOpen(false)
  }

  return (
    <div className="space-y-6 m-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-base-content/70 mt-1">
            Organize your activities into categories
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateCategory}>
          <span className="text-lg">+</span>
          Create Category
        </button>
      </div>

      {/* Error State */}
      <ErrorAlert
        error={error}
        onRetry={refetch}
        title="Failed to load categories"
      />

      {/* Loading State - Skeleton */}
      {isLoading && <LoadingSkeleton count={6} type="card" />}

      {/* Empty State */}
      {!isLoading && !error && isEmpty && (
        <EmptyState
          icon="📁"
          title="No categories yet"
          description="Create your first category to start organizing your activities"
          actionLabel="Create Your First Category"
          onAction={handleCreateCategory}
        />
      )}

      {/* Categories Grid */}
      {!isLoading && !error && !isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}

      <CreateCategory
        isOpen={isAddOpen}
        onClose={handleCloseCreate}
      />
    </div>
  )
}
