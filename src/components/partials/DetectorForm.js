import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "./Form";
import ButtonGroup from "./ButtonGroup";
import ErrorCard from "./ErrorCard";

import InputText from "./Input/InputText";
import InputSelect from "./Input/InputSelect";

// TODO: validate selects values
// const statusValues = ["online", "offline", "damaged", "in-repair", "commissioned", "decommissioned"];

const DetectorForm = (props) => {
  const { detector } = props;

  const [name, setName] = useState(detector ? detector.name : "");
  const [description, setDescription] = useState(
    detector ? detector.description : ""
  );
  const [status, setStatus] = useState(detector ? detector.status : "");
  const [agentCode, setAgentCode] = useState(
    detector ? detector.agent_code : ""
  );

  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [agentCodeError, setAgentCodeError] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const resetErrors = () => {
    setError("");
    setNameError("");
    setDescriptionError("");
    setStatusError("");
    setAgentCodeError("");
  };

  const validateForm = () => {
    var anyError = false;

    if (!name) {
      setNameError("Name cannot be blank.");
      anyError = true;
    }

    if (!description) {
      setDescriptionError("Description cannot be blank.");
      anyError = true;
    }

    if (!status) {
      setStatusError("Status cannot be blank.");
      anyError = true;
    }
    // TODO: validate selects values
    // if (!statusValues.includes(status)) {
    //   setStatusError("Status cannot be other than the defined ones.");
    //   anyError = true;
    // }

    if (!agentCode) {
      setAgentCodeError("Agent code cannot be blank.");
      anyError = true;
    }

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
    formDetails.append("description", description);
    formDetails.append("status", status);
    formDetails.append("agent_code", agentCode);
    formDetails.append("token", localStorage.getItem("token"));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/detectors/${
          detector ? `${detector.id}/edit` : "new"
        }`,
        {
          method: detector ? "PATCH" : "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formDetails,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Authentication failed!");
      } else {
        navigate(detector ? `/detectors/${detector.id}` : "/detectors");
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
        name="description"
        value={description}
        setValue={setDescription}
        error={descriptionError}
        required
      />
      <InputSelect
        name="status"
        value={status}
        setValue={setStatus}
        error={statusError}
        selectOptions={[
          { value: "", label: "-" },
          { value: "online", label: "Online" },
          { value: "offline", label: "Offline" },
          { value: "damaged", label: "Damaged" },
          { value: "in-repair", label: "In-repair" },
          { value: "commissioned", label: "Commissioned" },
          { value: "decommissioned", label: "Decommissioned" },
        ]}
        required
      />
      <InputText
        name="agent code"
        value={agentCode}
        setValue={setAgentCode}
        error={agentCodeError}
        required
      />
      <ButtonGroup>
        <a href={detector ? `/detectors/${detector.id}` : "/detectors"}>
          Cancel
        </a>
        <button type="submit" disabled={loading} className="btn-primary">
          Save
        </button>
      </ButtonGroup>
    </Form>
  );
};

export default DetectorForm;
