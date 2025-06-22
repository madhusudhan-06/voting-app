import { useEffect, useState } from "react";
import axios from "axios";
import './Notifications.css'

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  async function getNotifications() {
    try {
      const response = await axios.get("http://localhost:5000/api/elections/notifications");
      setNotifications(response.data);
      console.log(response.data);
    }
    catch (err) {
      console.error(err);
    }
  }
  const allNotifications = notifications.map((n) =>
    <li key={n._id} className="preserve-line">
      {n.notification}
    </li>
  )

  useEffect(() => {
    getNotifications();
  }, []);

  return (
    <div className="notification-dropdown">
      <h4>Notifications</h4>
      <div>
        <ul>
          {allNotifications.length > 0 ? allNotifications : <li>No notifications available</li>}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;
