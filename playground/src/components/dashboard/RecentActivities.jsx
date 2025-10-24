import { useState } from "react"
import { formatRelativeDate } from "../../utils/dateHelpers.js"
import { createPortal } from "react-dom"
import { ProgressEntryModal } from "../progressEntries/ProgressEntryModal.jsx"

export const RecentActivities = ({ recentActivities }) => {
  const [entryId, setEntryId] = useState(null)
  const formatMetrics = (metricString) => {
    if (!metricString) return []

    return metricString.split(',').map(m => {
      const parts = m.trim().split(':')
      if (parts.length === 2) {
        const name = parts[0].trim()
        const valueWithUnit = parts[1].trim().split(' ')
        return {
          name,
          value: valueWithUnit[0],
          unit: valueWithUnit.slice(1).join(' ')
        }
      }
      return null
    }).filter(Boolean)
  }

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivities && recentActivities.length > 0 ? (
            <>
              {recentActivities.map(activity => {
                const metrics = formatMetrics(activity.metric)
                return (
                  <div key={activity.id} className="p-3 hover:bg-base-200 rounded-lg transition-colors" onClick={() => setEntryId(activity.id)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold">{activity.activity}</div>
                        <div className="text-sm text-base-content/60">
                          {activity.category}
                        </div>
                      </div>
                      <div className="text-xs text-base-content/50">
                        {formatRelativeDate(activity.date)}
                      </div>
                    </div>

                    {/* Metrics as badges */}
                    {metrics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {metrics.map((metric, idx) => (
                          <div key={idx} className="badge badge-outline badge-sm gap-1">
                            <span className="font-medium">{metric.value}</span>
                            <span className="text-base-content/60">{metric.unit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <button className="btn btn-ghost btn-sm w-full mt-2">View All Activities</button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="font-medium text-base-content/70 mb-2">No recent activities</h4>
              <p className="text-sm text-base-content/50">Activities will appear here as they occur</p>
            </div>
          )}
        </div>
      </div>
      {entryId && createPortal(
        <ProgressEntryModal
          isOpen={!!entryId}
          entryId={entryId}
          onClose={() => setEntryId(null)}
        />,
        document.body
      )}
    </div>
  )
}
