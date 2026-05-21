const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Stripe enforces roughly a $0.50 USD minimum per charge (see settlement currency rules).
// Rs 5.99 etc. will fail at the API — keep this above that floor (tune via env if FX moves a lot).
const MIN_CARD_ORDER_PKR =
  Number(process.env.STRIPE_MIN_ORDER_PKR) > 0
    ? Number(process.env.STRIPE_MIN_ORDER_PKR)
    : 200;

const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (amount < MIN_CARD_ORDER_PKR) {
      return res.status(400).json({
        message: `Card payments need a minimum order of Rs ${MIN_CARD_ORDER_PKR} (Stripe charge limit). Your total is Rs ${Number(amount).toFixed(2)}. Add more items or use Cash on Delivery.`,
      });
    }

    // PKR: amount in minor units (paisa), two-decimal currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "pkr",
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    if (error.code === "amount_too_small") {
      return res.status(400).json({
        message: `Order total is below Stripe's minimum charge for card payments. Minimum is about Rs ${MIN_CARD_ORDER_PKR}. Use Cash on Delivery or increase your cart total.`,
      });
    }
    res.status(500).json({ message: "Failed to create payment intent", error: error.message });
  }
};

module.exports = { createPaymentIntent };
