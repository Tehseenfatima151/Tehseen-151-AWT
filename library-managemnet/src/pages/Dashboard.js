import React, { useState, useEffect } from "react";
import DashboardStats from "../components/DashboardStats";
import { getBooks, getMembers, getBorrowRecords } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    borrowedCount: 0,
    availableCount: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, membersRes, recordsRes] = await Promise.all([
          getBooks(),
          getMembers(),
          getBorrowRecords(),
        ]);
        const books = booksRes.data || [];
        const members = membersRes.data || [];
        const records = recordsRes.data || [];
        const borrowedCount = records.filter((r) => !r.returnDate).length;
        const overdueCount = records.filter((r) => r.status === "Overdue").length;
        const availableCount = books.reduce((sum, b) => sum + (Number(b.availableCopies) || 0), 0);
        setStats({
          totalBooks: books.length,
          totalMembers: members.length,
          borrowedCount,
          availableCount,
          overdueCount,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="loading-wrap">
          <div className="spinner-border spinner-app" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your library at a glance</p>
      </header>
      <DashboardStats stats={stats} />
    </div>
  );
};

export default Dashboard;
