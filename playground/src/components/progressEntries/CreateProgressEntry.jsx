import { useState } from "react"
import { useActivityMetrics } from "../../hooks/useActivityMetrics"
import { useCreateProgressEntry } from "../../hooks/mutations/useCreateProgressEntry"
import { useActivities } from "../../hooks/useActivities.js"
import { FormModal } from "../forms/FormModal"
import { CheckboxInput, DateInput, NumberInput, SelectInput, TextArea } from "../forms/FormInputs"
import { getTodayLocal } from "../../utils/dateHelpers.js"
import { useUpdateProgressEntry } from "../../hooks/mutations/useUpdateProgressEntry.js"

export const CreateProgressEntry = ({ isOpen, onClose, activityId = null, initialData }) => {
  if (!initialData) {
    initialData = {
      activityId: activityId ? activityId : null,
      entryDate: getTodayLocal(),
      notes: "",
      metrics: []
    }
  }

  const filters = {
    categoryId: undefined,
    isActive: true
  }

  const [formData, setFormData] = useState(initialData)

  if (initialData?.id) {
  }

  const { data: activities, isLoading: isActLoading, error: activityError } = useActivities(filters)
  const { data: metrics, isLoading, error } = useActivityMetrics(formData.activityId)
  const { mutate: createProgressEntry, isPending: isCreatePending, error: createError } = useCreateProgressEntry()
  const { mutate: updateProgressEntry, isPending: isUpdatePending, error: updateError } = useUpdateProgressEntry()

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
    if (!initialData.id) {
      createProgressEntry(formData, {
        onSuccess: () => {
          setFormData(initialData)
          onClose()
        }
      })
    } else {
      const cleanedData = {
        id: formData.id,
        notes: formData.notes,
        activityId: formData.activityId,
        entryDate: formData.entryDate,
        metrics: formData.metrics.map((m) => {
          return {
            value: m.value,
            metricId: m.metricId
          }
        })
      }
      updateProgressEntry(cleanedData, {
        onSuccess: () => {
          onClose()
        }
      })
    }
  }

  const getMetricValue = (metricId) => {
    const metric = formData.metrics.find(m => m.metricId === metricId)
    return metric ? metric.value : ""
  }

  const formError = error || createError || activityError || updateError
  const isPending = isCreatePending || isUpdatePending


  return (
    <FormModal
      formHeader={initialData?.id ? "Edit Progress Entry" : "Create Progress Entry"}
      isOpen={isOpen}
      onClose={onClose}
      formData={formData}
      setFormData={setFormData}
      handleChange={handleChange}
      onSubmit={handleSubmit}
      error={formError}
      submitDisabled={isLoading || isPending || isActLoading}
      submitText={isPending ? "Saving..." : initialData?.id ? "Save" : "Create Activity"}
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
                    presetValue={getMetricValue(m.id)}
                  />
                </div>
              ) : (
                <NumberInput
                  name={`metric-${m.id}`}
                  label=""
                  placeholder={`Enter ${m.metricName.toLowerCase()}`}
                  step={m.metricType === "duration" ? "1" : "0.01"}
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
