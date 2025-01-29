import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Form from "./Form";
import ButtonGroup from "./ButtonGroup";
import ErrorCard from "./ErrorCard";

import InputText from "./Input/InputText";
import InputTextarea from "./Input/InputTextarea";
import InputSelect from "./Input/InputSelect";
import InputNumber from "./Input/InputNumber";

const MeasurementForm = (props) => {
  const { measurement } = props;

  const { experiment_id } = useParams();

  const [shifters, setShifters] = useState([]);

  const [name, setName] = useState(measurement ? measurement.name : "");
  const [description, setDescription] = useState(
    measurement ? measurement.description : ""
  );
  const [directory, setDirectory] = useState(
    measurement ? measurement.directory : ""
  );
  const [numberOfFiles, setNumberOfFiles] = useState(
    measurement ? measurement.number_of_files : ""
  );
  const [patientReference, setPatientReference] = useState(
    measurement ? measurement.patient_reference : ""
  );
  const [shifterId, setShifterId] = useState(
    measurement ? measurement.shifter_id : ""
  );

  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [directoryError, setDirectoryError] = useState("");
  const [numberOfFilesError, setNumberOfFilesError] = useState("");
  const [patientReferenceError, setPatientReferenceError] = useState("");
  const [shifterIdError, setShifterIdError] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const verifyToken = useCallback(
    async (token) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_SOURCE}/verify-token/${token}`,
          { method: "GET" }
        );
        if (!response.ok) {
          throw new Error("Token verifiation failed");
        }
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
      }
    },
    [navigate]
  );

  const fetchShifters = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/users?role=shifter`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch shifters");
      }
      const data = await response.json();
      if (!measurement) data.unshift({ id: "", name: "-" });
      setShifters(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken, measurement]);

  useEffect(() => {
    fetchShifters();
  }, [fetchShifters]);

  const resetErrors = () => {
    setError("");
    setNameError("");
    setDescriptionError("");
    setDirectoryError("");
    setNumberOfFilesError("");
    setPatientReferenceError("");
    setShifterIdError("");
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

    if (!directory) {
      setDirectoryError("Directory cannot be blank.");
      anyError = true;
    }

    if (numberOfFiles === "") {
      setNumberOfFilesError("Number of files cannot be blank.");
      anyError = true;
    }
    if (numberOfFiles < 0) {
      setNumberOfFilesError("Number must be 0 or greater.");
      anyError = true;
    }

    if (!patientReference) {
      setPatientReferenceError("Patient reference cannot be blank.");
      anyError = true;
    }

    if (!shifterId) {
      setShifterIdError("Shifter cannot be blank.");
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
    formDetails.append("directory", directory);
    formDetails.append("number_of_files", numberOfFiles);
    formDetails.append("patient_reference", patientReference);
    formDetails.append("shifter_id", shifterId);
    if (!measurement) formDetails.append("experiment_id", experiment_id);

    formDetails.append("token", localStorage.getItem("token"));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/measurements/${
          measurement ? `${measurement.id}/edit` : "new"
        }`,
        {
          method: measurement ? "PATCH" : "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formDetails,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Authentication failed!");
      } else {
        navigate(
          measurement
            ? `/experiments/${measurement.experiment_id}/measurements/${measurement.id}`
            : `/experiments/${experiment_id}`
        );
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
      <InputText
        name="directory"
        value={directory}
        setValue={setDirectory}
        error={directoryError}
        required
      />
      <InputNumber
        name="number of files"
        value={numberOfFiles}
        setValue={setNumberOfFiles}
        error={numberOfFilesError}
        required
      />
      <InputTextarea
        name="patient reference"
        value={patientReference}
        setValue={setPatientReference}
        error={patientReferenceError}
        required
      />
      <InputSelect
        name="shifter"
        value={shifterId}
        setValue={setShifterId}
        error={shifterIdError}
        selectOptions={shifters.map((shifter) => {
          return { value: shifter.id, label: shifter.name };
        })}
        required
      />
      <ButtonGroup>
        <a
          href={
            measurement
              ? `/experiments/${measurement.experiment_id}/measurements/${measurement.id}`
              : `/experiments/${experiment_id}`
          }
        >
          Cancel
        </a>
        <button type="submit" disabled={loading} className="btn-primary">
          Save
        </button>
      </ButtonGroup>
    </Form>
  );
};

export default MeasurementForm;
