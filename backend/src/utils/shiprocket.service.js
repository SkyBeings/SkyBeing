/**
 * Shiprocket Service
 * Handles authentication (JWT token with auto-refresh),
 * shipment creation, tracking, and cancellation.
 */

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// In-memory token cache
let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Get a valid Shiprocket JWT token.
 * Auto-refreshes if expired or not yet fetched.
 */
export const getShiprocketToken = async () => {
    const now = Date.now();

    // Return cached token if still valid (with 5 min buffer)
    if (cachedToken && tokenExpiresAt && now < tokenExpiresAt - 5 * 60 * 1000) {
        return cachedToken;
    }

    const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Shiprocket auth failed: ${err.message || response.statusText}`);
    }

    const data = await response.json();
    cachedToken = data.token;
    // Shiprocket tokens expire in 10 days; cache for 9 days
    tokenExpiresAt = now + 9 * 24 * 60 * 60 * 1000;

    console.log("✅ Shiprocket token refreshed");
    return cachedToken;
};

/**
 * Helper: Make an authenticated request to Shiprocket API
 */
const shiprocketRequest = async (endpoint, method = "GET", body = null) => {
    const token = await getShiprocketToken();

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${SHIPROCKET_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Shiprocket API error: ${response.statusText}`);
    }

    return data;
};

/**
 * Create a Shiprocket shipment order
 * @param {Object} order     - MongoDB order document (populated)
 * @param {Array}  products  - Populated product details
 */
export const createShiprocketShipment = async (order, products) => {
    const addr = order.shippingAddress || {};

    // Build order items for Shiprocket
    const orderItems = products.map((item) => ({
        name: item.product?.name || "Product",
        selling_price: item.product?.price || 0,
        units: item.quantity,
        sku: item.product?._id?.toString() || "SKU001",
        hsn: 0,
    }));

    const totalWeight = products.reduce((sum, item) => sum + (item.product?.weight || 0.5) * item.quantity, 0);

    const payload = {
        order_id: order._id.toString(),
        order_date: new Date(order.createdAt).toISOString().split("T")[0],
        pickup_location: "Primary",  // Must match your Shiprocket warehouse name
        channel_id: "",
        comment: order.orderNotes || "",
        billing_customer_name: order.customerName || "Customer",
        billing_last_name: "",
        billing_address: addr.street || "N/A",
        billing_address_2: "",
        billing_city: addr.city || "N/A",
        billing_pincode: addr.zipCode || "000000",
        billing_state: addr.state || "N/A",
        billing_country: addr.country || "India",
        billing_email: order.customerEmail || "",
        billing_phone: order.customerPhone || "0000000000",
        shipping_is_billing: true,
        order_items: orderItems,
        payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: order.totalAmount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: totalWeight > 0 ? totalWeight : 0.5,
    };

    return await shiprocketRequest("/orders/create/adhoc", "POST", payload);
};

/**
 * Generate AWB (Air Waybill) and assign courier
 * @param {number} shipmentId  - Shiprocket shipment_id
 * @param {number} courierId   - Optional courier company ID (auto-assign if not provided)
 */
export const generateAWB = async (shipmentId, courierId = null) => {
    const body = { shipment_id: [shipmentId] };
    if (courierId) body.courier_id = courierId;
    return await shiprocketRequest("/courier/assign/awb", "POST", body);
};

/**
 * Get tracking info for an AWB / order
 * @param {string} awbCode - AWB tracking code
 */
export const trackShipmentByAWB = async (awbCode) => {
    return await shiprocketRequest(`/courier/track/awb/${awbCode}`);
};

/**
 * Track by Shiprocket Order ID
 * @param {string} shiprocketOrderId - Shiprocket's order ID (not MongoDB _id)
 */
export const trackShipmentByOrderId = async (shiprocketOrderId) => {
    return await shiprocketRequest(`/orders/show/${shiprocketOrderId}`);
};

/**
 * Cancel a Shiprocket shipment
 * @param {Array} orderIds - Array of Shiprocket order IDs
 */
export const cancelShiprocketShipment = async (orderIds) => {
    return await shiprocketRequest("/orders/cancel", "POST", { ids: orderIds });
};
