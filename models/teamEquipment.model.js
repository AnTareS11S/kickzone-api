import mongoose from 'mongoose';

const teamEquipmentSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    quantity: {
      type: Number,
      required: true,
      trim: true,
      min: 0,
      max: 999,
    },
    condition: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
  },
  { timestamps: true }
);

const TeamEquipment = mongoose.model('TeamEquipment', teamEquipmentSchema);

export default TeamEquipment;
