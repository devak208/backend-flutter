const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 12);
  }
  
  // Set username as email prefix if not provided
  if (!user.username) {
    user.username = user.email.split('@')[0];
  }
  
  next();
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);