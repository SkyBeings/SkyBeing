import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import {
    createShiprocketShipment,
    generateAWB,
    trackShipmentByAWB,
    cancelShiprocketShipment,
    getShiprocketToken,
} from "../utils/shiprocket.service.js";

/**
 * POST /api/v1/shiprocket/create/:orderId
 * Manually trigger shipment creation for an order (Admin)
 */
const createShipment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("products.productId");

    if (!order) throw new ApiError(404, "Order not found");
    if (!order.isConfirmed) throw new ApiError(400, "Order is not confirmed yet");
    if (order.shiprocketOrderId) {
        return res.status(200).json(
            new ApiResponse(200, { shiprocketOrderId: order.shiprocketOrderId }, "Shipment already created")
        );
    }

    const populatedProducts = order.products.map((p) => ({
        product: p.productId,
        quantity: p.quantity,
    }));

    const shipmentData = await createShiprocketShipment(order, populatedProducts);

    // Save Shiprocket IDs back to the order
    order.shiprocketOrderId = shipmentData.order_id;
    order.shiprocketShipmentId = shipmentData.shipment_id;
    order.orderStatus = "processing";
    await order.save();

    // Auto-assign AWB if shipment was created successfully
    if (shipmentData.shipment_id) {
        try {
            const awbData = await generateAWB(shipmentData.shipment_id);
            if (awbData?.response?.data?.awb_code) {
                order.awbCode = awbData.response.data.awb_code;
                order.courierName = awbData.response.data.courier_name || "";
                await order.save();
            }
        } catch (awbErr) {
            console.warn("AWB auto-assign failed (non-fatal):", awbErr.message);
        }
    }

    return res.status(201).json(
        new ApiResponse(201, {
            shiprocketOrderId: order.shiprocketOrderId,
            shiprocketShipmentId: order.shiprocketShipmentId,
            awbCode: order.awbCode || null,
            courierName: order.courierName || null,
        }, "Shipment created successfully")
    );
});

/**
 * GET /api/v1/shiprocket/track/:orderId
 * Track shipment by MongoDB order ID
 */
const trackShipment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    if (!order.awbCode) {
        return res.status(200).json(
            new ApiResponse(200, {
                status: order.orderStatus,
                message: "Shipment not yet dispatched. No AWB assigned.",
            }, "Tracking info")
        );
    }

    const trackingData = await trackShipmentByAWB(order.awbCode);

    return res.status(200).json(
        new ApiResponse(200, {
            awbCode: order.awbCode,
            courierName: order.courierName,
            tracking: trackingData,
        }, "Tracking info fetched")
    );
});

/**
 * POST /api/v1/shiprocket/cancel/:orderId
 * Cancel a Shiprocket shipment (Admin)
 */
const cancelShipment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    if (!order.shiprocketOrderId) {
        throw new ApiError(400, "No Shiprocket shipment found for this order");
    }

    await cancelShiprocketShipment([order.shiprocketOrderId]);

    order.orderStatus = "cancelled";
    await order.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Shipment cancelled successfully")
    );
});

/**
 * GET /api/v1/shiprocket/ping
 * Test Shiprocket credentials
 */
const pingShiprocket = asyncHandler(async (req, res) => {
    const token = await getShiprocketToken();
    return res.status(200).json(
        new ApiResponse(200, { authenticated: !!token }, "Shiprocket credentials are valid ✅")
    );
});

export { createShipment, trackShipment, cancelShipment, pingShiprocket };
