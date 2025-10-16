import { createContext, useContext } from "react";

const FormContext = createContext({
  formData: {},
  handleChange: () => { }
})

export const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) {
    console.error("Fomr components must be within a valid Form or FormModal comp")
  }
  return context
}

export const FormProvider = FormContext.Provider
export default FormContext
