import {
  PlusIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"

export const QuickActions = () => {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Quick Actions</h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-6">
            <button className="btn btn-primary btn-sm">
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Entry
            </button>
            <button className="btn btn-secondary btn-sm">
              <PlusIcon className="w-4 h-4 mr-1" />
              New Activity
            </button>
            <button className="btn btn-accent btn-sm">
              <PlusIcon className="w-4 h-4 mr-1" />
              New Category
            </button>
            <button className="btn btn-outline btn-sm">
              <ChartBarIcon className="w-4 h-4 mr-1" />
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
