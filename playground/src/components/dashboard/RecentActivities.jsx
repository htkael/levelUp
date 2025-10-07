
export const RecentActivities = ({ recentActivities }) => {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Recent Activity</h3>
        <div className="space-y-3">
            {recentActivities && recentActivities.length > 0 ? (
              <>
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-2 hover:bg-base-200 rounded">
                    <div>
                      <div className="font-medium">{activity.activity}</div>
                      <div className="text-sm text-base-content/70">
                        {activity.category} • {activity.metric}
                      </div>
                    </div>
                    <div className="text-xs text-base-content/50">
                      {activity.date === "2025-10-02" ? "Today" : activity.date}
                    </div>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm w-full">View All</button>
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
    </div>
  )
}
