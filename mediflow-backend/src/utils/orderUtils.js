// Generate Order Number
const generateOrderNumber = () => {
  return `ORD-${Date.now().toString().slice(-6)}`;
};

// Calculate Order Total
const calculateOrder = (
  products,
  discount = 0,
  shippingCharge = 0
) => {
  let subtotal = 0;

  products.forEach((item) => {
    subtotal += item.price * item.quantity;
  });

  const gst = Number((subtotal * 0.18).toFixed(2));

  const totalAmount = Number(
    (
      subtotal +
      gst +
      Number(shippingCharge) -
      Number(discount)
    ).toFixed(2)
  );

  return {
    subtotal,
    gst,
    totalAmount,
  };
};

module.exports = {
  generateOrderNumber,
  calculateOrder,
};