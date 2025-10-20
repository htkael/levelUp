import { useState } from "react"
import { useActivityMetrics } from "../../hooks/useActivityMetrics"
import { useCreateProgressEntry } from "../../hooks/mutations/useCreateProgressEntry"
import { useActivities } from "../../hooks/useActivities.js"
import { FormModal } from "../forms/FormModal"
import { CheckboxInput, DateInput, NumberInput, SelectInput, TextArea } from "../forms/FormInputs"

export const CreateProgressEntry = ({ isOpen, onClose, activityId = null }) => {
  const initialData = {
    activityId: activityId ? activityId : null,
    entryDate: new Date().toISOString().split('T')[0],
    notes: "",
    metrics: []
  }

  const filters = {
    categoryId: undefined,
    isActive: true
  }

  const [formData, setFormData] = useState(initialData)

  const { data: activities, isLoading: isActLoading, error: activityError } = useActivities(filters)
  const { data: metrics, isLoading, error } = useActivityMetrics(formData.activityId)
  const { mutate: createProgressEntry, isPending, error: createError } = useCreateProgressEntry()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'activityId') {
      setFormData({
        ...formData,
        activityId: parseInt(value),
        metrics: []
      })
      return
    }

    if (name.startsWith("metric-")) {
      const metricId = parseInt(name.split("-")[1])
      let metricValue = type === "checkbox" ? checked : parseFloat(value)

      const updatedMetrics = [...formData.metrics]
      const existingIndex = updatedMetrics.findIndex(m => m.metricId === metricId)

      if (existingIndex > -1) {
        updatedMetrics[existingIndex] = { metricId, value: metricValue }
      } else {
        updatedMetrics.push({ metricId, value: metricValue })
      }

      setFormData({
        ...formData,
        metrics: updatedMetrics
      })
      return
    }

    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) : value
    })
  }

  const handleSubmit = (formData) => {
    createProgressEntry(formData, {
      onSuccess: () => {
        setFormData(initialData)
        onClose()
      }
    })
  }

  const getMetricValue = (metricId) => {
    const metric = formData.metrics.find(m => m.metricId === metricId)
    return metric ? metric.value : ""
  }

  const formError = error || createError || activityError


  return (
    <FormModal
      formHeader="Create Progress Entry"
      isOpen={isOpen}
      onClose={onClose}
      formData={formData}
      setFormData={setFormData}
      handleChange={handleChange}
      onSubmit={handleSubmit}
      error={formError}
      submitDisabled={isLoading || isPending || isActLoading}
      submitText={isPending ? "Creating..." : "Create Activity"}
    >
      {!activityId && (
        <SelectInput
          name="activityId"
          label="Which activity does this entry belong to?"
          options={activities?.map((a) => {
            return {
              value: a.id,
              label: a.name
            }
          })}
          required
        />
      )}
      <DateInput
        name="entryDate"
        label="Entry Date"
        required
      />
      {metrics && metrics.length > 0 && (
        <div className="space-y-4">
          <div className="divider">Metrics</div>
          {metrics.map((m) => (
            <div key={m.id} className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">
                  {m.metricName}
                  <span className="text-error ml-1">*</span>
                </span>
                {m.unit && (
                  <span className="label-text-alt text-base-content/60">{m.unit}</span>
                )}
              </label>

              {m.metricType === "boolean" ? (
                <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
                  <CheckboxInput
                    name={`metric-${m.id}`}
                    label="Completed"
                    required
                    presetValue={getMetricValue(m.id)}
                  />
                </div>
              ) : (
                <NumberInput
                  name={`metric-${m.id}`}
                  label=""
                  placeholder={`Enter ${m.metricName.toLowerCase()}`}
                  step={m.metricType === "duration" ? "1" : "0.01"}
                  required
                  presetValue={getMetricValue(m.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
      <TextArea
        name="notes"
        label="Notes"
      />
    </FormModal>
  )
}
