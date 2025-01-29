import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "./Form";
import ButtonGroup from "./ButtonGroup";
import ErrorCard from "./ErrorCard";

import InputText from "./Input/InputText";
import InputSelect from "./Input/InputSelect";
import InputPassword from "./Input/InputPassword";

// TODO: validate selects values
// const roleValues = ["", "shifter", "coordinator", "admin"];

const UserForm = (props) => {
  const { user } = props;

  const [name, setName] = useState(user ? user.name : "");
  const [email, setEmail] = useState(user ? user.email : "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user ? user.role : "");

  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const resetErrors = () => {
    setError("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setRoleError("");
  };

  const validateForm = () => {
    var anyError = false;

    if (!name) {
      setNameError("Name cannot be blank.");
      anyError = true;
    }

    if (!email) {
      setEmailError("Email cannot be blank.");
      anyError = true;
    }

    if (!user && !password) {
      setPasswordError("Password cannot be blank.");
      anyError = true;
    }

    // TODO: validate selects values
    // if (!roleValues.includes(role)) {
    //   setRoleError("Role cannot be other than the defined ones.");
    //   anyError = true;
    // }

    if (anyError) return false;

    resetErrors();
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetErrors();
    if (!validateForm()) return;
    setLoading(true);

    const formDetails = new URLSearchParams();
    formDetails.append("name", name);
    formDetails.append("email", email);
    if (!user) formDetails.append("password", password);
    formDetails.append("role", role);
    formDetails.append("token", localStorage.getItem("token"));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/users/${
          user ? `${user.id}/edit` : "new"
        }`,
        {
          method: user ? "PATCH" : "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formDetails,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Authentication failed!");
      } else {
        navigate(user ? `/users/${user.id}` : "/users");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <ErrorCard>{error}</ErrorCard>}
      <InputText
        name="name"
        value={name}
        setValue={setName}
        error={nameError}
        required
      />
      <InputText
        name="email"
        value={email}
        setValue={setEmail}
        error={emailError}
        required
      />
      {!user && (
        <InputPassword setPassword={setPassword} error={passwordError} />
      )}
      <InputSelect
        name="role"
        value={role}
        setValue={setRole}
        error={roleError}
        selectOptions={[
          { value: "", label: "User" },
          { value: "shifter", label: "Shifter" },
          { value: "coordinator", label: "Coordinator" },
          { value: "admin", label: "Admin" },
        ]}
      />
      <ButtonGroup>
        <a href={user ? `/users/${user.id}` : "/users"}>Cancel</a>
        <button type="submit" disabled={loading} className="btn-primary">
          Save
        </button>
      </ButtonGroup>
    </Form>
  );
};

export default UserForm;
