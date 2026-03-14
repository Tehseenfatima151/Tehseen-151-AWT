import React, { useState, useEffect } from "react";
import MemberForm from "../components/MemberForm";
import { getMembers, createMember, updateMember, deleteMember } from "../services/api";

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const loadMembers = async () => {
    try {
      const res = await getMembers();
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to load members", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAddMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingMember) {
        await updateMember(editingMember.id, formData);
      } else {
        await createMember(formData);
      }
      setShowForm(false);
      setEditingMember(null);
      loadMembers();
    } catch (err) {
      console.error("Failed to save member", err);
      alert("Failed to save member. Please try again.");
    }
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Remove member "${member.name}"?`)) return;
    try {
      await deleteMember(member.id);
      loadMembers();
    } catch (err) {
      console.error("Failed to delete member", err);
      alert("Failed to delete member.");
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <header className="page-header mb-0">
          <h1>Members</h1>
          <p>Manage library memberships</p>
        </header>
        <button type="button" className="btn btn-app-primary rounded-3 px-4" onClick={handleAddMember}>
          + Register Member
        </button>
      </div>

      {showForm && (
        <div className="mb-4" style={{ maxWidth: 480 }}>
          <MemberForm
            member={editingMember}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingMember(null);
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner-border spinner-app" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card card-app border-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-app align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Membership Date</th>
                  <th>Borrowed</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-secondary">
                      No members yet.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id}>
                      <td className="fw-semibold">{member.name}</td>
                      <td>{member.email}</td>
                      <td>{member.membershipDate}</td>
                      <td>
                        <span className="badge bg-secondary bg-opacity-90 rounded-pill px-2">
                          {(member.borrowedBooks || []).length}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-action-edit me-1"
                          onClick={() => handleEditMember(member)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-action-delete"
                          onClick={() => handleDeleteMember(member)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
