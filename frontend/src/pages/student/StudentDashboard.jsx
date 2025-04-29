import React, { useState, useEffect } from 'react';

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      
      // Filter events properly
      const studentEvents = data.filter(event => {
        const isRegistered = event.registeredStudents?.some(
          reg => reg.userId === localStorage.getItem('userId')
        );
        
        // Show only events that:
        // 1. Have student seats available
        // 2. Are in the future
        // 3. Have been shared with students
        // 4. Include both registered and unregistered events
        return event.studentSeats > 0 && 
               new Date(event.date) > new Date() &&
               event.isSharedWithStudents === true;
      });

      setEvents(studentEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}/student-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ 
          studentId: localStorage.getItem('userId'),
          status: 'approved' // Changed from 'pending' to 'approved'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to register for event');
      }

      await fetchEvents();
      alert('Registration successful!'); // Removed "Awaiting faculty approval"
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(error.message || 'Failed to register for event');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      
      {/* Academic and Skills Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Academic Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Academic Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Department:</span> Computer Science
            </p>
            <p>
              <span className="font-medium">Semester:</span> 6
            </p>
            <p>
              <span className="font-medium">CGPA:</span> 8.5
            </p>
          </div>
        </div>

        {/* Skills Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Programming
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Web Development
            </span>
          </div>
        </div>

        {/* Projects Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Student Management System</li>
            <li>E-commerce Website</li>
          </ul>
        </div>
      </div>

      {/* Events Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const userRegistration = event.registeredStudents?.find(
              reg => reg.userId === localStorage.getItem('userId')
            );
            const seatsRemaining = event.studentSeats - (event.registeredStudents?.filter(reg => reg.status === 'approved')?.length || 0);

            return (
              <div key={event._id} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(event.date).toLocaleString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Venue:</span> {event.venue}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Available Seats:</span>{' '}
                    {seatsRemaining}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Faculty:</span>{' '}
                    {event.createdBy?.name} ({event.createdBy?.profile?.basicInfo?.department})
                  </p>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>
                
                {userRegistration ? (
                  <div className="text-center py-2 rounded bg-green-100 text-green-800">
                    Registered
                  </div>
                ) : seatsRemaining > 0 ? (
                  <button
                    onClick={() => handleRegister(event._id)}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Register
                  </button>
                ) : (
                  <div className="text-center py-2 bg-gray-100 text-gray-800 rounded">
                    No Seats Available
                  </div>
                )}
              </div>
            );
          })}
          
          {events.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No upcoming events available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
