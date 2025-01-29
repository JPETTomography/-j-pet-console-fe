import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Page from "../partials/Page";
import ButtonBack from "../partials/ButtonBack";

import DetectorForm from "../partials/DetectorForm";

const DetectorNew = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    verifyToken(token);
  }, [verifyToken]);

  return (
    <Page currentUser={currentUser}>
      <ButtonBack path="/detectors">Back to detectors list</ButtonBack>
      <h1>New detector</h1>
      <DetectorForm />
    </Page>
  );
};

export default DetectorNew;
