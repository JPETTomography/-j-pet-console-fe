import { React, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import Svg from "../partials/Svg";

import Page from "../partials/Page";
import {
  measurementTabs,
  measurementContextContent,
} from "../../utils/measurements";
import Tabs from "../partials/Tabs";
import Tag from "../partials/Tag";
import ButtonBack from "../partials/ButtonBack";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";

const Measurement = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const { measurement_id } = useParams();

  const [measurement, setMeasurement] = useState({});
  const [context, setContext] = useState(measurementTabs[0].id);
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
          <div className="grid grid-cols-[1fr_400px] gap-8">
            <div className="flex-1 flex flex-col gap-8">
              <h1>{measurement.name}</h1>
              <Tabs
                tabs={measurementTabs}
                active={context}
                changeContext={setContext}
              />
              {measurementContextContent(context, measurement)}
            </div>
            <div className="flex flex-col gap-6">
              <ul className="list-none empty:hidden flex flex-wrap gap-4">
                {measurement.tags.map((tag, index) => (
                  <li key={index}>
                    <Tag {...tag} />
                  </li>
                ))}
              </ul>
              <p className="text-xl">{measurement.description}</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Svg src="/icons/command-line.svg" className="w-6 h-6" />
                  {measurement.directory}
                </div>
                {measurement.radioisotopes.length > 0 && (
                  <div className="flex gap-2 text-sm">
                    <Svg src="/icons/beaker.svg" className="w-6 h-6" />
                    <ul className="list-none flex flex-col">
                      {measurement.radioisotopes.map((radioisotope, index) => (
                        <li key={index}>{radioisotope.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Page>
  );
};

export default Measurement;
