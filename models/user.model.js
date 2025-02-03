import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['User', 'Admin', 'Coach', 'Referee', 'Player'],
      default: 'User',
    },
    photo: {
      type: String,
    },
    imageUrl: {
      type: String,
      default:
        'https://d3awt09vrts30h.cloudfront.net/blank-profile-picture.webp',
    },
    bio: { type: String, default: '' },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    isOnboardingCompleted: { type: Boolean, default: false },
    wantedRole: { type: String, default: '' },
    isRoleSet: { type: Boolean, default: false },
    isProfileFilled: { type: Boolean, default: false },
    isRoleChangeNotificationRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
