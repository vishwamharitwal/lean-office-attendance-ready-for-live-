import mongoose from "mongoose";

export interface ISetting {
  key: string;
  value: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const settingSchema = new mongoose.Schema<ISetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Setting || mongoose.model<ISetting>("Setting", settingSchema);
