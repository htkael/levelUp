import { useState, useEffect } from "react"
import { FormProvider } from "../../contexts/FormContext"

export const FormModal = ({
  isOpen,
  onClose,
  formHeader,
  children,
  initialData = {},
  onSubmit,
  onChange,
  onDelete,
  deleteText = "Delete",
  submitText = "Save",
  error = null,
  size = "md",
  submitDisabled,
  formData: externalFormData,
  setFormData: externalSetFormData,
  handleChange: externalHandleChange,
}) => {
  const [internalFormData, setInternalFormData] = useState(initialData)

  const formData = externalFormData !== undefined ? externalFormData : internalFormData
  const setFormData = externalSetFormData || setInternalFormData

  const internalHandleChange = (e) => {
    const { name, value, type, checked } = e.target
    let newValue = value
    if (type === "checkbox") {
      newValue = checked
    } else if (type === "number") {
      newValue = parseFloat(value)
    }
    const updatedData = { ...formData, [name]: newValue }
    setFormData(updatedData)
    if (onChange) {
      onChange(updatedData)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setInternalFormData(initialData)
    }
  }, [isOpen, initialData])

  const handleChange = externalHandleChange || internalHandleChange

  const contextValue = { formData, handleChange }

  const handleSubmit = (e) => {
    if (!externalFormData) {
      setFormData(initialData)
    }
    e.preventDefault()
    onSubmit(formData)
  }

  const handleDeleteClick = () => {
    if (onDelete && window.confirm("Are you sure you want to delete?")) {
      onDelete()
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  }

  return (
    <div className="modal modal-open">
      <div className={`modal-box ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        {/* Close button */}
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={handleClose}
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6">{formHeader}</h2>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormProvider value={contextValue}>
            {children}
          </FormProvider>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitDisabled}>
              {submitText}
            </button>
          </div>
        </form>

        {onDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="btn btn-outline btn-error w-full mt-4"
          >
            {deleteText}
          </button>
        )}
      </div>

      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  )
}
