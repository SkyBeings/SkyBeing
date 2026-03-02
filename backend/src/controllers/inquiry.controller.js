import { Inquiry } from "../models/inquiry.model.js";

// Create a new inquiry
export const createInquiry = async (req, res) => {
    try {
        const { name, email, subject, message, phone } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, and message"
            });
        }

        const inquiry = await Inquiry.create({
            name,
            email,
            subject,
            message,
            phone
        });

        res.status(201).json({
            success: true,
            data: inquiry,
            message: "Inquiry sent successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all inquiries (Admin only)
export const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: inquiries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark inquiry as read (Admin only)
export const markAsRead = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }

        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete inquiry (Admin only)
export const deleteInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Inquiry deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
