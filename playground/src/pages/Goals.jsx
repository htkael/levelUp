import { useState } from "react"
import { useGoals } from "../hooks/useGoals"
import { LoadingSpinner } from "../components/shared/LoadingSpinner"
import { EmptyState } from "../components/shared/EmptyState"
import { FilterDropdown } from "../components/shared/FilterDropdown"
import { GoalCard } from "../components/shared/GoalCard.jsx"
import { useActivities } from "../hooks/useActivities.js"
import { FaRunning, FaFolder, FaPlus, FaToggleOn, FaToggleOff } from "react-icons/fa"
import { CreateGoal } from "../components/goals/CreateGoal.jsx"

export const Goals = () => {
  const [activityId, setActivityId] = useState(null)
  const [isActive, setIsActive] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: goals, isLoading: goalsLoading, error: goalsError } = useGoals({
    activityId,
    isActive,
    groupId: null
  })

  const filters = {
    categoryId: undefined,
    isActive: true
  }

  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useActivities(filters)

  const isLoading = goalsLoading || activitiesLoading
  const error = goalsError || activitiesError

  const activityOptions = activitiesLoading ? [{ label: "Loading...", value: null }] : activities.map((a) => {
    return {
      value: a.id,
      name: a.name,
      color: a.categoryColor
    }
  })


  const handleCreateGoal = () => {
    setShowCreateModal(true)
  }

  if (isLoading) {
    return (
      <LoadingSpinner
        fullPage={true}
        text="Loading goals..."
      />
    )
  }

  const hasGoals = goals && goals.length > 0

  return (
    <div className="p-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-base-content/60 mt-1">
            Track your progress towards your targets
          </p>
        </div>
        <button
          className="btn btn-primary gap-2"
          onClick={handleCreateGoal}
        >
          <FaPlus className="w-4 h-4" />
          Create Goal
        </button>
      </div>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <FilterDropdown
          label="Activity"
          icon={FaRunning}
          options={activityOptions}
          value={activityId}
          onChange={setActivityId}
          placeholder="All Activities"
        />
        <button
          className="btn btn-ghost btn-sm gap-2"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? (
            <>
              <FaToggleOn className="w-4 h-4 text-success" />
              <span>Active Goals</span>
            </>
          ) : (
            <>
              <FaToggleOff className="w-4 h-4 text-base-content/40" />
              <span>All Goals</span>
            </>
          )}
        </button>
      </div>
      {/* Error State */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>Error loading goals: {error.message}</span>
        </div>
      )}
      {/* Empty State */}
      {!hasGoals && !error && (
        <EmptyState
          icon={<span className="text-6xl">🎯</span>}
          title="No Goals Yet"
          description={
            activityId || !isActive
              ? "No goals match your current filters. Try adjusting your filters or create a new goal."
              : "Start setting goals to track your progress and stay motivated!"
          }
          action={
            <button
              className="btn btn-primary"
              onClick={handleCreateGoal}
            >
              Create Your First Goal
            </button>
          }
        />
      )}
      {/* Goals Grid with darker background */}
      {hasGoals && (
        <div className="bg-base-200 rounded-lg p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                showActivity={true}
              />
            ))}
          </div>
        </div>
      )}
      <CreateGoal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}
