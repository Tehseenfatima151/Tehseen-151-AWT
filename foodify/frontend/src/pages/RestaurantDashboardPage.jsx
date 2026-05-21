import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertInfo from "../components/AlertInfo";
import SafeImage from "../components/SafeImage";

const emptyItem = { name: "", price: "", description: "", category: "Mains" };
const emptyDeal = { title: "", description: "", discount: "", valid_from: "", valid_until: "" };
const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&fit=crop";

const STATUS_FLOW = ["pending", "accepted", "preparing", "ready", "completed"];

const STATUS_CONFIG = {
  pending:   { label: "Pending",   icon: "fa-clock",             color: "#f59e0b", bg: "#fef3c7", next: "accepted",  nextLabel: "Accept Order",    nextIcon: "fa-check",        nextColor: "from-blue-500 to-blue-600",    nextShadow: "rgba(59,130,246,0.35)" },
  accepted:  { label: "Accepted",  icon: "fa-check-to-slot",     color: "#3b82f6", bg: "#dbeafe", next: "preparing", nextLabel: "Start Preparing", nextIcon: "fa-fire-burner",  nextColor: "from-orange-500 to-orange-600", nextShadow: "rgba(249,115,22,0.35)" },
  preparing: { label: "Preparing", icon: "fa-fire-burner",       color: "#f97316", bg: "#ffedd5", next: "ready",     nextLabel: "Mark Ready",      nextIcon: "fa-box-open",     nextColor: "from-indigo-500 to-indigo-600", nextShadow: "rgba(99,102,241,0.35)" },
  ready:     { label: "Ready",     icon: "fa-box-open",          color: "#6366f1", bg: "#ede9fe", next: "completed", nextLabel: "Complete Order",  nextIcon: "fa-circle-check", nextColor: "from-green-500 to-green-600",   nextShadow: "rgba(34,197,94,0.35)" },
  completed: { label: "Completed", icon: "fa-house-circle-check",color: "#10b981", bg: "#d1fae5", next: null },
  rejected:  { label: "Rejected",  icon: "fa-ban",               color: "#ef4444", bg: "#fee2e2", next: null },
};

const LEFT_COLORS = {
  pending: "bg-yellow-400", accepted: "bg-blue-400",
  preparing: "bg-orange-400", ready: "bg-indigo-400",
  completed: "bg-green-400", rejected: "bg-red-400",
};

/* ── Status Pipeline (mini stepper shown inside each card) ── */
const StatusPipeline = ({ currentStatus }) => {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-0 mt-3">
      {STATUS_FLOW.map((step, i) => {
        const cfg = STATUS_CONFIG[step];
        const done = i < currentIdx;
        const active = i === currentIdx;
        const future = i > currentIdx;
        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            {/* Step dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all
                  ${done   ? "border-transparent text-white"  : ""}
                  ${active ? "border-transparent text-white scale-110 shadow-lg" : ""}
                  ${future ? "border-gray-200 text-gray-300 bg-white" : ""}
                `}
                style={
                  done   ? { background: cfg.color, borderColor: cfg.color } :
                  active ? { background: cfg.color, borderColor: cfg.color, boxShadow: `0 0 0 4px ${cfg.color}22` } :
                  {}
                }
              >
                {done
                  ? <i className="fa-solid fa-check text-[9px]" />
                  : <i className={`fa-solid ${cfg.icon} text-[9px]`} style={active ? {} : { color: "#d1d5db" }} />
                }
              </div>
              <span
                className={`text-[9px] font-bold mt-1 whitespace-nowrap
                  ${active ? "text-gray-800" : done ? "text-gray-500" : "text-gray-300"}`}
              >
                {cfg.label}
              </span>
            </div>
            {/* Connector line */}
            {i < STATUS_FLOW.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${i < currentIdx ? "bg-gray-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const RestaurantDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [menuItem, setMenuItem] = useState(emptyItem);
  const [myMenu, setMyMenu] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [myDeals, setMyDeals] = useState([]);
  const [dealForm, setDealForm] = useState(emptyDeal);
  const [editingDealId, setEditingDealId] = useState(null);
  const [dealImageFile, setDealImageFile] = useState(null);
  const [dealImagePreview, setDealImagePreview] = useState(null);
  const [dealMenuIds, setDealMenuIds] = useState([]);
  const dealFileInputRef = useRef(null);

  const fetchOrders = () => {
    api.get("/restaurants/dashboard/orders").then((res) => setOrders(res.data)).catch(() => setOrders([]));
  };

  const fetchMenu = async () => {
    try {
      const { data: mine } = await api.get("/restaurants/me");
      const menu = await api.get(`/menu/restaurant/${mine.id}`);
      setRestaurant(mine);
      setMyMenu(menu.data);
    } catch {
      setMyMenu([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = () => {
    api.get("/deals/mine").then((res) => setMyDeals(res.data)).catch(() => setMyDeals([]));
  };

  useEffect(() => {
    fetchOrders();
    fetchMenu();

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (activeTab === "deals") fetchDeals();
  }, [activeTab]);

  const resetForm = () => {
    setMenuItem(emptyItem);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setAlert({ msg: "Image too large. Max 2MB allowed.", type: "error" });
      e.target.value = "";
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveMenu = async (e) => {
    e.preventDefault();
    try {
      // Build FormData to support file upload
      const formData = new FormData();
      formData.append("name", menuItem.name);
      formData.append("price", menuItem.price);
      formData.append("description", menuItem.description || "");
      formData.append("category", menuItem.category || "Mains");
      if (imageFile) formData.append("image", imageFile);

      // Do not set Content-Type manually — axios must add multipart boundary automatically
      if (editingId) {
        await api.put(`/menu/${editingId}`, formData);
        setAlert({ msg: "Item updated securely", type: "success" });
      } else {
        await api.post("/menu", formData);
        setAlert({ msg: "Item added successfully", type: "success" });
      }
      resetForm();
      fetchMenu();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.response?.data?.error || "Failed to save menu item";
      setAlert({ msg: String(msg), type: "error" });
    }
  };

  const editMenu = (item) => {
    setEditingId(item.id);
    setMenuItem({ name: item.name, price: item.price, description: item.description || "", category: item.category || "Mains" });
    // Show existing image as preview (no local file yet)
    setImageFile(null);
    setImagePreview(item.image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMenu = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/menu/${id}`);
      setAlert({ msg: "Item deleted successfully", type: "success" });
      fetchMenu();
    } catch {
      setAlert({ msg: "Failed to delete item", type: "error" });
    }
  };

  const resetDealForm = () => {
    setDealForm(emptyDeal);
    setEditingDealId(null);
    setDealImageFile(null);
    setDealImagePreview(null);
    setDealMenuIds([]);
    if (dealFileInputRef.current) dealFileInputRef.current.value = "";
  };

  const toggleDealMenuId = (id) => {
    setDealMenuIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDealImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAlert({ msg: "Image too large. Max 2MB allowed.", type: "error" });
      e.target.value = "";
      return;
    }
    setDealImageFile(file);
    setDealImagePreview(URL.createObjectURL(file));
  };

  const saveDeal = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", dealForm.title.trim());
      formData.append("description", dealForm.description || "");
      formData.append("discount", String(dealForm.discount));
      formData.append("valid_from", dealForm.valid_from || "");
      formData.append("valid_until", dealForm.valid_until || "");
      formData.append("menu_item_ids", JSON.stringify(dealMenuIds));
      if (dealImageFile) formData.append("image", dealImageFile);
      if (editingDealId && !dealImageFile && dealImagePreview && dealImagePreview.startsWith("http")) {
        formData.append("image_url", dealImagePreview);
      }

      // Do not set Content-Type manually — axios must add multipart boundary automatically
      if (editingDealId) {
        if (!dealImageFile && !dealImagePreview) formData.append("clear_image", "true");
        await api.put(`/deals/${editingDealId}`, formData);
        setAlert({ msg: "Deal updated", type: "success" });
      } else {
        await api.post("/deals", formData);
        setAlert({ msg: "Deal created", type: "success" });
      }
      resetDealForm();
      fetchDeals();
    } catch (err) {
      const d = err.response?.data;
      const parts = [
        d?.message,
        d?.sqlMessage,
        d?.hint,
      ].filter(Boolean);
      const msg = parts.length ? parts.join(" ") : err.message || "Failed to save deal";
      setAlert({ msg: String(msg), type: "error" });
    }
  };

  const editDeal = (d) => {
    setEditingDealId(d.id);
    setDealForm({
      title: d.title || "",
      description: d.description || "",
      discount: String(d.discount ?? ""),
      valid_from: d.valid_from ? String(d.valid_from).slice(0, 10) : "",
      valid_until: d.valid_until ? String(d.valid_until).slice(0, 10) : "",
    });
    setDealMenuIds(Array.isArray(d.menu_item_ids) ? d.menu_item_ids.map(Number) : []);
    setDealImageFile(null);
    setDealImagePreview(d.image_url || null);
    if (dealFileInputRef.current) dealFileInputRef.current.value = "";
  };

  const removeDeal = async (id) => {
    if (!window.confirm("Delete this deal?")) return;
    try {
      await api.delete(`/deals/${id}`);
      setAlert({ msg: "Deal removed", type: "success" });
      if (editingDealId === id) resetDealForm();
      fetchDeals();
    } catch {
      setAlert({ msg: "Failed to delete deal", type: "error" });
    }
  };

  const changeOrderStatus = async (orderId, status) => {
    try {
      if (status === 'accepted') {
        await api.patch(`/restaurants/dashboard/orders/${orderId}/accept`);
      } else {
        await api.patch(`/restaurants/dashboard/orders/${orderId}/status`, { status });
      }
      fetchOrders();
      setAlert({ msg: `Order marked as ${status}`, type: "success" });
    } catch {
      setAlert({ msg: "Failed to update status", type: "error" });
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--color-background-soft)]"><Navbar /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-[var(--color-background-soft)] font-['Outfit']">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vendor Dashboard</h2>
            <p className="text-gray-500 font-medium mt-1">Hello, <span className="text-[var(--color-brand)] font-bold">{restaurant?.name || "Restaurant"}</span>!</p>
          </div>
          
          <div className="flex bg-white rounded-full shadow-sm p-1.5 border border-gray-200 w-full md:w-auto flex-wrap justify-center gap-1">
             <button 
               onClick={() => setActiveTab("orders")}
               className={`flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'orders' ? 'bg-[var(--color-brand)] text-white shadow-[0_4px_15px_rgba(215,15,100,0.3)]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
             >
               Orders
             </button>
             <button 
               onClick={() => setActiveTab("menu")}
               className={`flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'menu' ? 'bg-[var(--color-brand)] text-white shadow-[0_4px_15px_rgba(215,15,100,0.3)]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
             >
               Menu
             </button>
             <button 
               onClick={() => setActiveTab("deals")}
               className={`flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'deals' ? 'bg-[var(--color-brand)] text-white shadow-[0_4px_15px_rgba(215,15,100,0.3)]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
             >
               Deals
             </button>
          </div>
        </div>

        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                <span className="w-9 h-9 rounded-xl bg-pink-50 text-[var(--color-brand)] flex items-center justify-center">
                  <i className="fa-solid fa-bell-concierge text-base"></i>
                </span>
                Live Orders
                <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-[var(--color-brand)] text-white">
                  {orders.length}
                </span>
              </h3>
              {/* Legend */}
              <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-gray-400">
                {["pending","accepted","preparing","ready","completed"].map(s => (
                  <span key={s} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: STATUS_CONFIG[s].color }} />
                    {STATUS_CONFIG[s].label}
                  </span>
                ))}
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-24 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100 mb-4">
                  <i className="fa-solid fa-mug-hot text-3xl text-gray-300"></i>
                </div>
                <h4 className="text-xl font-bold text-gray-800">No active orders</h4>
                <p className="text-gray-500 font-medium mt-1">Waiting for customers to place orders...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["pending"];
                  const isTerminal = order.status === "completed" || order.status === "rejected";
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
                      style={{ borderLeftColor: cfg.color, borderLeftWidth: 4 }}
                    >
                      {/* ── Top row: order info + action button ── */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 pt-5 pb-4">

                        {/* Left: ID + customer + amount */}
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Status icon circle */}
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-base shadow-sm"
                            style={{ background: cfg.color }}
                          >
                            <i className={`fa-solid ${cfg.icon}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-gray-900 text-base">Order #{order.id}</span>
                              <span
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize"
                                style={{ background: cfg.bg, color: cfg.color }}
                              >
                                {cfg.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500 font-medium">
                              <i className="fa-regular fa-user text-gray-300 text-xs" />
                              <span>{order.customer_name}</span>
                              <span className="text-gray-300">•</span>
                              <span className="font-black text-[var(--color-brand)] text-base">
                                Rs {Number(order.total_price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!isTerminal && cfg.next && (
                            <button
                              onClick={() => changeOrderStatus(order.id, cfg.next)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold bg-gradient-to-r ${cfg.nextColor} transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0`}
                              style={{ boxShadow: `0 4px 14px ${cfg.nextShadow}` }}
                            >
                              <i className={`fa-solid ${cfg.nextIcon} text-xs`} />
                              {cfg.nextLabel}
                            </button>
                          )}
                          {order.status === "pending" && (
                            <button
                              onClick={() => changeOrderStatus(order.id, "rejected")}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-red-500 text-sm font-bold border border-red-200 bg-white hover:bg-red-50 transition-all"
                            >
                              <i className="fa-solid fa-xmark text-xs" />
                              Reject
                            </button>
                          )}
                          {order.status === "completed" && (
                            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-green-600 text-sm font-bold bg-green-50 border border-green-200">
                              <i className="fa-solid fa-circle-check" /> Done
                            </span>
                          )}
                          {order.status === "rejected" && (
                            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-red-500 text-sm font-bold bg-red-50 border border-red-200">
                              <i className="fa-solid fa-ban" /> Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── Status pipeline stepper ── */}
                      {!isTerminal && (
                        <div className="px-5 pb-5">
                          <StatusPipeline currentStatus={order.status} />
                        </div>
                      )}
                      {order.status === "rejected" && (
                        <div className="px-5 pb-4">
                          <div className="h-1 w-full rounded-full bg-red-100 flex overflow-hidden">
                            <div className="h-full bg-red-400 rounded-full" style={{ width: "100%" }} />
                          </div>
                          <p className="text-xs text-red-400 font-semibold mt-1.5">This order was rejected</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "deals" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold mb-2 text-gray-900 border-b border-gray-100 pb-4">
                  {editingDealId ? "Edit deal" : "Create deal"}
                </h3>
                <p className="text-xs text-gray-500 font-medium mb-6">Promotions appear on the customer homepage (when active).</p>
                <form onSubmit={saveDeal} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] outline-none text-sm font-medium shadow-sm"
                      placeholder="e.g. 50% OFF on Burgers"
                      value={dealForm.title}
                      onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] outline-none text-sm font-medium resize-none h-24 shadow-sm"
                      placeholder="Short promo text…"
                      value={dealForm.description}
                      onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Discount %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] outline-none text-sm font-medium shadow-sm"
                      placeholder="50"
                      value={dealForm.discount}
                      onChange={(e) => setDealForm({ ...dealForm, discount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Valid from</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium shadow-sm"
                        value={dealForm.valid_from}
                        onChange={(e) => setDealForm({ ...dealForm, valid_from: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Valid until</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium shadow-sm"
                        value={dealForm.valid_until}
                        onChange={(e) => setDealForm({ ...dealForm, valid_until: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Related menu items <span className="text-gray-300 font-normal normal-case">(optional)</span>
                    </label>
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-2 space-y-1">
                      {myMenu.length === 0 ? (
                        <p className="text-xs text-gray-400 px-2 py-2">Add menu items first to link them here.</p>
                      ) : (
                        myMenu.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer text-sm font-medium text-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={dealMenuIds.includes(item.id)}
                              onChange={() => toggleDealMenuId(item.id)}
                              className="rounded border-gray-300 text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                            />
                            <span className="truncate">{item.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Deal image <span className="text-gray-300 font-normal normal-case">(optional)</span>
                    </label>
                    {dealImagePreview && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 shadow-sm w-full h-32 relative">
                        <img
                          src={dealImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(ev) => { ev.target.src = PLACEHOLDER_IMG; }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDealImageFile(null);
                            setDealImagePreview(null);
                            if (dealFileInputRef.current) dealFileInputRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors text-xs"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:bg-pink-50 hover:border-[var(--color-brand)] transition-all">
                      <i className="fa-solid fa-cloud-arrow-up text-xl text-gray-300 mb-0.5" />
                      <span className="text-[10px] font-semibold text-gray-400 px-2 text-center">JPG, PNG, WEBP · max 2MB</span>
                      <input
                        ref={dealFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleDealImageChange}
                      />
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-[var(--color-brand)] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[var(--color-brand-hover)] transition-all">
                      {editingDealId ? "Update deal" : "Publish deal"}
                    </button>
                    {editingDealId && (
                      <button type="button" onClick={resetDealForm} className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-h-[400px]">
                <h3 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">
                  Your deals ({myDeals.length})
                </h3>
                {myDeals.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <i className="fa-solid fa-tags text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-600 font-bold">No deals yet</p>
                    <p className="text-gray-400 text-sm mt-1">Create a promotion to show on the customer app.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {myDeals.map((d) => (
                      <div
                        key={d.id}
                        className="border border-gray-100 rounded-2xl overflow-hidden hover:border-[var(--color-brand)] hover:shadow-md transition-all flex flex-col bg-white"
                      >
                        <div className="h-28 bg-gray-100 relative">
                          {d.image_url ? (
                            <SafeImage src={d.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-orange-200" />
                          )}
                          <span className="absolute top-2 left-2 bg-white text-[var(--color-brand)] text-[10px] font-black px-2 py-1 rounded-full shadow">
                            {d.discount_text}
                          </span>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h4 className="font-extrabold text-gray-900 text-sm line-clamp-2">{d.title}</h4>
                          <p className="text-gray-500 text-xs line-clamp-2 mt-1">{d.description || "—"}</p>
                          <p className="text-[10px] text-gray-400 mt-2 font-medium">
                            {d.valid_from || d.valid_until
                              ? `${d.valid_from || "…"} → ${d.valid_until || "…"}`
                              : "No date limit"}
                          </p>
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                            <button
                              type="button"
                              onClick={() => editDeal(d)}
                              className="flex-1 py-2 rounded-lg bg-pink-50 text-[var(--color-brand)] text-xs font-bold hover:bg-[var(--color-brand)] hover:text-white transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDeal(d.id)}
                              className="flex-1 py-2 rounded-lg bg-gray-50 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">{editingId ? "Edit Menu Item" : "Create Menu Item"}</h3>
                <form onSubmit={saveMenu} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Item Name</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] outline-none transition-all focus:bg-white font-medium text-sm shadow-sm"
                      placeholder="e.g. Spicy Chicken Burger"
                      value={menuItem.name}
                      onChange={(e) => setMenuItem({ ...menuItem, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price (Rs)</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] outline-none transition-all focus:bg-white font-medium text-sm shadow-sm"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={menuItem.price}
                      onChange={(e) => setMenuItem({ ...menuItem, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] outline-none transition-all focus:bg-white font-medium text-sm shadow-sm"
                      placeholder="e.g. Burgers, Beverages, Desserts"
                      value={menuItem.category || ""}
                      onChange={(e) => setMenuItem({ ...menuItem, category: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] outline-none transition-all focus:bg-white font-medium text-sm resize-none h-28 shadow-sm"
                      placeholder="Brief description of ingredients..."
                      value={menuItem.description}
                      onChange={(e) => setMenuItem({ ...menuItem, description: e.target.value })}
                    ></textarea>
                  </div>

                  {/* ── Image Upload ─────────────────────────────────── */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Item Image <span className="text-gray-300 font-normal normal-case">(optional)</span></label>

                    {/* Preview box */}
                    {imagePreview && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 shadow-sm w-full h-36 relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                        />
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <i className="fa-solid fa-xmark text-[10px]" />
                        </button>
                      </div>
                    )}

                    {/* Drop zone */}
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:bg-pink-50 hover:border-[var(--color-brand)] transition-all group">
                      <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-300 group-hover:text-[var(--color-brand)] transition-colors mb-1" />
                      <span className="text-[11px] font-semibold text-gray-400 group-hover:text-[var(--color-brand)] transition-colors text-center px-2">
                        {imageFile ? imageFile.name : "Click to upload · JPG, PNG, WEBP · Max 2MB"}
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-[var(--color-brand)] text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-[var(--color-brand-hover)] transition-all transform hover:-translate-y-0.5">
                      {editingId ? "Save Changes" : "Add to Menu"}
                    </button>
                    {editingId && (
                      <button type="button" onClick={resetForm} className="px-5 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-sm">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full">
                <h3 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">
                  Active Menu Items ({myMenu.length})
                </h3>
                
                {myMenu.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <i className="fa-solid fa-utensils text-5xl text-gray-300 mb-3"></i>
                    <p className="text-gray-500 font-bold mb-2">Your menu is empty</p>
                    <p className="text-gray-400 text-sm font-medium">Add some items to start receiving orders.</p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {myMenu.map((item) => (
                      <div key={item.id} className="border border-gray-100 bg-white rounded-2xl overflow-hidden hover:border-[var(--color-brand)] hover:shadow-md transition-all group relative flex flex-col">
                        {/* Image thumbnail */}
                        <div className="w-full h-36 shrink-0 relative overflow-hidden bg-gray-100">
                          <SafeImage
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Hover action buttons */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                            <button onClick={() => editMenu(item)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors shadow-sm">
                              <i className="fa-solid fa-pen text-xs" />
                            </button>
                            <button onClick={() => removeMenu(item.id)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm">
                              <i className="fa-solid fa-trash text-xs" />
                            </button>
                          </div>
                        </div>
                        {/* Text info */}
                        <div className="p-4 flex flex-col flex-grow">
                          <h4 className="font-extrabold text-gray-900 text-base tracking-tight leading-tight line-clamp-1">{item.name}</h4>
                          <div className="flex items-center justify-between gap-2 mt-1 mb-2">
                            <p className="text-[var(--color-brand)] font-black text-lg">Rs {Number(item.price).toFixed(2)}</p>
                            {item.category && (
                              <span className="bg-pink-50 text-[var(--color-brand)] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-pink-100 uppercase tracking-wider">{item.category}</span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed font-medium">{item.description || "No description provided."}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {alert && <AlertInfo message={alert.msg} type={alert.type} onClose={() => setAlert(null)} />}
    </div>
  );
};

export default RestaurantDashboardPage;
