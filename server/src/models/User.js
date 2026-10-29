import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    preferredCurrency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3
    },
    timezone: {
      type: String,
      default: 'UTC',
      trim: true
    },
    accountStatus: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    preferredCurrency: this.preferredCurrency,
    timezone: this.timezone,
    accountStatus: this.accountStatus,
    createdAt: this.createdAt
  };
};

export const User = mongoose.model('User', userSchema);
