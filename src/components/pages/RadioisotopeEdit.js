import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import Page from "../partials/Page";
import ButtonBack from "../partials/ButtonBack";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";
import RadioisotopeForm from "../partials/RadioisotopeForm";

const RadioisotopeEdit = () => {
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
      <ButtonBack path={`/radioisotopes/${radioisotope.id}`}>
        Back to the radioisotope
      </ButtonBack>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchRadioisotope} />
      ) : (
        <>
          <h1>Edit radioisotope - {radioisotope.name}</h1>
          <RadioisotopeForm radioisotope={radioisotope} />
        </>
      )}
    </Page>
  );
};

export default RadioisotopeEdit;
