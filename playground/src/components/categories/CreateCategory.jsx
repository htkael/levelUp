import { FormModal } from "../forms/FormModal.jsx"
import { TextInput, TextArea, ColorInput } from "../forms/FormInputs.jsx"
import { useCreateCategory } from "../../hooks/mutations/useCreateCategory.js"

export const CreateCategory = ({ isOpen, onClose }) => {
  const initialData = {
    name: "",
    description: "",
    color: "#7EA0B7"
  }

  const { mutate: createCategory, isPending, error } = useCreateCategory()

  const handleSubmit = (formData) => {
    createCategory(formData, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  return (
    <FormModal
      formHeader="Create New Category"
      initialData={initialData}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={isPending ? "Creating..." : "Create Category"}
      error={error?.message}
      size="md"
      submitDisabled={isPending}
    >
      <TextInput
        name="name"
        label="Category Name"
        placeholder="e.g., Fitness, Learning, Health"
        required
        disabled={isPending}
      />
      <TextArea
        name="description"
        label="Description"
        placeholder="What will you track in this category?"
        disabled={isPending}
      />
      <ColorInput
        name="color"
        label="Color"
        disabled={isPending}
      />
    </FormModal>
  )
}
