import { METRIC_TYPE_OPTIONS } from "../../constants/metricTypes"
import { useCreateMetricType } from "../../hooks/mutations/useCreateMetricType"
import { useUpdateActivityMetric } from "../../hooks/mutations/useUpdateActivityMetric"
import { CheckboxInput, SelectInput, TextInput } from "../forms/FormInputs"
import { FormModal } from "../forms/FormModal"

export const CreateMetricType = ({ initialData, isOpen, onClose, activityId }) => {
  const { mutate: createMetricType, isPending: isCreatePending, error: createError } = useCreateMetricType()
  const { mutate: updateMetricType, isPending: isUpdatePending, error: updateError } = useUpdateActivityMetric()

  const isPending = isCreatePending || isUpdatePending
  const error = createError || updateError

  if (!initialData) {
    initialData = {
      metricName: "",
      metricType: "",
      unit: "",
      isPrimary: false,
      activityId: activityId
    }
  }

  const handleSubmit = (data) => {
    let payload = { ...data, activityId }
    if (!initialData?.metricId) {
      createMetricType(payload, {
        onSuccess: () => {
          onClose()
        }
      })
    } else {
      payload = { ...payload, id: initialData.metricId }
      updateMetricType({ ...payload, id: initialData.metricId }, {
        onSuccess: () => {
          onClose()
        }
      })
    }
  }

  return (
    <FormModal
      formHeader={initialData?.metricId ? "Edit Metric" : "Create Metric"}
      initialData={initialData}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error?.message}
      size="md"
      submitDisabled={isPending}
      submitText={isPending ? "Submitting..." : "Submit"}
    >
      <TextInput
        name="metricName"
        label="Metric Name"
        placeholder="e.g., Distance, Duration, Weight"
        required
        disabled={isPending}
      />
      <SelectInput
        name="metricType"
        label="Metric Type"
        required
        disabled={isPending}
        options={METRIC_TYPE_OPTIONS}
      />
      <TextInput
        name="unit"
        label="Unit"
        disabled={isPending}
        placeholder="e.g., miles, kg, minutes, reps"
      />
      <CheckboxInput
        name="isPrimary"
        label="Primary Metric?"
        disabled={isPending}
      />
    </FormModal>
  )
}
