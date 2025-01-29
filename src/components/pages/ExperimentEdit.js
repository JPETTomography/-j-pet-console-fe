import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import Page from "../partials/Page";
import ButtonBack from "../partials/ButtonBack";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";
import ExperimentForm from "../partials/ExperimentForm";

const ExperimentEdit = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const { experiment_id } = useParams();

  const [experiment, setExperiment] = useState({});
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

  const fetchExperiment = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/experiments/${experiment_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch experiment");
      }
      const data = await response.json();
      setExperiment(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken, experiment_id]);

  useEffect(() => {
    fetchExperiment();
  }, [fetchExperiment, experiment_id]);

  return (
    <Page currentUser={currentUser}>
      <ButtonBack path={`/experiments/${experiment.id}`}>
        Back to the experiment
      </ButtonBack>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchExperiment} />
      ) : (
        <>
          <h1>Edit experiment - {experiment.name}</h1>
          <ExperimentForm experiment={experiment} />
        </>
      )}
    </Page>
  );
};

export default ExperimentEdit;
