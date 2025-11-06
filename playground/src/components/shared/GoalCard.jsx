import { formatDate } from "date-fns"
import { Link } from "react-router-dom"
import { formatRelativeDate } from "../../utils/dateHelpers"

export const GoalCard = ({ goal, showActivity = false }) => {
  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md hover:scale-[1.02] hover:bg-base-300 transition-all duration-200 cursor-pointer">
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h4 className="font-semibold">
              {goal.targetValue} {goal.unit} of {goal.metricName}
            </h4>
            {showActivity && goal.activityName && (
              <p className="text-sm text-base-content/60">{goal.activityName}</p>
            )}
            <p className="text-sm text-base-content/60">
              {formatDate(goal.startDate, "MMM d, yyyy")} - {formatDate(goal.endDate, "MMM d, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {goal.percentageComplete.toFixed(0)}%
            </div>
            <div className="text-xs text-base-content/60">
              {goal.daysRemaining} {goal.daysRemaining === 1 ? 'day' : 'days'} left
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <progress
          className="progress progress-primary w-full"
          value={goal.percentageComplete}
          max="100"
        ></progress>
        {/* Progress Stats */}
        <div className="flex justify-between text-sm mt-2">
          <span className="text-base-content/60">
            Current: {goal.currentProgress} {goal.unit}
          </span>
          <span className="text-base-content/60">
            Target: {goal.targetValue} {goal.unit}
          </span>
        </div>
        {/* Last Entry Date */}
        {goal.lastEntryDate && (
          <div className="text-xs text-base-content/60 mt-2">
            Last logged: {formatRelativeDate(goal.lastEntryDate)}
          </div>
        )}
        {/* Action Button - Optional */}
        {goal.id && (
          <div className="card-actions justify-end mt-2">
            <Link to={`/goals/${goal.id}`} className="btn btn-ghost btn-xs">
              Details →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
