import React, { useState } from "react";

const SendEmails = () => {
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    recipients: 'all' // 'all', 'alumni', 'faculty', 'students'
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
        const data = await res.json();
        alert(data.message || 'Emails sent successfully!');
        setEmailData({ subject: '', body: '', recipients: 'all' });
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'Failed to send emails'}`);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Send Emails
          </span>
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={emailData.recipients}
                onChange={(e) => setEmailData({...emailData, recipients: e.target.value})}
              >
                <option value="all">All Users</option>
                <option value="alumni">Alumni Only</option>
                <option value="faculty">Faculty Only</option>
                <option value="students">Students Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter email subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[200px]"
                placeholder="Write your message here..."
                rows="8"
                value={emailData.body}
                onChange={(e) => setEmailData({...emailData, body: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Send Emails</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendEmails;
