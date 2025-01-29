import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import RadioisotopeCard from "../partials/RadioisotopeCard";

import Page from "../partials/Page";
import PaginatedItems from "../partials/PaginatedItems";
import ButtonNew from "../partials/ButtonNew";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";

const RadioisotopesList = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const [radioisotopes, setRadioisotopes] = useState([]);
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

  const fetchRadioisotopes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/radioisotopes`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch radioisotopes");
      }
      const data = await response.json();
      setRadioisotopes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken]);

  useEffect(() => {
    fetchRadioisotopes();
  }, [fetchRadioisotopes]);

  return (
    <Page currentUser={currentUser}>
      <h1>Radioisotopes List</h1>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchRadioisotopes} />
      ) : (
        <PaginatedItems
          items={radioisotopes}
          ItemComponent={RadioisotopeCard}
          newButton={
            <ButtonNew path="/radioisotopes/new">
              Add new radioisotope
            </ButtonNew>
          }
        />
      )}
    </Page>
  );
};

export default RadioisotopesList;
