import { FormModal } from "../forms/FormModal.jsx"
import { TextInput, TextArea, SelectInput } from "../forms/FormInputs.jsx"
import { useCreateActivity } from "../../hooks/mutations/useCreateActivity.js"
import { useCategories } from "../../hooks/useCategories.js"

export const CreateActivity = ({ isOpen, onClose, catId = null }) => {
  const initialData = {
    categoryId: catId ? catId : null,
    name: "",
    description: "",
  }

  const { mutate: createActivity, isPending, error } = useCreateActivity()
  const { data: categories, isLoading } = useCategories()

  const handleSubmit = (formData) => {
    createActivity(formData, {
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
      formHeader="Create New Activity"
      initialData={initialData}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={isPending ? "Creating..." : "Create Activity"}
      error={error?.message}
      size="md"
    >
      {!catId && (
        <SelectInput
          name="categoryId"
          label="Which category will this activity belong to"
          options={isLoading ? { label: "Loading...", value: null } : categoryOptions}
          required
          disabled={isPending}
        />
      )}
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
