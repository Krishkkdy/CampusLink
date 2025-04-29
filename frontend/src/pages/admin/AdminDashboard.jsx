import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    alumni: 0,
    faculty: 0,
  });
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const [alumniRes, facultyRes, eventsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/admin/alumni`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/admin/faculty`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/events`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [alumniData, facultyData, eventsData] = await Promise.all([
        alumniRes.json(),
        facultyRes.json(),
        eventsRes.json()
      ]);

      // Filter out events with no department or expired dates
      const validEvents = eventsData.filter(event => {
        const eventDate = new Date(event.date);
        const currentDate = new Date();
        return (
          event.createdBy?.profile?.basicInfo?.department && 
          eventDate >= currentDate
        );
      });

      setCounts({
        alumni: alumniData.length,
        faculty: facultyData.length,
      });
      setEvents(validEvents);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const stats = [
    { 
      title: "Total Alumni", 
      count: counts.alumni, 
      color: "bg-blue-500",
      link: "/alumni-list" 
    },
    { 
      title: "Active Faculty", 
      count: counts.faculty, 
      color: "bg-green-500",
      link: "/faculty-list"
    },
    { 
      title: "Upcoming Events", 
      count: events.length, 
      color: "bg-purple-500",
      onClick: () => setSelectedEvent(true)  // Show events modal
    },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">Admin Dashboard</h1>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`card p-6 flex items-center cursor-pointer transform hover:scale-105 transition-transform duration-200`}
            onClick={stat.onClick}
          >
            {stat.link ? (
              <Link to={stat.link} className="w-full flex items-center">
                <div className={`${stat.color} rounded-full p-3 mr-4`}>
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.count}</p>
                </div>
              </Link>
            ) : (
              <div className="w-full flex items-center">
                <div className={`${stat.color} rounded-full p-3 mr-4`}>
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.count}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/add-alumni" className="card p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Add Alumni</h3>
              <p className="text-sm text-gray-600">Add new alumni to the system</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/add-faculty" className="card p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Add Faculty</h3>
              <p className="text-sm text-gray-600">Add new faculty members</p>
            </div>
          </div>
        </Link>

        <Link to="/send-emails" className="card p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Send Emails</h3>
              <p className="text-sm text-gray-600">Broadcast messages to users</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/add-student" className="card p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Add Students</h3>
              <p className="text-sm text-gray-600">Add student accounts</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Events Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <button 
                onClick={() => setSelectedEvent(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                    <div className="grid grid-cols-2 gap-4 my-2">
                      <p className="text-gray-600">Date: {new Date(event.date).toLocaleDateString()}</p>
                      <p className="text-gray-600">Venue: {event.venue}</p>
                    </div>
                    <p className="text-gray-600 mb-2">{event.description}</p>
                    <p className="text-gray-500 text-sm mb-2">
                      Posted by: {event.createdBy?.name} ({event.createdBy?.profile?.basicInfo?.department || 'No department'})
                    </p>
                    
                    {/* Add Interested Alumni Section */}
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold mb-2">
                        Interested Alumni ({event.interestedUsers?.length || 0})
                      </h4>
                      <div className="max-h-60 overflow-y-auto">
                        {event.interestedUsers?.map((alumnus) => (
                          <div
                            key={alumnus._id}
                            onClick={() => setSelectedAlumnus(alumnus)}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            <img
                              src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
                              alt={alumnus.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{alumnus.name}</p>
                              <p className="text-sm text-gray-600">
                                {alumnus.profile?.basicInfo?.department || 'No department'} 
                                {alumnus.profile?.academic?.graduationYear && ` | ${alumnus.profile.academic.graduationYear}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900">No Upcoming Events</h3>
                <p className="text-gray-500 mt-2">There are currently no upcoming events scheduled.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alumni Profile Modal */}
      {selectedAlumnus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedAlumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${selectedAlumnus.name}`}
                  alt={selectedAlumnus.name}
                  className="w-24 h-24 rounded-full border-4 border-blue-100"
                />
                <div>
                  <h2 className="text-2xl font-bold">{selectedAlumnus.name}</h2>
                  <p className="text-gray-600">{selectedAlumnus.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlumnus(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Profile Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Department:</span> {selectedAlumnus.profile?.basicInfo?.department}</p>
                  <p><span className="font-medium">Phone:</span> {selectedAlumnus.profile?.basicInfo?.phone}</p>
                  <p><span className="font-medium">Location:</span> {selectedAlumnus.profile?.basicInfo?.location}</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Professional Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Company:</span> {selectedAlumnus.profile?.professional?.currentCompany}</p>
                  <p><span className="font-medium">Role:</span> {selectedAlumnus.profile?.professional?.designation}</p>
                  <p><span className="font-medium">Experience:</span> {selectedAlumnus.profile?.professional?.experience}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
