import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../api/api";
import Navbar from "../components/Navbar";
import AlertInfo from "../components/AlertInfo";
import MapSelector from "../components/MapSelector";
import { useAuth } from "../context/AuthContext";

// Must stay in line with backend STRIPE_MIN_ORDER_PKR (default 200)
const STRIPE_MIN_CARD_ORDER_PKR = 200;
const PRIORITY_FEE = 79.50;
const SERVICE_FEE = 15.00;
const VAT_RATE = 0.05;
const TIP_OPTIONS = [0, 50, 100, 200, 300];
const SAVED_TIP_KEY = "foodify_saved_tip";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("foodify_cart") || "[]"));
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Delivery address state
  const [delivery, setDelivery] = useState({
    street: "",
    city: "",
    zip: "",
    lat: null,
    lng: null,
    fullAddress: ""
  });

  // Contact state
  const [contact, setContact] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: ""
  });

  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Delivery option: "standard" | "priority"
  const [deliveryOption, setDeliveryOption] = useState("standard");

  // Rider tip — 0 = "Not now"; restore saved preference on mount
  const [riderTip, setRiderTip] = useState(() => {
    const saved = localStorage.getItem(SAVED_TIP_KEY);
    return saved !== null ? Number(saved) : 0;
  });
  const [saveTipForNext, setSaveTipForNext] = useState(() => {
    return localStorage.getItem(SAVED_TIP_KEY) !== null;
  });

  // Persist tip preference whenever it changes
  useEffect(() => {
    if (saveTipForNext) {
      localStorage.setItem(SAVED_TIP_KEY, String(riderTip));
    } else {
      localStorage.removeItem(SAVED_TIP_KEY);
    }
  }, [riderTip, saveTipForNext]);

  // Redirect to cart if empty
  useEffect(() => {
    if (!cart.length) navigate("/cart");
  }, [cart, navigate]);

  // ── Real-time billing calculations ──
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const deliveryFee = deliveryOption === "priority" ? PRIORITY_FEE : 0;
  const serviceFee = SERVICE_FEE;
  const vat = parseFloat(((subtotal + deliveryFee) * VAT_RATE).toFixed(2));
  const grandTotal = parseFloat(
    (subtotal + deliveryFee + serviceFee + vat + riderTip).toFixed(2)
  );

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) return;

    if (!delivery.street.trim() || !contact.phone.trim() || !contact.firstName.trim()) {
      setAlert("Please fill in all required delivery and contact details.");
      return;
    }

    if (payment === "card" && !stripe) {
      setAlert("Stripe has not loaded yet. Please try again.");
      return;
    }

    if (payment === "card" && grandTotal < STRIPE_MIN_CARD_ORDER_PKR) {
      setAlert(
        `Card payments need a minimum order of Rs ${STRIPE_MIN_CARD_ORDER_PKR} (Stripe rule). Your total is Rs ${grandTotal.toFixed(2)}. Add more items or choose Cash on Delivery.`
      );
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      let transactionId = null;
      let paymentStatus = "pending";

      if (payment === "card") {
        // Pass grand total (incl. fees & tip) to Stripe
        const intentRes = await api.post("/payment/create-intent", { amount: grandTotal });
        const clientSecret = intentRes.data.clientSecret;

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Card field is not ready. Please refresh the page and try again.");
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${contact.firstName} ${contact.lastName}`.trim(),
              email: contact.email,
              phone: contact.phone
            }
          },
        });

        if (error) throw new Error(error.message);
        if (paymentIntent.status !== "succeeded") {
          throw new Error("Payment failed. Please try another card.");
        }

        transactionId = paymentIntent.id;
        paymentStatus = "paid";
      }

      const res = await api.post("/orders", {
        restaurantId: cart[0].restaurantId,
        items: cart.map((item) => ({ itemId: item.itemId, quantity: item.quantity })),
        paymentMethod: payment,
        paymentStatus,
        transactionId,
        deliveryAddress: delivery,
        contactInfo: contact,
        deliveryFee,
        serviceFee,
        vat,
        riderTip
      });

      setAlert("Your order has been placed successfully!");

      setTimeout(() => {
        navigate("/order-confirmation", { state: { orderId: res.data.orderId } });
      }, 1500);

    } catch (error) {
      setAlert(error.response?.data?.message || error.message || "Failed to place order.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-soft)] font-['Outfit'] pb-20">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Checkout</h2>
        </div>

        <form onSubmit={placeOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-pink-100 text-[var(--color-brand)] flex items-center justify-center text-sm">
                  <i className="fa-solid fa-map-location-dot"></i>
                </span>
                Delivery Address
              </h3>

              <div className="mb-6 h-64 sm:h-72">
                <MapSelector onLocationChange={(details) => setDelivery(prev => ({ ...prev, ...details }))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Street / Building / Apt *</label>
                  <input
                    type="text"
                    value={delivery.street}
                    onChange={(e) => setDelivery({ ...delivery, street: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition-all focus:bg-white bg-gray-50/50"
                    placeholder="E.g. House 123, Street 4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={delivery.city}
                    onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition-all focus:bg-white bg-gray-50/50"
                    placeholder="E.g. Lahore"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={delivery.zip}
                    onChange={(e) => setDelivery({ ...delivery, zip: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition-all focus:bg-white bg-gray-50/50"
                    placeholder="E.g. 54000"
                  />
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-user"></i>
                </span>
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                  <input type="text" value={contact.firstName}
                    onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition-all focus:bg-white bg-gray-50/50"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input type="text" value={contact.lastName}
                    onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition-all focus:bg-white bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <input type="email" value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition-all focus:bg-white bg-gray-50/50"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition-all focus:bg-white bg-gray-50/50"
                    placeholder="0300 1234567" required />
                </div>
              </div>
            </div>

            {/* ── Delivery Options ── */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-motorcycle"></i>
                </span>
                Delivery options
              </h3>

              <div className="space-y-3">
                {/* Standard */}
                <div
                  id="delivery-option-standard"
                  onClick={() => setDeliveryOption("standard")}
                  className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryOption === "standard"
                      ? "border-gray-900 bg-white"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      deliveryOption === "standard" ? "border-gray-900" : "border-gray-300"
                    }`}>
                      {deliveryOption === "standard" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-900"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-base">Standard</span>
                      <span className="ml-2.5 text-gray-400 text-sm font-medium">25 – 40 mins</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600">Free</span>
                </div>

                {/* Priority */}
                <div
                  id="delivery-option-priority"
                  onClick={() => setDeliveryOption("priority")}
                  className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryOption === "priority"
                      ? "border-gray-900 bg-white"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      deliveryOption === "priority" ? "border-gray-900" : "border-gray-300"
                    }`}>
                      {deliveryOption === "priority" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-900"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-base">Priority</span>
                      <span className="ml-2.5 text-gray-400 text-sm font-medium">20 – 35 mins</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 whitespace-nowrap">
                    + Rs. {PRIORITY_FEE.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Tip Your Rider ── */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-1 text-gray-900">Tip your rider</h3>
              <p className="text-sm text-gray-500 font-medium mb-6">Your rider receives 100% of the tip</p>

              <div className="flex flex-wrap gap-3 mb-6">
                {TIP_OPTIONS.map((amount) => {
                  const isActive = riderTip === amount;
                  const isNotNow = amount === 0;
                  return (
                    <button
                      key={amount}
                      type="button"
                      id={`tip-btn-${isNotNow ? "notnow" : amount}`}
                      onClick={() => setRiderTip(amount)}
                      className={`relative px-5 py-2.5 rounded-full border-2 font-bold transition-all cursor-pointer select-none ${
                        isActive
                          ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm">{isNotNow ? "Not now" : `Rs. ${amount.toFixed(2)}`}</span>
                      {amount === 50 && (
                        <span className={`block text-center text-[10px] leading-tight mt-0.5 ${isActive ? "text-gray-300" : "text-gray-400"}`}>
                          Most common
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Save tip preference */}
              <div
                id="save-tip-toggle"
                onClick={() => setSaveTipForNext((v) => !v)}
                className="flex items-center gap-3 cursor-pointer select-none w-fit"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  saveTipForNext ? "bg-gray-900 border-gray-900" : "border-gray-300 bg-white"
                }`}>
                  {saveTipForNext && <i className="fa-solid fa-check text-white" style={{ fontSize: "9px" }}></i>}
                </div>
                <span className="text-sm font-bold text-gray-700">Save it for the next order</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-wallet"></i>
                </span>
                Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${payment === "cod" ? "border-[var(--color-brand)] bg-pink-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                  <input type="radio" value="cod" checked={payment === "cod"} onChange={() => setPayment("cod")} className="hidden" />
                  <i className={`fa-solid fa-money-bill-wave text-2xl ${payment === "cod" ? "text-[var(--color-brand)]" : "text-gray-400"}`}></i>
                  <span className={`font-bold ${payment === "cod" ? "text-[var(--color-brand)]" : "text-gray-600"}`}>Cash on Delivery</span>
                </label>
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${payment === "card" ? "border-[var(--color-brand)] bg-pink-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                  <input type="radio" value="card" checked={payment === "card"} onChange={() => setPayment("card")} className="hidden" />
                  <i className={`fa-regular fa-credit-card text-2xl ${payment === "card" ? "text-[var(--color-brand)]" : "text-gray-400"}`}></i>
                  <span className={`font-bold ${payment === "card" ? "text-[var(--color-brand)]" : "text-gray-600"}`}>Credit / Debit Card</span>
                </label>
              </div>

              {payment === "card" && (
                <div className="mt-4 p-4 border rounded-xl border-gray-200 bg-white shadow-sm">
                  <CardElement options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#32325d",
                        fontFamily: "Outfit, sans-serif",
                        "::placeholder": { color: "#aab7c4" },
                      },
                      invalid: { color: "#fa755a", iconColor: "#fa755a" },
                    }
                  }} />
                </div>
              )}
            </div>

          </div>

          {/* ── Right Sidebar — Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 sticky top-8">

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Your order</h3>
                {cart.length > 0 && (
                  <Link to={`/menu/${cart[0].restaurantId}`} className="text-[var(--color-brand)] font-bold text-sm hover:underline flex items-center gap-1">
                    <i className="fa-solid fa-plus text-xs"></i> Add more items
                  </Link>
                )}
              </div>

              {/* Cart line items */}
              <div className="space-y-3 mb-6 max-h-52 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.itemId} className="flex justify-between items-start text-sm pb-3 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-700 leading-tight pr-4">
                      <span className="font-bold text-gray-900 mr-2 bg-gray-100 px-1.5 py-0.5 rounded text-xs">{item.quantity}x</span>
                      {item.name}
                    </span>
                    <span className="font-bold text-gray-900 whitespace-nowrap">Rs {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* ── Dynamic Billing Breakdown ── */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5 bg-gray-50/50 -mx-6 px-6 pb-6 -mb-6 rounded-b-3xl">

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900">Rs {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">
                    {deliveryOption === "priority" ? "Priority delivery" : "Standard delivery"}
                  </span>
                  {deliveryFee === 0
                    ? <span className="font-bold text-green-600">Free</span>
                    : <span className="font-bold text-gray-900">Rs {deliveryFee.toFixed(2)}</span>
                  }
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Service fee</span>
                  <span className="font-bold text-gray-900">Rs {serviceFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">VAT (5%)</span>
                  <span className="font-bold text-gray-900">Rs {vat.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm pb-3 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Rider's Tip</span>
                  {riderTip === 0
                    ? <span className="text-gray-400 font-medium text-xs italic">Not added</span>
                    : <span className="font-bold text-gray-900">Rs {riderTip.toFixed(2)}</span>
                  }
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-end pt-1">
                  <div>
                    <p className="font-black text-lg text-gray-900 leading-none">Total</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">(incl. fees and tax)</p>
                  </div>
                  <span className="font-black text-3xl text-[var(--color-brand)]">Rs {grandTotal.toFixed(2)}</span>
                </div>

                {/* Place Order */}
                <button
                  type="submit"
                  disabled={loading}
                  id="place-order-btn"
                  className="w-full mt-4 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] disabled:bg-pink-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-[0_8px_20px_rgba(215,15,100,0.3)] transition-all transform hover:-translate-y-0.5 flex justify-center items-center cursor-pointer"
                >
                  {loading
                    ? <span className="flex items-center gap-2"><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</span>
                    : "Place order"
                  }
                </button>

                <p className="text-[11px] text-center text-gray-400 font-medium pt-1 leading-relaxed">
                  By making this purchase you agree to our{" "}
                  <span className="text-[var(--color-brand)] underline cursor-pointer">terms and conditions</span>.
                </p>
              </div>

            </div>
          </div>

        </form>
      </main>

      {alert && (
        <AlertInfo
          message={typeof alert === "string" ? alert : alert.msg || alert.message || "Something went wrong"}
          type={alert.type || "error"}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};

const CheckoutPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default CheckoutPage;
