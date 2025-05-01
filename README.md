# 🌐 CampusLink

CampusLink is a platform designed to foster meaningful interactions between students and alumni. It provides a space for networking, mentorship, event participation, and career opportunities, bridging the gap between current students and alumni.

![React](https://img.shields.io/badge/Frontend-React-blue?style=flat-square&logo=react) 
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=flat-square&logo=node.js) 
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=flat-square&logo=mongodb) 
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## ✨ Features

- 🔗 **Student-Alumni Networking**: Connect students with alumni for guidance and mentorship.
- 🎉 **Event Management**: Faculty and admins can create events, and students can register or show interest.
- 📝 **Resume Feedback**: Alumni can review and provide feedback on student resumes.
- 💼 **Job Postings**: Alumni can post job opportunities for students.
- 💬 **Messaging System**: Role-based messaging between students, alumni, and faculty.
- 👤 **Profile Management**: Users can manage their profiles based on their roles (student, alumni, faculty).

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React.js
- 🧭 React Router
- 📡 Axios

### Backend
- 🌿 Node.js
- 🚀 Express.js
- 🍃 MongoDB
- 🔌 Socket.IO

### Other Tools
- 🔒 JWT for authentication
- ☁️ Cloudinary for file uploads
- ✉️ Nodemailer for email notifications

---

## 🚀 Installation

### Prerequisites
- ✅ Node.js installed
- ✅ MongoDB instance running
- ✅ Environment variables configured in `.env` file

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Krishkkdy/CampusLink.git
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

3. Configure the `.env` file in the `backend` directory:
   ```plaintext
   PORT=5000
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_URL=your_cloudinary_url
   ```

4. Start the development servers:
   - Backend:
     ```bash
     npm run dev
     or
     nodemon server.js
     ```
   - Frontend:
     ```bash
     cd ../frontend
     npm run dev
     ```

5. Access the application at `http://localhost:5173`.

---

## 🎮 Usage

1. **Admin**:
   - Add alumni, faculty, and students.
   - Manage Profiles and send notifications.

2. **Faculty**:
   - Create events and notify alumni.
   - View alumni profiles and network.
   - chat with other alumnis.

3. **Alumni**:
   - Post jobs and review student resumes.
   - Participate in events and connect with students.
   - chat directly with students and faculties.

4. **Students**:
   - Register for events and view job postings.
   - Connect with alumni and request resume feedback.

---

## 📂 Project Structure

```
CampusLink/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   └── ...
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── ...
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

---

## 🤝 Working Team

- 22IT035 - Harsh Hadiya
- 22IT042 - Om Hirvania
- 22IT043 - Mohit Jadav
- 22IT048 - Krish Kakadiya

---

## 📧 Contact

For any inquiries or feedback, please contact:
- **Email**: krishkkdy11@gmail.com
- **GitHub**: https://github.com/Krishkkdy
