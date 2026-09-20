/**
 * @file User.js
 * @description Mongoose model for Users with cached instance check and bcrypt guard.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

if (mongoose.models && mongoose.models.User) {
  module.exports = mongoose.models.User;
} else {
  const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: 50,
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false,
      },
      role: {
        type: String,
        enum: ['Admin', 'Developer', 'Tester'],
        default: 'Developer',
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      refreshToken: {
        type: String,
        select: false,
      },
      lastLogin: {
        type: Date,
      },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  };

  module.exports = mongoose.model('User', userSchema);
}