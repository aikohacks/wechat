const mongoose = require("mongoose");

const readReceiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    lastRead: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

readReceiptSchema.index({ user: 1, room: 1 }, { unique: true });

module.exports = mongoose.model("ReadReceipt", readReceiptSchema);