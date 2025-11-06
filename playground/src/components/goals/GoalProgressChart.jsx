import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatDate } from '../../utils/dateHelpers'

export const GoalProgressChart = ({ goal }) => {
  const buildChartData = () => {
    if (!goal.allEntries || goal.allEntries.length === 0) {
      return []
    }

    const sortedEntries = [...goal.allEntries].sort((a, b) =>
      new Date(a.entryDate) - new Date(b.entryDate)
    )

    let cumulative = 0
    const dataPoints = []

    const startDate = goal.startDate.split('T')[0]
    dataPoints.push({
      date: startDate,
      progress: 0,
      displayDate: formatDate(startDate, 'MMM d')
    })

    sortedEntries.forEach(entry => {
      cumulative += parseFloat(entry.value)
      dataPoints.push({
        date: entry.entryDate,
        progress: parseFloat(cumulative.toFixed(2)),
        displayDate: formatDate(entry.entryDate, 'MMM d')
      })
    })

    const today = new Date().toISOString().split('T')[0]
    const lastEntryDate = sortedEntries[sortedEntries.length - 1].entryDate

    if (today !== lastEntryDate && today !== startDate) {
      dataPoints.push({
        date: today,
        progress: parseFloat(cumulative.toFixed(2)),
        displayDate: formatDate(today, 'MMM d')
      })
    }

    const endDate = goal.endDate.split('T')[0]
    if (endDate !== today && endDate !== lastEntryDate) {
      dataPoints.push({
        date: endDate,
        progress: null,
        displayDate: formatDate(endDate, 'MMM d')
      })
    }

    return dataPoints
  }

  const chartData = buildChartData()
  const targetValue = parseFloat(goal.targetValue)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-100 border-2 border-primary rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{payload[0].payload.displayDate}</p>
          <p className="text-primary font-semibold">
            Progress: {payload[0].value?.toFixed(2)} {goal.unit}
          </p>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-base-300 rounded-lg">
        <div className="text-center">
          <p className="text-base-content/60 mb-2">No progress data yet</p>
          <p className="text-sm text-base-content/40">Start logging entries to see your progress!</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-20" />

          <XAxis
            dataKey="displayDate"
            tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }}
            axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
          />

          <YAxis
            domain={[0, targetValue]} // Force Y-axis to go from 0 to target
            tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }}
            axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
            label={{
              value: goal.unit,
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'currentColor', opacity: 0.6, fontSize: 12 }
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Target line */}
          <ReferenceLine
            y={targetValue}
            stroke="rgb(34, 197, 94)"
            strokeWidth={2}
            strokeDasharray="6 4"
            label={{
              value: `Target: ${targetValue}`,
              position: 'right',
              fill: 'rgb(34, 197, 94)',
              fontSize: 12,
              fontWeight: 600
            }}
          />

          {/* Progress line */}
          <Line
            type="monotone"
            dataKey="progress"
            stroke="#7EA0B7"
            strokeWidth={3}
            connectNulls={false} // Don't connect to null values (end date)
            dot={{
              fill: '#7EA0B7',
              strokeWidth: 2,
              r: 5,
              stroke: '#fff'
            }}
            activeDot={{
              r: 7,
              strokeWidth: 2
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 rounded" style={{ backgroundColor: '#7EA0B7' }}></div>
          <span className="text-base-content/60">Your Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-success rounded opacity-60"></div>
          <span className="text-base-content/60">Target ({targetValue} {goal.unit})</span>
        </div>
      </div>
    </div>
  )
}
