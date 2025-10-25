import { useState } from "react"
import { ActivityCard } from "../components/activities/ActivityCard.jsx"
import { ErrorAlert } from "../components/shared/errors/ErrorAlert.jsx"
import { EmptyState } from "../components/shared/EmptyState.jsx"
import { LoadingSkeleton } from "../components/shared/LoadingSkeleton.jsx"
import { useCategories } from "../hooks/useCategories.js"
import { useActivities } from "../hooks/useActivities.js"
import { CreateActivity } from "../components/activities/CreateActivity.jsx"

export const Activities = () => {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filters = {
    categoryId: selectedCategory !== 'all' ? parseInt(selectedCategory) : undefined,
    isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined
  }

  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data, isLoading, error, refetch } = useActivities(filters)

  const activities = data || []

  const filteredActivities = activities.filter(activity => {
    if (searchQuery && !activity.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const isEmpty = filteredActivities.length === 0

  const handleCloseCreateActivity = () => {
    setShowCreateModal(false)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 m-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Activities</h1>
            <p className="text-base-content/70 mt-1">
              Track and manage your activities
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="text-lg">+</span>
            Create Activity
          </button>
        </div>

        {/* Filters Section */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="form-control flex-1">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search activities..."
                    className="input input-bordered w-full focus:outline-primary focus:outline-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="form-control w-full lg:w-64">
                <select
                  className="select select-bordered w-full focus:outline-primary focus:outline-1"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {
                    categoriesLoading ? (
                      <option>Loading...</option>
                    ) : (
                      categories?.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    )
                  }
                </select>
              </div>

              {/* Status Tabs */}
              <div className="tabs tabs-boxed bg-base-100">
                <button
                  className={`tab ${statusFilter === "all" ? "tab-active" : ""}`}
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </button>
                <button
                  className={`tab ${statusFilter === "active" ? "tab-active" : ""}`}
                  onClick={() => setStatusFilter("active")}
                >
                  Active
                </button>
                <button
                  className={`tab ${statusFilter === "inactive" ? "tab-active" : ""}`}
                  onClick={() => setStatusFilter("inactive")}
                >
                  Hidden
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory !== "all" || statusFilter !== "all" || searchQuery) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedCategory !== "all" && (
                  <div className="badge badge-lg badge-primary gap-2">
                    {categories.find(c => c.id === parseInt(selectedCategory))?.name}
                    <button
                      className="btn btn-ghost btn-xs btn-circle"
                      onClick={() => setSelectedCategory("all")}
                    >
                      ✕
                    </button>
                  </div>
                )}
                {statusFilter !== "all" && (
                  <div className="badge badge-lg badge-secondary gap-2">
                    {statusFilter === "active" ? "Active" : "Hidden"}
                    <button
                      className="btn btn-ghost btn-xs btn-circle"
                      onClick={() => setStatusFilter("all")}
                    >
                      ✕
                    </button>
                  </div>
                )}
                {searchQuery && (
                  <div className="badge badge-lg badge-accent gap-2">
                    Search: "{searchQuery}"
                    <button
                      className="btn btn-ghost btn-xs btn-circle"
                      onClick={() => setSearchQuery("")}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSelectedCategory("all")
                    setStatusFilter("all")
                    setSearchQuery("")
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        <ErrorAlert
          error={error}
          onRetry={refetch}
          title="Failed to load activities"
        />

        {isLoading && <LoadingSkeleton count={6} type="card" />}

        {!isLoading && !error && isEmpty && searchQuery === "" && selectedCategory === "all" && statusFilter === "all" && (
          <EmptyState
            icon="🎯"
            title="No activities yet"
            description="Create your first activity to start tracking your progress"
            actionLabel="Create Your First Activity"
            onAction={() => setShowCreateModal(true)}
          />
        )}

        {!isLoading && !error && isEmpty && (searchQuery || selectedCategory !== "all" || statusFilter !== "all") && (
          <EmptyState
            icon="🔍"
            title="No activities found"
            description="Try adjusting your filters or search query"
          />
        )}

        {!isLoading && !error && !isEmpty && (
          <>
            <div className="flex justify-between items-center text-sm text-base-content/70">
              <span>{filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </>
        )}

        <CreateActivity
          isOpen={showCreateModal}
          onClose={handleCloseCreateActivity}
        />
      </div>
    </div>
  )
}
