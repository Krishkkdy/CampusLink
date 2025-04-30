import React, { useState, useEffect } from "react";

const NotifyAlumni = () => {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    eventId: ''
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(notification)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Notification sent successfully to ${data.recipientCount} alumni!`);
        setNotification({ title: '', message: '', eventId: '' });
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      alert('Error sending notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Notify Alumni</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Related Event (Optional)</label>
          <select
            className="mt-1 w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            value={notification.eventId}
            onChange={(e) => setNotification({...notification, eventId: e.target.value})}
          >
            <option value="">Select an event</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notification Title</label>
          <input
            type="text"
            required
            className="mt-1 w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            value={notification.title}
            onChange={(e) => setNotification({...notification, title: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            required
            rows="4"
            className="mt-1 w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            value={notification.message}
            onChange={(e) => setNotification({...notification, message: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-md text-white ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
};

export default NotifyAlumni;
