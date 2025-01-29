import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import Page from "../partials/Page";
import ButtonBack from "../partials/ButtonBack";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";
import MeasurementForm from "../partials/MeasurementForm";

const MeasurementEdit = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const { measurement_id } = useParams();

  const [measurement, setMeasurement] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const data = await response.json();
        setCurrentUser(data.payload.user);
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
      }
    },
    [navigate]
  );

  const fetchMeasurement = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/measurements/${measurement_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch measurement");
      }
      const data = await response.json();
      setMeasurement(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken, measurement_id]);

  useEffect(() => {
    fetchMeasurement();
  }, [fetchMeasurement, measurement_id]);

  return (
    <Page currentUser={currentUser}>
      <ButtonBack path={`/experiments/${measurement.experiment_id}`}>
        Back to the experiment
      </ButtonBack>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchMeasurement} />
      ) : (
        <>
          <h1>Edit measurement - {measurement.name}</h1>
          <MeasurementForm measurement={measurement} />
        </>
      )}
    </Page>
  );
};

export default MeasurementEdit;
