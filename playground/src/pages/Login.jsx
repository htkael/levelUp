import { useContext, useEffect, useState } from "react";
import { Form } from "../components/forms/Form";
import { PasswordInput, TextInput } from "../components/forms/FormInputs";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";


const registerLink = () => {
  return (
    <p className="text-center mt-6 text-sm text-accent-content opacity-70">
      Don't have an account?{" "}
      <a href="/register" className="link link-primary font-medium">
        Register
      </a>
    </p>
  )
}

export const Login = () => {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, handleLogin } = useContext(AuthContext)
  const navigate = useNavigate()

  const initialData = {
    email: '',
    password: '',
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const login = async (data) => {
    setError(null)
    setLoading(true)
    let resp = await handleLogin(data.email, data.password)
    console.log("resp", resp)
    if (resp?.error) {
      setError(resp.error)
      setLoading(false)
    }
    setLoading(false)
    return
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">
            LevelUp
          </h1>
          <p className="text-lg text-secondary">
            Jump Back In
          </p>
        </div>

        <Form formHeader={"Login"} initialData={initialData} onSubmit={login} submitText='Enter' error={error} link={registerLink}>
          {loading && (
            <span className="loading loading-infinity loading-xl"></span>
          )}
          {!loading && (
            <>
              <TextInput label="Email/Username" name="email" required />
              <PasswordInput label="Password" name="password" required />
            </>
          )}
        </Form>
      </div>
    </div>
  );
}
