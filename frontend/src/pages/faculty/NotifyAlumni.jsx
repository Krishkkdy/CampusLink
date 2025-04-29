import React, { useState } from "react";

const NotifyAlumni = () => {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    eventId: ''
  });

  const [events] = useState([
    { id: 1, title: "Annual Alumni Meet 2024" },
    { id: 2, title: "Tech Workshop" }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Notification sent:', notification);
    alert('Notification sent successfully!');
    setNotification({ title: '', message: '', eventId: '' });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Notify Alumni</h2>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Event</label>
          <select
            className="mt-1 w-full p-2 border rounded"
            value={notification.eventId}
            onChange={(e) => setNotification({...notification, eventId: e.target.value})}
            required
          >
            <option value="">Select an event</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notification Title</label>
          <input
            type="text"
            className="mt-1 w-full p-2 border rounded"
            value={notification.title}
            onChange={(e) => setNotification({...notification, title: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            className="mt-1 w-full p-2 border rounded"
            rows="4"
            value={notification.message}
            onChange={(e) => setNotification({...notification, message: e.target.value})}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Send Notification
        </button>
      </form>
    </div>
  );
};

export default NotifyAlumni;
