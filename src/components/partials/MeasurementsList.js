import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import MeasurementCard from "../partials/MeasurementCard";

import PaginatedItems from "../partials/PaginatedItems";
import ButtonNew from "../partials/ButtonNew";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";

const MeasurementsList = () => {
  const { experiment_id } = useParams();

  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeasurements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/experiments/${experiment_id}/measurements`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch measurements");
      }
      const data = await response.json();
      setMeasurements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [experiment_id]);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  return (
    <div className="flex-1 flex flex-col gap-8">
      <h1>Measurements List</h1>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchMeasurements} />
      ) : (
        <PaginatedItems
          items={measurements}
          ItemComponent={MeasurementCard}
          newButton={
            <ButtonNew path={`/experiments/${experiment_id}/measurements/new`}>
              Add new measurement
            </ButtonNew>
          }
        />
      )}
    </div>
  );
};

export default MeasurementsList;
