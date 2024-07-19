import { useRef, useState } from "react";
import Alert from "../Alert/Alert";
import styles from "./PhoneNumber.module.css";
import { useNavigate } from "react-router-dom";

function PhoneNumber() {
  const phoneRef = useRef(null);
  const [showAlert, setShowAlert] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [alertColor, setAlertColor] = useState(null);
  const navigate = useNavigate();

  function handleChange(event) {
    if (event.target.value.length > 10) {
      event.target.value = event.target.value.slice(0, 10);
    }
  }
  function handleInput() {
    const phonenumber = phoneRef.current.value.trim();
    const completephone = 91 + phonenumber;


    if (phonenumber === "") {
      setDisplayText("Phone Number cannot be empty");
      setShowAlert(true);
    } else if (phonenumber.length !== 10) {
      setDisplayText("Invalid Phone Number");
      setShowAlert(true);
    } else {
      fetch("http://localhost:3000/phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completephone }),
      })
        .then((response) => {
          if (response.status === 500) {
            setDisplayText("Phone Number is Invalid")
            setAlertColor("danger")
            setShowAlert(true);
            phoneRef.current.value = null;
          } else {
            setDisplayText("Auth Code sent")
            setAlertColor("success")
            setShowAlert(true);
            navigate("/authcode")
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
        <h2 className={styles.header}>Your Phone Number</h2>
        <div className={styles.inputcon}>
          <input
            className="form-control"
            type="number"
            placeholder="Dial Code"
            aria-label="Dial Code"
            value={91}
            id={styles.dialcode}
            disabled
          />
          <input
            className="form-control"
            type="text"
            placeholder="Phone Number"
            aria-label="Phone Number"
            id={styles.phone}
            ref={phoneRef}
            onInput={handleChange}
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
export default PhoneNumber;