import styles from "./Chat.module.css";

function Chat({ chat, isSelected, onClick }) {
  return (
    <button
      type="button"
      className={`list-group-item list-group-item-action ${styles.chat} ${
        isSelected ? "active" : ""
      }`}
      aria-current="true"
      onClick={onClick}
    >
      <div className="text-center">
        <img
          src={chat.profile_photo ? chat.profile_photo : "public/Profile_avatar_placeholder_large.png"}
          className={styles.profilephoto}
          alt="Profile"
        />
      </div>
      <div className={styles.info}>
        <div className={`fw-bold ${styles.name}`}>
          {chat.first_name} {chat.last_name}
        </div>
        <div className={styles.otherinfo}>
          <div className={`fw ${styles.number}`}>
            Phone Number: {chat.phone_number || "N/A"}
          </div>
        </div>
      </div>
    </button>
  );
}

export default Chat;