import { useState } from "react"
import { useCreateGoal } from "../../hooks/mutations/useCreateGoal"
import { useActivities } from "../../hooks/useActivities"
import { useActivityMetrics } from "../../hooks/useActivityMetrics.js"
import { DateInput, NumberInput, SelectInput } from "../forms/FormInputs"
import { FormModal } from "../forms/FormModal"
import { toast } from "react-toastify"

export const CreateGoal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    targetValue: null,
    targetPeriod: null,
    startDate: null,
    endDate: null,
    activityId: null,
    metricId: null
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let newValue = value
    if (selectedMetric?.metricType === "boolean") {
      toast.error("Cannot select a true/false metric for a goal")
    }
    if (type === "checkbox") {
      newValue = checked
    } else if (type === "number") {
      newValue = parseFloat(value)
    }
    const updatedData = { ...formData, [name]: newValue }
    setFormData(updatedData)
  }

  const { mutate: createGoal, isPending, error } = useCreateGoal()
  const { data: activityMetrics, isLoading: isMetricsLoading } = useActivityMetrics(formData?.activityId)

  const filters = {
    categoryId: undefined,
    isActive: true
  }

  const { data: activities, isLoading } = useActivities(filters)

  const activityOptions = isLoading ? [{ label: "Loading...", value: null }] : activities.map((a) => {
    return {
      value: a.id,
      label: a.name,
    }
  })

  const metricOptions = formData?.activityId ? isMetricsLoading ? [{ label: "Loading...", value: null }] : activityMetrics.map((m) => {
    return {
      value: m.id,
      label: m.metricName
    }
  }) : [{ value: null, label: "Select activity to choose metric" }]

  const periodOptions = [
    {
      value: "DAILY",
      label: "Daily"
    },
    {
      value: "WEEKLY",
      label: "Weekly"
    },
    {
      value: "MONTHLY",
      label: "Monthly"
    },
    {
      value: "QUARTERLY",
      label: "Quarterly"
    },
    {
      value: "YEARLY",
      label: "Yearly"
    },
    {
      value: "TOTAL",
      label: "Non recurring goal"
    }
  ]

  const handleSubmit = (formData) => {
    const cleanedData = {
      ...formData,
      activityId: Number(formData?.activityId),
      metricId: Number(formData?.metricId),
    }
    createGoal(cleanedData, {
      onSuccess: () => {
        setFormData({
          targetValue: null,
          targetPeriod: null,
          startDate: null,
          endDate: null,
          activityId: null,
          metricId: null
        })
        onClose()
      }
    })
  }

  const selectedMetric = activityMetrics?.find(m => m.id === Number(formData?.metricId))

  return (
    <FormModal
      formHeader="Create Goal"
      formData={formData}
      setFormData={setFormData}
      handleChange={handleChange}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={isPending ? "Creating..." : "Create Goal"}
      error={error?.message}
      size="lg"
    >
      <SelectInput
        name="activityId"
        label="Which activity will this goal belong to?"
        options={activityOptions}
        required
        disabled={isPending}
      />
      {formData?.activityId && (
        <SelectInput
          name="metricId"
          label="Which metric do you want to track for this goal?"
          options={metricOptions}
          required
          disabled={isPending}
        />
      )}
      <SelectInput
        name="targetPeriod"
        label="Recurring Period"
        options={periodOptions}
        required
        disabled={isPending}
      />
      {selectedMetric && (
        <NumberInput
          name="targetValue"
          label={`Target Value ${selectedMetric?.unit ? `- ${selectedMetric.unit}` : ``}`}
          required
          disabled={isPending}
        />
      )}

      <DateInput
        name="startDate"
        label="When do you want to start this goal?"
        maxToday={false}
        required
        disabled={isPending}
      />

      {formData?.targetPeriod === "TOTAL" && (
        <DateInput
          name="endDate"
          label="When do you want to end this goal?"
          minDate={formData?.startDate}
          maxToday={false}
          required
          disabled={isPending}
        />
      )}
    </FormModal>

  )
}
