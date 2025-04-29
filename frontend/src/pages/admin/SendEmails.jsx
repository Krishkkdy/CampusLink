import React, { useState } from "react";

const SendEmails = () => {
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    recipients: 'all' // 'all', 'alumni', 'faculty'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(emailData),
      });
      
      if (res.ok) {
        alert('Emails sent successfully!');
        setEmailData({ subject: '', body: '', recipients: 'all' });
      }
    } catch (error) {
      console.error('Error sending emails:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Send Emails</h2>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Recipients</label>
          <select
            className="mt-1 w-full p-2 border rounded"
            value={emailData.recipients}
            onChange={(e) => setEmailData({...emailData, recipients: e.target.value})}
          >
            <option value="all">All Users</option>
            <option value="alumni">Alumni Only</option>
            <option value="faculty">Faculty Only</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            required
            className="mt-1 w-full p-2 border rounded"
            value={emailData.subject}
            onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            required
            className="mt-1 w-full p-2 border rounded"
            rows="6"
            value={emailData.body}
            onChange={(e) => setEmailData({...emailData, body: e.target.value})}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Send Emails
        </button>
      </form>
    </div>
  );
};

export default SendEmails;
