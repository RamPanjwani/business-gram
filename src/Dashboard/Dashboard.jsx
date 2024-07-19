import { useNavigate } from "react-router-dom";
import { useState, useEffect,useRef } from "react";
import styles from "./Dashboard.module.css";
import Chat from "../Chat/Chat";
import Alert from "../Alert/Alert";
import History from "../History/History";
function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChats, setSelectedChats] = useState([]);
  const [message, setMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [fileSelected, setFileSelected] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [alertColor, setAlertColor] = useState(null);
  const [showHistory, setShowHistory] = useState(false); // Corrected state variable name
  const [history, setHistory] = useState(null);
  const [user,setUser] = useState(null);
  const textareaRef = useRef(null);
  useEffect(() => {
    fetch("http://localhost:3000/username")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setUsername(data.username);
        setUser(data.userid);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/chats")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setChats(data.chats);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  function updateMessage(event) {
    setMessage(event.target.value);
  }

  function toggleChatSelection(chatId) {
    setSelectedChats((prevSelectedChats) =>
      prevSelectedChats.includes(chatId)
        ? prevSelectedChats.filter((id) => id !== chatId)
        : [...prevSelectedChats, chatId]
    );
  }

  function toggleSelectAll() {
    setSelectedChats((prevSelectedChats) =>
      prevSelectedChats.length === chats.length
        ? []
        : chats.map((chat) => chat.id)
    );
  }

  function logout() {
    fetch("http://localhost:3000/logout", {
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  }

  function handleFileChange(event) {
    if (event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setFileSelected(true);
      console.log("Selected file:", event.target.files[0]); // Log selected file
    } else {
      setSelectedFile(null);
      setFileSelected(false);
    }
  }

  function sendMessage() {
    if (!message.trim()) {
      setAlertColor("danger");
      setDisplayText("Message can't be empty");
      setShowAlert(true);
      return;
    }

    if (selectedChats.length === 0) {
      setAlertColor("danger");
      setDisplayText("At least one chat must be selected");
      setShowAlert(true);
      return;
    }

    const formData = new FormData();
    formData.append(
      "payload",
      JSON.stringify({
        chatIds: selectedChats,
        message: message.trim(),
      })
    );

    if (selectedFile) {
      formData.append("file", selectedFile);
      console.log("Sending file:", selectedFile);
    }

    fetch("http://localhost:3000/message", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Message sent successfully:", data);
        setAlertColor("success");
        setDisplayText("Message Sent Successfully");
        setShowAlert(true);
        setMessage("");
        setSelectedFile(null);
        setFileSelected(false);
        textareaRef.current.value="";
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  }

  function getHistory() {
    console.log(user);
    console.log(selectedChats);
    if (selectedChats.length !== 1) {
      setAlertColor("danger");
      setDisplayText("Please select exactly one chat to view history.");
      setShowAlert(true);
      return;
    }

    const chatId = selectedChats[0];
    fetch(`http://localhost:3000/history?chat_id=${chatId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Chat History:", data);
        setHistory(data);
        setShowHistory(true); // Show history panel when history is fetched
        // Optionally, you can display or process the history data here
      })
      .catch((error) => {
        console.error("Error fetching chat history:", error);
        setAlertColor("danger");
        setDisplayText("Failed to fetch chat history.");
        setShowAlert(true);
      });
  }

  function closeHistory() {
    setShowHistory(false); // Close history panel
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
      {showHistory && (
        <div className={styles.history}>
          <button
            type="button"
            className={`btn-close ${styles.closeButton}`}
            aria-label="Close"
            onClick={closeHistory} // Close button functionality
          ></button>
          <ul className={`list-group ${styles.historylist}`}>
            {history.map(
              (
                element,
                index // Fixed map function syntax
              ) => (
                <History key={index} number={element.user_id} message={element.message} user={user} />
              )
            )}
          </ul>
        </div>
      )}
      <div className={`row ${styles.dashboard}`}>
        <div className={`col-5 ${styles.leftPanel}`}>
          <div className={styles.welcomecon}>
            <button type="button" className="btn btn-primary" onClick={logout}>
              Logout
            </button>
            <h4 className={styles.welcome}>Signed into {username}</h4>
          </div>
          <div className={`d-grid gap-2 ${styles.margin}`}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={toggleSelectAll}
            >
              {selectedChats.length === chats.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          <div className={`list-group ${styles.list}`}>
            {chats.map((chat) => (
              <Chat
                key={chat.id}
                chat={chat}
                isSelected={selectedChats.includes(chat.id)}
                onClick={() => toggleChatSelection(chat.id)}
              />
            ))}
          </div>
        </div>
        <div className={`col-7 ${styles.rightPanel}`}>
          <textarea
            className={`form-control ${styles.textarea}`}
            placeholder="Enter Message"
            onChange={(event) => updateMessage(event)}
            ref={textareaRef}
          ></textarea>
          <div className={`mb-3 ${styles.inputfile}`}>
            <input
              className="form-control"
              type="file"
              id="formFileMultiple"
              multiple
              onChange={handleFileChange} // Update file selection state
            />
          </div>
          <div className={`d-grid gap-2 ${styles.grid2}`}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={sendMessage}
            >
              {fileSelected ? "Send with File" : "Send"}
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={getHistory}
            >
              History
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
