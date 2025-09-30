import { useState } from "react";
import { useFormContext } from "./Form";
import { EyeIcon } from "../../shared/icons";
import { FaEyeSlash } from "react-icons/fa"


export const FormInput = ({
  label,
  name,
  type = "text",
  options = null,
  min,
  max,
  styles,
  ...props
}) => {
  if (!styles) {
    styles = {
      wrapper: `form-control `,
      label: "label-text text-secondary",
      input:
        "input input-ghost validator input-bordered w-full bg-base-100 text-base-content",
      select:
        "select w-full bg-base-100 text-base-content",
      textarea:
        "textarea",
    }
  }

  const { formData, handleChange } = useFormContext()
  const value = formData[name] || ""

  if (type === "select" && options) {
    return (
      <div className={styles.wrapper}>
        <label className="label">
          <span className={styles.label}>
            {label}
          </span>
        </label>
        <select
          id={name}
          className={styles.select}
          name={name}
          value={value}
          onChange={handleChange}
          {...props}
        >
          <option value="" disabled selected>
            {label}
          </option>
          {options?.map((o, i) => (
            <option key={i} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={styles.wrapper}>
        <label className="label">
          <span className={styles.label}>
            {label}
          </span>
        </label>
        <textarea
          id={name}
          className={styles.textarea}
          name={name}
          value={value}
          onChange={handleChange}
          {...props}
        >
        </textarea>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <label className="label">
        <span className={styles.label}>
          {label}
        </span>
      </label>

      {/* Hidden input to block autofill */}
      <input
        type="text"
        name={`fake-${name}`}
        autoComplete="username"
        style={{ display: "none" }}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/*  Real input */}
      <input
        id={name}
        className={styles.input}
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={type === "date" ? (e) => e.target.showPicker() : undefined}
        autoComplete="nope"
        min={min}
        max={max}
        {...props}
      />

    </div>
  );
}

export const TextInput = ({
  label,
  name,
  styles,
  ...props
}) => {
  return (
    <FormInput
      label={label}
      name={name}
      type="text"
      styles={styles}
      {...props}
    />
  );
};

export const DateInput = ({
  label,
  name,
  styles,
  ...props
}) => {

  return (
    <FormInput
      label={label}
      name={name}
      type="date"
      styles={styles}
      {...props}
    />
  );
};

export const TimeInput = ({
  label,
  name,
  styles,
  ...props
}) => {
  return (
    <FormInput
      label={label}
      name={name}
      type="time"
      styles={styles}
      onFocus={(e) => e.target.showPicker()}
      onClick={(e) => e.target.showPicker()}
      {...props}
    />
  );
};

export const SelectInput = ({
  label,
  name,
  options,
  styles,
  ...props
}) => {
  return (
    <>
      <FormInput
        label={label}
        name={name}
        type="select"
        options={options}
        styles={styles}
        {...props}
      />
    </>
  );
};

export const NumberInput = ({
  label,
  name,
  styles,
  min,
  max,
  ...props
}) => {
  return (
    <FormInput
      label={label}
      name={name}
      type="number"
      styles={styles}
      min={min}
      max={max}
      {...props}
    />
  );
};

export const TextArea = ({
  label,
  name,
  styles,
  ...props
}) => {
  return (
    <FormInput
      label={label}
      name={name}
      type="textarea"
      styles={styles}
      {...props}
    />
  );
};

export const PasswordInput = ({ label, name, styles, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  if (!styles) {
    styles = {
      wrapper: `form-control w-full`,
      label: "label-text text-secondary",
      input: "input input-bordered w-full bg-base-100 text-base-content pr-12",
      inputWrapper: "relative"
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = showPassword ? "text" : "password";

  const { formData, handleChange } = useFormContext()
  const value = formData[name] || ""

  return (
    <div className={styles.wrapper}>
      <label className="label">
        <span className={styles.label}>
          {label}
        </span>
      </label>
      <input
        type="text"
        name={`fake-${name}`}
        autoComplete="username"
        style={{ display: "none" }}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div className={styles.inputWrapper || "relative"}>
        <input
          id={name}
          className={styles.input}
          type={inputType}
          name={name}
          value={value}
          onChange={handleChange}
          autoComplete="current-password"
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content opacity-60 hover:opacity-100 transition-opacity"
        >
          {showPassword ? (
            <FaEyeSlash className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export const EmailInput = ({
  label,
  name,
  styles,
  ...props
}) => {
  return (
    <FormInput
      label={label}
      name={name}
      type="email"
      styles={styles}
      {...props}
    />
  );
};
