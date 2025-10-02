import { useState, createContext, useContext } from "react";

const FormContxt = createContext({
  formData: {},
  handleChange: () => { },
});

export const useFormContext = () => {
  const context = useContext(FormContxt);
  if (!context) {
    console.error("Form comps must be in a valid Form component.");
  }
  return context;
};

export const Form = ({
  formHeader,
  children,
  initialData,
  onSubmit,
  onChange,
  onDelete,
  deleteText = "Delete",
  submitText = "Save",
  styles = {},
  registerForm = false,
  error = null
}) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      newValue = parseFloat(value);
    }

    const updatedData = { ...formData, [name]: newValue };
    setFormData(updatedData);

    if (onChange) {
      onChange(updatedData);
    }
  };

  const contextValue = { formData, handleChange };

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData);
  };

  const handleDeleteClick = () => {
    if (onDelete && window.confirm("Are you sure you want to delete?")) {
      onDelete();
    }
  };

  return (
    <div className={`card bg-neutral ${styles.formContainer}`}>
      <div className="card-body relative">
        <h2 className={`card-title text-2xl justify-center mb-4 text-primary ${styles.formTitle}`}>
          {formHeader}
        </h2>
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
          <FormContxt.Provider value={contextValue}>
            {children}
          </FormContxt.Provider>
          <button
            type="submit"
            className="btn btn-primary w-full mt-6"
          >
            {submitText}
          </button>
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
        {/* Login Link */}
        {registerForm && (
          <p className="text-center mt-6 text-sm text-accent-content opacity-70">
            Already have an account?{" "}
            <a href="#" className="link link-primary font-medium">
              Log in
            </a>
          </p>
        )}
      </div>
    </div>
  );
};
