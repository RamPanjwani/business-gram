import { useRef, useState } from "react";
import Alert from "../Alert/Alert";
import styles from "./Password.module.css";
import { useNavigate } from "react-router-dom";

function Password() {
  const passRef = useRef(null);
  const [showAlert, setShowAlert] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [alertColor, setAlertColor] = useState(null);
  const navigate = useNavigate();

  function handleInput() {
    const password = passRef.current.value.trim();
    console.log(password);
    if (password === "") {
      setDisplayText("Password cannot be empty");
      setShowAlert(true);
    } else {
      console.log("run else");
        fetch("http://localhost:3000/password", {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })
        .then((response) => {
          if (response.status === 500) {
            setDisplayText("Password is incorrect");
            setAlertColor("danger");
            setShowAlert(true);
            passRef.current.value = null;
          } else {
            setDisplayText("Auth Code sent");
            setAlertColor("success");
            setShowAlert(true);
            navigate("/dashboard");
          }
          return response.json();
        })
        .catch((error) => {
          console.error("Error during fetch request:", error);
        });
    }
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
        <h2 className={styles.header}>Your Password</h2>
        <div className={styles.inputcon}>
          <input
            className="form-control"
            type="password"
            placeholder="Password"
            aria-label="Password"
            id={styles.pass}
            ref={passRef}
          />
        </div>
        <div className="d-grid gap-2">
          <button
            className="btn btn-primary center"
            type="button"
            onClick={handleInput}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
export default Password;
