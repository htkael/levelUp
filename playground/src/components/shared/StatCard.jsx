
export const StatCard = ({ name, value, icon, subtitle, bg = "bg-base-100" }) => {
  return (
    <div className={`stat ${bg} rounded-lg shadow-sm`}>
      <div className="stat-figure text-primary">
        {icon}
      </div>
      <div className="stat-title">{name}</div>
      <div className="stat-value text-primary">{value}</div>
      <div className="stat-desc">{subtitle}</div>
    </div>
  )
}
