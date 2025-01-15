import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import Tag from "../partials/Tag";
import ButtonBack from "../partials/ButtonBack";

import Page from "../partials/Page";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";

const Experiment = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const { tag_id } = useParams();

  const [tag, setExperiment] = useState({});
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

  const fetchTag = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/tags/${tag_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tag");
      }
      const data = await response.json();
      setExperiment(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken, tag_id]);

  useEffect(() => {
    fetchTag();
  }, [fetchTag, tag_id]);

  return (
    <Page currentUser={currentUser}>
      <ButtonBack path="/tags">Back to tags list</ButtonBack>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchTag} />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center gap-4">
              <h1>{tag.name}</h1>
              <div className="flex gap-4">
                <Tag name={tag.name} color={tag.color} />
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <p className="text-xl">{tag.description}</p>
            </div>
          </div>
        </>
      )}
    </Page>
  );
};

export default Experiment;
