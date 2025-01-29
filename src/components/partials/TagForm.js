import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "./Form";
import ButtonGroup from "./ButtonGroup";
import ErrorCard from "./ErrorCard";

import InputText from "./Input/InputText";
import Tag from "./Tag";

const TagForm = (props) => {
  const { tag } = props;

  const [name, setName] = useState(tag ? tag.name : "");
  const [description, setDescription] = useState(tag ? tag.description : "");
  const [color, setColor] = useState(tag ? tag.color : "000000");

  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [colorError, setColorError] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const resetErrors = () => {
    setError("");
    setNameError("");
    setDescriptionError("");
    setColorError("");
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

    if (!color) {
      setColorError("Color cannot be blank.");
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
    formDetails.append("color", color);
    formDetails.append("token", localStorage.getItem("token"));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/tags/${
          tag ? `${tag.id}/edit` : "new"
        }`,
        {
          method: tag ? "PATCH" : "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formDetails,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Authentication failed!");
      } else {
        navigate(tag ? `/tags/${tag.id}` : "/tags");
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
        name="color"
        value={color}
        setValue={setColor}
        error={colorError}
        required
        maxLength="8"
      />
      <div className="flex items-center gap-4">
        <h2>Tag preview:</h2>
        <Tag name={name} color={color} />
      </div>
      <ButtonGroup>
        <a href={tag ? `/tags/${tag.id}` : "/tags"}>Cancel</a>
        <button type="submit" disabled={loading} className="btn-primary">
          Save
        </button>
      </ButtonGroup>
    </Form>
  );
};

export default TagForm;
