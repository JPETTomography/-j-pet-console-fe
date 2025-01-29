import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import TagCard from "../partials/TagCard";
import Page from "../partials/Page";
import PaginatedItems from "../partials/PaginatedItems";
import ButtonNew from "../partials/ButtonNew";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";

const TagsList = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const [tags, setTags] = useState([]);
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

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(`${process.env.REACT_APP_API_SOURCE}/tags`);
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return (
    <Page currentUser={currentUser}>
      <h1>Tags List</h1>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchTags} />
      ) : (
        <PaginatedItems
          items={tags}
          ItemComponent={TagCard}
          newButton={<ButtonNew path="/tags/new">Add new tag</ButtonNew>}
        />
      )}
    </Page>
  );
};

export default TagsList;
