import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import Page from "../partials/Page";
import ButtonBack from "../partials/ButtonBack";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";
import TagForm from "../partials/TagForm";

const TagEdit = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const { tag_id } = useParams();

  const [tag, setTag] = useState({});
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
      setTag(data);
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
      <ButtonBack path={`/tags/${tag.id}`}>Back to the tag</ButtonBack>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchTag} />
      ) : (
        <>
          <h1>Edit tag - {tag.name}</h1>
          <TagForm tag={tag} />
        </>
      )}
    </Page>
  );
};

export default TagEdit;
