import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import Svg from "../partials/Svg";

import Badge from "../partials/Badge";

import Page from "../partials/Page";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";

const Detector = () => {
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
      <a
        href="/detectors"
        className="flex items-center gap-2 max-w-max font-semibold text-sky-700 hover:text-sky-900 hover:underline"
      >
        <Svg src="/icons/arrow-left.svg" className="w-5 h-5" />
        <span>Back to detectors list</span>
      </a>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchDetector} />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center gap-4">
              <h1>{detector.name}</h1>
              <div className="flex gap-4">
                <Badge status={detector.status} />
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <p className="text-xl">{detector.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Svg src="/icons/globe-europe-africa.svg" className="w-6 h-6" />
                {detector.agent_code}
              </div>
            </div>
          </div>
        </>
      )}
    </Page>
  );
};

export default Detector;
