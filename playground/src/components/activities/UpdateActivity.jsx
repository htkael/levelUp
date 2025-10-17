import { FormModal } from "../forms/FormModal.jsx"
import { TextInput, TextArea, SelectInput } from "../forms/FormInputs.jsx"
import { useCategories } from "../../hooks/useCategories.js"
import { useUpdateActivity } from "../../hooks/mutations/useUpdateActivity.js"

export const UpdateActivity = ({ isOpen, onClose, activity }) => {

  const { mutate: updateActivity, isPending, error } = useUpdateActivity()
  const { data: categories, isLoading } = useCategories()

  const handleSubmit = (formData) => {
    updateActivity(formData, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const categoryOptions = categories?.map((c) => {
    return {
      value: c?.id,
      label: c?.name
    }
  })

  return (
    <FormModal
      formHeader="Edit Activity"
      initialData={activity}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={isPending ? "Editing..." : "Edit Activity"}
      error={error?.message}
      size="md"
    >
      <SelectInput
        name="categoryId"
        label="Which category will this activity belong to"
        options={isLoading ? { label: "Loading...", value: null } : categoryOptions}
        required
        disabled={isPending}
      />
      <TextInput
        name="name"
        label="Activity Name"
        placeholder="e.g., Tennis, Leetcode, Meal Prep"
        required
        disabled={isPending}
      />
      <TextArea
        name="description"
        label="Description"
        placeholder="What will you track in this activity"
        disabled={isPending}
      />
    </FormModal>
  )
}
