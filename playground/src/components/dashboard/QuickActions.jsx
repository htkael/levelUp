import {
  PlusIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { CreateProgressEntry } from "../progressEntries/CreateProgressEntry.jsx"
import { CreateActivity } from "../activities/CreateActivity.jsx"
import { CreateCategory } from "../categories/CreateCategory.jsx"

export const QuickActions = () => {
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Quick Actions</h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-6">
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddEntryOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Entry
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsAddActivityOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-1" />
              New Activity
            </button>
            <button className="btn btn-accent btn-sm" onClick={() => setIsAddCategoryOpen(true)}>
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
      {isAddEntryOpen && (
        <CreateProgressEntry
          isOpen={isAddEntryOpen}
          onClose={() => setIsAddEntryOpen(false)}
        />
      )}
      {isAddActivityOpen && (
        <CreateActivity
          isOpen={isAddActivityOpen}
          onClose={() => setIsAddActivityOpen(false)}
        />
      )}
      {isAddCategoryOpen && (
        <CreateCategory
          isOpen={isAddCategoryOpen}
          onClose={() => setIsAddCategoryOpen(false)}
        />
      )}
    </div>
  )
}
