import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import UserCard from "../partials/UserCard";
import ButtonNew from "../partials/ButtonNew";

import Page from "../partials/Page";
import PaginatedItems from "../partials/PaginatedItems";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";

const UsersList = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const [users, setUsers] = useState([]);
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(`${process.env.REACT_APP_API_SOURCE}/users`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <Page currentUser={currentUser}>
      <h1>Users List</h1>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchUsers} />
      ) : (
        <PaginatedItems
          items={users}
          ItemComponent={UserCard}
          newButton={<ButtonNew path="/users/new">Add new user</ButtonNew>}
        />
      )}
    </Page>
  );
};

export default UsersList;
