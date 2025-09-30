import { EmailInput, TextInput, PasswordInput } from "../components/forms/FormInputs.jsx"
import { Form } from "../components/forms/Form.jsx"
import { api } from "../utils/api.js";

export default function Register() {
  const initialData = {
    email: '',
    username: '',
    password: '',
    passwordConf: '',
    firstName: '',
    lastName: ''
  };

  const handleSubmit = async (formData) => {
    const response = await api("POST", "/no-auth/create-user", { user: formData })
    console.log("response", response)
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">
            LevelUp
          </h1>
          <p className="text-lg text-secondary">
            Start Your Journey
          </p>
        </div>

        <Form formHeader={"Create Account"} initialData={initialData} onSubmit={handleSubmit} submitText='Begin Your Journey' registerForm={true}>
          <EmailInput label="Email *" name="email" required />
          <TextInput label="Username *" name="username" required />
          <TextInput label="First Name" name="firstName" />
          <TextInput label="Last Name" name="lastName" />
          <PasswordInput label="Password *" name="password" required />
          <PasswordInput label="Confirm Password *" name="passwordConf" required />
        </Form>
      </div>
    </div>
  );
}
