export const FilterDropdown = ({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  placeholder = "All"
}) => {
  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="dropdown">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-sm gap-2"
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>
          {value
            ? selectedOption?.name || label
            : label
          }
        </span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow-lg bg-base-200 rounded-box w-52 mt-2 z-50 "
      >
        <div className="max-h-128 overflow-y-auto">
          {/* Clear/All option */}
          <li>
            <button
              className={`${!value ? 'active' : ''}`}
              onClick={() => onChange(null)}
            >
              {placeholder}
            </button>
          </li>

          <div className="divider my-1"></div>

          {/* Options */}
          {options.map((option) => (
            <li key={option.value}>
              <button
                className={`flex items-center gap-2 ${value === option.value ? 'active' : ''}`}
                onClick={() => onChange(option.value)}
              >
                {option.color && (
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span>{option.name}</span>
              </button>
            </li>
          ))}
        </div>
      </ul>
    </div>
  )
}
