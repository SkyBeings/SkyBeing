import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema(
    {
        isMaintenanceMode: {
            type: Boolean,
            default: false
        },
        maintenanceMessage: {
            type: String,
            default: "We are currently upgrading our store. We will be back soon!"
        }
    },
    {
        timestamps: true
    }
);

export const SiteSettings = mongoose.model("SiteSettings", settingsSchema);
