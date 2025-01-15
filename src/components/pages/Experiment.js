import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import { formatDate } from "../../utils/formatDate";

import Svg from "../partials/Svg";

import Badge from "../partials/Badge";
import ButtonBack from "../partials/ButtonBack";

import Page from "../partials/Page";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";
import MeasurementsList from "../partials/MeasurementsList";

const Experiment = () => {
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
      <ButtonBack path={"/experiments"}>Back to experiments list</ButtonBack>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchExperiment} />
      ) : (
        <>
          <div className="grid grid-cols-[1fr_400px] gap-8">
            <MeasurementsList />
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-start gap-4">
                <h2>{experiment.name}</h2>
                <div className="flex gap-4">
                  <Badge status={experiment.status} />
                </div>
              </div>
              <p className="text-xl">{experiment.description}</p>
              <div className="flex flex-col gap-2">
                <div className="shrink-0 flex items-center gap-2 mb-auto text-sm">
                  <Svg src="/icons/calendar-days.svg" className="w-6 h-6" />
                  <span>
                    {formatDate(experiment.start_date)} -{" "}
                    {experiment.end_date
                      ? formatDate(experiment.end_date)
                      : "..."}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Svg src="/icons/map-pin.svg" className="w-6 h-6" />
                  {experiment.location}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Svg src="/icons/user-circle.svg" className="w-6 h-6" />
                  {experiment.coordinator.name}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Page>
  );
};

export default Experiment;
