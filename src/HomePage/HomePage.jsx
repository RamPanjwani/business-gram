import React, { useState, useEffect } from "react";
import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [page, setPage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("loaded form");
    fetch("http://localhost:3000/check")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Data :", data);
        if (data == 1) setPage((p) => 1);
        else if (data == 2) setPage((p) => 2);
        else if (data == 3) setPage((p) => 3);
        else if(data == 4) setPage((p)=>4);
        else console.log("Data :",data);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  const handleStartClick = () => {
    console.log("Clicked Start Button");
    if (page == 1) navigate("/phonenumber");
    else if (page == 2) navigate("/authcode");
    else if (page == 3) navigate("/dashboard");
    else if (page == 4) navigate("/password");
  };

  return (
    <>
      <div className={styles.con}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
          className={`img-fluid ${styles.icon} `}
          alt="..."
        />
        <h2 className={`${styles.header}`}>BusinessGram</h2>
        <div className="d-grid gap-2">
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleStartClick}
          >
            Start
          </button>
        </div>
      </div>
    </>
  );
}

export default HomePage;
