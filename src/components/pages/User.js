import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import Svg from "../partials/Svg";

import Badge from "../partials/Badge";
import ButtonBack from "../partials/ButtonBack";
import ButtonEdit from "../partials/ButtonEdit";

import Page from "../partials/Page";

import FetchLoading from "../partials/FetchLoading";
import FetchError from "../partials/FetchError";

const User = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

  const { user_id } = useParams();

  const [user, setUser] = useState({});
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

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await verifyToken(token);
      const response = await fetch(
        `${process.env.REACT_APP_API_SOURCE}/users/${user_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [verifyToken, user_id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, user_id]);

  return (
    <Page currentUser={currentUser}>
      <ButtonBack path="/users">Back to users list</ButtonBack>
      {loading ? (
        <FetchLoading />
      ) : error ? (
        <FetchError error={error} fetchFun={fetchUser} />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center gap-4">
              <h1>{user.name}</h1>
              {user.role && (
                <div className="flex gap-4">
                  <Badge status={user.role} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Svg src="/icons/at-symbol.svg" className="w-6 h-6" />
                {user.email}
              </div>
              <ButtonEdit path={`/users/${user.id}/edit`} />
            </div>
          </div>
        </>
      )}
    </Page>
  );
};

export default User;
