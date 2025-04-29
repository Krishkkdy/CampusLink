import React from "react";
import { Link, Outlet } from "react-router-dom";

const ManageStudents = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Student Management</h2>
        <div className="space-x-4">
          <Link 
            to="/admin/manage-students/list"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            View All Students
          </Link>
          <Link 
            to="/admin/manage-students/add"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add New Student
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default ManageStudents;
