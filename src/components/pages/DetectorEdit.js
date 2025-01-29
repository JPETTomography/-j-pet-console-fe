import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import Page from "../partials/Page";
import ButtonBack from "../partials/ButtonBack";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";
import DetectorForm from "../partials/DetectorForm";

const DetectorEdit = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const { detector_id } = useParams();

  const [detector, setDetector] = useState({});
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

  const fetchDetector = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/detectors/${detector_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch detector");
      }
      const data = await response.json();
      setDetector(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken, detector_id]);

  useEffect(() => {
    fetchDetector();
  }, [fetchDetector, detector_id]);

  return (
    <Page currentUser={currentUser}>
      <ButtonBack path={`/detectors/${detector.id}`}>
        Back to the detector
      </ButtonBack>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchDetector} />
      ) : (
        <>
          <h1>Edit detector - {detector.name}</h1>
          <DetectorForm detector={detector} />
        </>
      )}
    </Page>
  );
};

export default DetectorEdit;
