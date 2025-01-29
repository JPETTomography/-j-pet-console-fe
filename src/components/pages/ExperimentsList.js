import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import ExperimentCard from "../partials/ExperimentCard";

import Page from "../partials/Page";
import PaginatedItems from "../partials/PaginatedItems";
import ButtonNew from "../partials/ButtonNew";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";

const ExperimentsList = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const [experiments, setExperiments] = useState([]);
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

  const fetchExperiments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/experiments`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch experiments");
      }
      const data = await response.json();
      setExperiments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  return (
    <Page currentUser={currentUser}>
      <h1>Experiments List</h1>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchExperiments} />
      ) : (
        <PaginatedItems
          items={experiments}
          ItemComponent={ExperimentCard}
          newButton={
            <ButtonNew path="/experiments/new">Add new experiment</ButtonNew>
          }
        />
      )}
    </Page>
  );
};

export default ExperimentsList;
