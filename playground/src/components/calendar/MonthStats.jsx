import { formatDate } from "../../utils/dateHelpers"

export const MonthStats = ({ data }) => {
  const calculateStats = () => {
    if (!data || Object.keys(data).length === 0) {
      return {
        totalEntries: 0,
        daysLogged: 0,
        mostActiveDay: null,
        mostActiveCount: 0,
        uniqueActivities: 0,
        averagePerDay: 0
      }
    }

    const dates = Object.keys(data)
    const totalEntries = dates.reduce((sum, date) => sum + data[date].length, 0)
    const daysLogged = dates.length

    let mostActiveDay = null
    let mostActiveCount = 0

    dates.forEach(date => {
      const count = data[date].length
      if (count > mostActiveCount) {
        mostActiveCount = count
        mostActiveDay = date
      }
    })

    const activitiesSet = new Set()
    dates.forEach(date => {
      data[date].forEach(entry => {
        activitiesSet.add(entry.activityName)
      })
    })
    const uniqueActivities = activitiesSet.size

    const averagePerDay = daysLogged > 0 ? (totalEntries / daysLogged).toFixed(1) : 0

    return {
      totalEntries,
      daysLogged,
      mostActiveDay,
      mostActiveCount,
      uniqueActivities,
      averagePerDay
    }
  }

  const stats = calculateStats()

  return (
    <>
      {/* Header */}
      < div className="p-4 border-b border-base-300" >
        <h3 className="text-lg font-bold">Month Stats</h3>
        <p className="text-xs text-base-content/60 mt-1">
          Summary for this month
        </p>
      </div >

      {/* Stats List */}
      < div className="flex-1 overflow-y-auto p-4 space-y-4" >
        {/* Total Entries */}
        < div className="stat-item" >
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">📝</div>
            <div className="text-sm font-semibold text-base-content/70">
              Total Entries
            </div>
          </div>
          <div className="text-3xl font-bold pl-11">{stats.totalEntries}</div>
        </div >

        <div className="divider my-2"></div>

        {/* Days Logged */}
        <div className="stat-item">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">📅</div>
            <div className="text-sm font-semibold text-base-content/70">
              Days Logged
            </div>
          </div>
          <div className="text-3xl font-bold pl-11">{stats.daysLogged}</div>
        </div>

        <div className="divider my-2"></div>

        {/* Unique Activities */}
        <div className="stat-item">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">🎯</div>
            <div className="text-sm font-semibold text-base-content/70">
              Activities
            </div>
          </div>
          <div className="text-3xl font-bold pl-11">{stats.uniqueActivities}</div>
        </div>

        <div className="divider my-2"></div>

        {/* Average Per Day */}
        <div className="stat-item">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">📊</div>
            <div className="text-sm font-semibold text-base-content/70">
              Avg Per Day
            </div>
          </div>
          <div className="text-3xl font-bold pl-11">{stats.averagePerDay}</div>
          <div className="text-xs text-base-content/50 pl-11 mt-1">
            entries per logged day
          </div>
        </div>

        <div className="divider my-2"></div>

        {/* Most Active Day */}
        <div className="stat-item">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">🔥</div>
            <div className="text-sm font-semibold text-base-content/70">
              Most Active Day
            </div>
          </div>
          {stats.mostActiveDay ? (
            <div className="pl-11">
              <div className="text-3xl font-bold">{stats.mostActiveCount}</div>
              <div className="text-xs text-base-content/50 mt-1">
                {formatDate(stats.mostActiveDay)}
              </div>
            </div>
          ) : (
            <div className="text-xl font-bold pl-11 text-base-content/40">N/A</div>
          )}
        </div>
      </div >

      {/* Footer - Optional */}
      < div className="p-4 border-t border-base-300 text-xs text-base-content/50 text-center" >
        Keep up the great work! 💪
      </div >
    </>
  )
}
