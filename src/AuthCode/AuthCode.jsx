import { useNavigate } from "react-router-dom";
import styles from "./AuthCode.module.css";
import { useState, useRef, useEffect } from "react";
import Alert from "../Alert/Alert";
function AuthCode() {
  const inputRefs = Array.from({ length: 5 }, () => useRef(null));
  const [showAlert, setShowAlert] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [alertColor, setAlertColor] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (inputRefs[0] && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  function handleInput(e, index) {
    const value = e.target.value;
    if (value.length === 1 && index < inputRefs.length - 1) {
      inputRefs[index + 1].current.focus();
    }
    if (index === inputRefs.length - 1) {
      handleNext();
    }
  }

  function handleFocus(e) {
    e.target.value = "";
  }

  function handleNext() {
    const code = inputRefs.map((ref) => ref.current.value).join("");
    fetch("http://localhost:3000/code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })
      .then((response) => {
        if (response.status === 500) {
          setDisplayText("Invalid AuthCode");
          setAlertColor("danger");
          setShowAlert(true);
          inputRefs.forEach((ref) => (ref.current.value = "")); // Reset all input boxes
          inputRefs[0].current.focus();
        } else {
          setDisplayText("AuthCode verified");
          setAlertColor("success");
          setShowAlert(true);
          fetch("http://localhost:3000/check")
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            })
            .then((data) => {
              if (data === 4) {
                navigate("/password");
              } else {
                navigate("/dashboard");
              }
            })
            .catch((error) => console.error("Error:", error));
        }
        return response.json();
      })
      .then((data) => {
        console.log("AuthCode Received by Server");

        console.log("Server response:", data);
      })
      .catch((error) => {
        console.error("Error during fetch request:", error);
      });
  }

  return (
    <>
      {showAlert && (
        <Alert
          text={displayText}
          click={() => setShowAlert(false)}
          color={alertColor}
        />
      )}
      <div className={styles.con}>
        <h2 className={`${styles.header}`}>Received Auth Code :</h2>
        <div className={`${styles.inputcon}`}>
          {inputRefs.map((inputRef, index) => (
            <input
              key={index}
              type="text"
              className={`form-control input-group ${styles.input}`}
              aria-label="Sizing example input"
              aria-describedby="inputGroup-sizing-lg"
              onInput={(e) => handleInput(e, index)}
              onFocus={handleFocus}
              ref={inputRef}
              maxLength="1"
              style={{ caretColor: "transparent" }}
            />
          ))}
        </div>
        <div className="d-grid gap-2">
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default AuthCode;
