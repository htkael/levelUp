import { useParams, Link, useNavigate } from "react-router-dom"
import { useGoal } from "../hooks/useGoal"
import { LoadingSpinner } from "../components/shared/LoadingSpinner"
import { formatDate, formatRelativeDate, isPast } from "../utils/dateHelpers"
import { FaArrowLeft, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaCheckCircle } from "react-icons/fa"
import { GoalProgressChart } from "../components/goals/GoalProgressChart"
import { useState } from "react"
import { UpdateGoal } from "../components/goals/UpdateGoal"
import { useDeleteGoal } from "../hooks/mutations/useDeleteGoal"
import { useToggleGoal } from "../hooks/mutations/useToggleGoal"

export const Goal = () => {
  const { id } = useParams()
  const { data: goal, isLoading, error } = useGoal({ id })
  const { mutate: deleteGoal } = useDeleteGoal()
  const { mutate: toggleGoal } = useToggleGoal()
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)

  const navigate = useNavigate()


  const handleEdit = () => {
    setIsUpdateOpen(true)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this goal?`)) {
      deleteGoal(goal, {
        onSuccess: () => {
          navigate("/goals")
        }
      })
    }
  }

  const handleToggleActive = () => {
    toggleGoal(goal
    )
  }

  if (isLoading) {
    return (
      <LoadingSpinner
        fullPage={true}
        text="Loading goal details..."
      />
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>Error loading goal: {error.message}</span>
        </div>
        <Link to="/goals" className="btn btn-ghost mt-4">
          ← Back to Goals
        </Link>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="p-6">
        <div className="alert alert-warning">
          <span>Goal not found</span>
        </div>
        <Link to="/goals" className="btn btn-ghost mt-4">
          ← Back to Goals
        </Link>
      </div>
    )
  }

  const formatPeriod = (period) => {
    return period.charAt(0) + period.slice(1).toLowerCase()
  }

  const isCompleted = goal.percentageComplete >= 100
  const isExpired = isPast(goal.endDate)

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 m-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/goals" className="btn btn-ghost btn-sm">
              <FaArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{goal.activityName}</h1>
              <p className="text-base-content/60 mt-1">
                {goal.categoryName} • {formatPeriod(goal.targetPeriod)} Goal
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleToggleActive}
            >
              {goal.isActive ? (
                <>
                  <FaToggleOn className="w-4 h-4 text-success" />
                  Active
                </>
              ) : (
                <>
                  <FaToggleOff className="w-4 h-4" />
                  Inactive
                </>
              )}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleEdit}>
              <FaEdit className="w-4 h-4" />
              Edit
            </button>
            <button className="btn btn-error btn-outline btn-sm" onClick={handleDelete}>
              <FaTrash className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Status Banner */}
        {isCompleted && (
          <div className="alert alert-success mb-6">
            <FaCheckCircle className="w-5 h-5" />
            <span className="font-semibold">Goal Completed! 🎉</span>
          </div>
        )}
        {isExpired && (
          <div className="alert alert-warning mb-6">
            <span className="font-semibold">This goal has expired</span>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h2 className="card-title mb-4">Progress Overview</h2>

                {/* Large Progress Display */}
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {goal.percentageComplete.toFixed(1)}%
                  </div>
                  <div className="text-lg text-base-content/60">
                    {goal.currentProgress} / {goal.targetValue} {goal.unit}
                  </div>
                </div>

                {/* Progress Bar */}
                <progress
                  className="progress progress-primary w-full h-4"
                  value={goal.percentageComplete}
                  max="100"
                ></progress>

                {/* Goal Description */}
                <div className="text-center mt-4">
                  <p className="text-lg">
                    <span className="font-semibold">{goal.metricName}:</span> {goal.targetValue} {goal.unit}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Chart - Placeholder for now */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h2 className="card-title mb-4">Progress Over Time</h2>
                <GoalProgressChart goal={goal} />
              </div>
            </div>

            {/* Recent Entries */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h2 className="card-title mb-4">
                  Contributing Entries ({goal.allEntries?.length || 0})
                </h2>

                {goal.allEntries && goal.allEntries.length > 0 ? (
                  <div className="space-y-3">
                    {goal.allEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-base-300 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">
                            {formatDate(entry.entryDate, "MMM d, yyyy")}
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-base-content/60 mt-1 line-clamp-1">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            +{entry.value} {entry.unit}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {formatRelativeDate(entry.entryDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-base-content/60">
                    No entries logged yet for this goal
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Goal Details */}
          <div className="space-y-6">
            {/* Timeline Card */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Timeline</h3>

                <div className="space-y-4">
                  {/* Start Date */}
                  <div>
                    <div className="text-xs text-base-content/60 mb-1">Start Date</div>
                    <div className="font-semibold">
                      {formatDate(goal.startDate, "MMM d, yyyy")}
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <div className="text-xs text-base-content/60 mb-1">End Date</div>
                    <div className="font-semibold">
                      {formatDate(goal.endDate, "MMM d, yyyy")}
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  {/* Days Elapsed */}
                  <div>
                    <div className="text-xs text-base-content/60 mb-1">Days Elapsed</div>
                    <div className="text-2xl font-bold">{goal.daysElapsed}</div>
                  </div>

                  {/* Days Remaining */}
                  <div>
                    <div className="text-xs text-base-content/60 mb-1">Days Remaining</div>
                    <div className="text-2xl font-bold text-primary">
                      {goal.daysRemaining}
                    </div>
                  </div>

                  {/* Total Days */}
                  <div>
                    <div className="text-xs text-base-content/60 mb-1">Total Duration</div>
                    <div className="font-semibold">{goal.totalDays} days</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Activity Card */}
            {goal.lastEntryDate && (
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-lg mb-2">Last Activity</h3>
                  <div className="text-2xl font-bold text-success">
                    {formatRelativeDate(goal.lastEntryDate)}
                  </div>
                  <div className="text-sm text-base-content/60">
                    {formatDate(goal.lastEntryDate, "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Quick Stats</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Total Entries</span>
                    <span className="font-semibold">{goal.allEntries?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Average per Day</span>
                    <span className="font-semibold">
                      {goal.daysElapsed > 0
                        ? (goal.currentProgress / goal.daysElapsed).toFixed(2)
                        : '0.00'
                      } {goal.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Needed per Day</span>
                    <span className="font-semibold">
                      {goal.daysRemaining > 0
                        ? ((goal.targetValue - goal.currentProgress) / goal.daysRemaining).toFixed(2)
                        : '0.00'
                      } {goal.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UpdateGoal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        goal={goal}
      />
    </div>
  )
}
