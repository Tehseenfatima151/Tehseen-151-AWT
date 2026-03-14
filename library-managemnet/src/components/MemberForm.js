import React, { useState, useEffect } from "react";

const MemberForm = ({ member, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    membershipDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        email: member.email || "",
        membershipDate: member.membershipDate || new Date().toISOString().split("T")[0],
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="card card-app border-0 p-4 p-lg-5">
      <h5 className="fw-bold mb-4">{member ? "Edit Member" : "Register New Member"}</h5>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label form-label-app">Full Name</label>
          <input
            type="text"
            className="form-control form-control-app"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-12">
          <label className="form-label form-label-app">Email</label>
          <input
            type="email"
            className="form-control form-control-app"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-12">
          <label className="form-label form-label-app">Membership Date</label>
          <input
            type="date"
            className="form-control form-control-app"
            name="membershipDate"
            value={formData.membershipDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-app-primary">
          {member ? "Update" : "Register"} Member
        </button>
        <button type="button" className="btn btn-app-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
