import { EmailInput, TextInput, PasswordInput } from "../components/forms/FormInputs.jsx"
import { Form } from "../components/forms/Form.jsx"
import { api } from "../utils/api.js";
import { useState } from "react";
import { validateRegister } from "../utils/validators.js";

export default function Register() {
  const [error, setError] = useState(null)
  const initialData = {
    email: 'htkael@gmail.com',
    username: 'hunter.dev',
    password: 'Password!123',
    passwordConf: 'Password!123',
    firstName: '',
    lastName: ''
  };

  const handleSubmit = async (formData) => {
    const registerTest = validateRegister(formData)
    if (registerTest) {
      setError(registerTest)
    }
    const response = await api("POST", "/no-auth/create-user", { user: formData })
    if (response?.error) {
      setError(response.error)
    }
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

        <Form formHeader={"Create Account"} initialData={initialData} onSubmit={handleSubmit} submitText='Begin Your Journey' registerForm={true} error={error}>
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
