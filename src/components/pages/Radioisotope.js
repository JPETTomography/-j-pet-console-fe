import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import Svg from "../partials/Svg";

import Page from "../partials/Page";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";

const Radioisotope = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const { radioisotope_id } = useParams();

  const [radioisotope, setRadioisotope] = useState({});
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

  const fetchRadioisotope = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/radioisotopes/${radioisotope_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch radioisotope");
      }
      const data = await response.json();
      setRadioisotope(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken, radioisotope_id]);

  useEffect(() => {
    fetchRadioisotope();
  }, [fetchRadioisotope, radioisotope_id]);

  return (
    <Page currentUser={currentUser}>
      <a
        href="/radioisotopes"
        className="flex items-center gap-2 max-w-max font-semibold text-sky-700 hover:text-sky-900 hover:underline"
      >
        <Svg src="/icons/arrow-left.svg" className="w-5 h-5" />
        <span>Back to radioisotopes list</span>
      </a>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchRadioisotope} />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center gap-4">
              <h1>{radioisotope.name}</h1>
            </div>
            <div className="flex justify-between gap-4">
              <p className="text-xl">{radioisotope.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Svg src="/icons/bolt.svg" className="w-6 h-6" />
                {radioisotope.activity}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Svg src="/icons/clock.svg" className="w-6 h-6" />
                {radioisotope.halflife}
              </div>
            </div>
          </div>
        </>
      )}
    </Page>
  );
};

export default Radioisotope;
