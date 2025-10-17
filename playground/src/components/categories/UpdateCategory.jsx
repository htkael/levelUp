import { FormModal } from "../forms/FormModal.jsx"
import { TextInput, TextArea, ColorInput } from "../forms/FormInputs.jsx"
import { useUpdateCategory } from "../../hooks/mutations/useUpdateCategory.js"

export const UpdateCategory = ({ category, isOpen, onClose }) => {

  const { mutate: updateCategory, isPending, error } = useUpdateCategory()

  const handleSubmit = (formData) => {
    updateCategory(formData, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  return (
    <FormModal
      formHeader="Edit Category"
      initialData={category}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={"Save"}
      error={error?.message}
      size="md"
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
