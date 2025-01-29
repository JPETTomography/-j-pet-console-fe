import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Form from "./Form";
import ButtonGroup from "./ButtonGroup";
import ErrorCard from "./ErrorCard";

import InputText from "./Input/InputText";
import InputSelect from "./Input/InputSelect";
import InputDate from "./Input/InputDate";

// TODO: validate selects values
// const statusValues = ["draft", "ongoing", "closed", "archived"];

const ExperimentForm = (props) => {
  const { experiment } = props;

  const [coordinators, setCoordinators] = useState([]);
  const [detectors, setDetectors] = useState([]);

  const [name, setName] = useState(experiment ? experiment.name : "");
  const [description, setDescription] = useState(
    experiment ? experiment.description : ""
  );
  const [status, setStatus] = useState(experiment ? experiment.status : "");
  const [location, setLocation] = useState(
    experiment ? experiment.location : ""
  );
  const [startDate, setStartDate] = useState(
    experiment ? experiment.start_date : ""
  );
  const [endDate, setEndDate] = useState(
    experiment ? experiment.end_date || "" : ""
  );
  const [coordinatorId, setCoordinatorId] = useState(
    experiment ? experiment.coordinator_id : ""
  );
  const [detectorId, setDetectorId] = useState(
    experiment ? experiment.detector_id : ""
  );

  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [coordinatorIdError, setCoordinatorIdError] = useState("");
  const [detectorIdError, setDetectorIdError] = useState("");

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

  const fetchCoordinators = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/users?role=coordinator`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch coordinators");
      }
      const data = await response.json();
      if (!experiment) data.unshift({ id: "", name: "-" });
      setCoordinators(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken, experiment]);

  const fetchDetectors = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/detectors`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch detectors");
      }
      const data = await response.json();
      if (!experiment) data.unshift({ id: "", name: "-" });
      setDetectors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken, experiment]);

  useEffect(() => {
    fetchCoordinators();
    fetchDetectors();
  }, [fetchCoordinators, fetchDetectors]);

  const resetErrors = () => {
    setError("");
    setNameError("");
    setDescriptionError("");
    setStatusError("");
    setLocationError("");
    setStartDateError("");
    setEndDateError("");
    setCoordinatorIdError("");
    setDetectorIdError("");
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

    if (!location) {
      setLocationError("Location cannot be blank.");
      anyError = true;
    }

    if (!startDate) {
      setStartDateError("Start date cannot be blank.");
      anyError = true;
    }

    if (startDate && endDate && endDate < startDate) {
      setEndDateError("End date must be after start date.");
      anyError = true;
    }

    if (!coordinatorId) {
      setCoordinatorIdError("Coordinator cannot be blank.");
      anyError = true;
    }

    if (!detectorId) {
      setDetectorIdError("Detector cannot be blank.");
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
    formDetails.append("location", location);
    formDetails.append("start_date", startDate);
    formDetails.append("end_date", endDate);
    formDetails.append("coordinator_id", coordinatorId);
    formDetails.append("detector_id", detectorId);
    formDetails.append("token", localStorage.getItem("token"));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/experiments/${
          experiment ? `${experiment.id}/edit` : "new"
        }`,
        {
          method: experiment ? "PATCH" : "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formDetails,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Authentication failed!");
      } else {
        navigate(experiment ? `/experiments/${experiment.id}` : "/experiments");
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
          { value: "draft", label: "Draft" },
          { value: "ongoing", label: "Ongoing" },
          { value: "closed", label: "Closed" },
          { value: "archived", label: "Archived" },
        ]}
        required
      />
      <InputText
        name="location"
        value={location}
        setValue={setLocation}
        error={locationError}
        required
      />
      <InputDate
        name="start date"
        value={startDate}
        setValue={setStartDate}
        error={startDateError}
        required
      />
      <InputDate
        name="end date"
        value={endDate}
        setValue={setEndDate}
        error={endDateError}
      />
      <InputSelect
        name="coordinator"
        value={coordinatorId}
        setValue={setCoordinatorId}
        error={coordinatorIdError}
        selectOptions={coordinators.map((coordinator) => {
          return { value: coordinator.id, label: coordinator.name };
        })}
        required
      />
      <InputSelect
        name="detector"
        value={detectorId}
        setValue={setDetectorId}
        error={detectorIdError}
        selectOptions={detectors.map((detector) => {
          return { value: detector.id, label: detector.name };
        })}
        required
      />
      <ButtonGroup>
        <a href={experiment ? `/experiments/${experiment.id}` : "/experiments"}>
          Cancel
        </a>
        <button type="submit" disabled={loading} className="btn-primary">
          Save
        </button>
      </ButtonGroup>
    </Form>
  );
};

export default ExperimentForm;
