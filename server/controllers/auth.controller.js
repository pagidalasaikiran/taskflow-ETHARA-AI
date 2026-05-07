const User = require('../models/User');
const Activity = require('../models/Activity');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  console.log('[AUTH:REGISTER]: Incoming request', { email: req.body.email, name: req.body.name });
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      console.warn('[AUTH:REGISTER]: Missing required fields');
      return errorResponse(res, 'Please provide name, email and password', 400);
    }

    // Check if user already exists
    console.log('[AUTH:REGISTER]: Checking existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn('[AUTH:REGISTER]: User already exists', email);
      return errorResponse(res, 'A user with this email already exists', 400);
    }

    // Create user
    console.log('[AUTH:REGISTER]: Creating new user in DB...');
    const user = await User.create({ name, email, password, role });
    console.log('[AUTH:REGISTER]: User created successfully', user._id);

    // Log activity
    try {
      console.log('[AUTH:REGISTER]: Logging activity...');
      await Activity.logActivity(user._id, 'registered', 'member', user._id, `${user.name} joined the team`);
    } catch (actErr) {
      console.error('[AUTH:REGISTER]: Activity logging failed (non-critical)', actErr.message);
    }

    // Generate token
    console.log('[AUTH:REGISTER]: Generating JWT token...');
    const token = generateToken(user._id);

    console.log('[AUTH:REGISTER]: Sending success response');
    return successResponse(res, 'Registration successful', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    }, 201);
  } catch (error) {
    console.error('[AUTH:REGISTER]: CRITICAL ERROR', error);
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  console.log('[AUTH:LOGIN]: Incoming request', { email: req.body.email });
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.warn('[AUTH:LOGIN]: Missing credentials');
      return errorResponse(res, 'Please provide email and password', 400);
    }

    // Find user and include password
    console.log('[AUTH:LOGIN]: Searching for user...');
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.warn('[AUTH:LOGIN]: User not found', email);
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Compare password
    console.log('[AUTH:LOGIN]: Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn('[AUTH:LOGIN]: Password mismatch', email);
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate token
    console.log('[AUTH:LOGIN]: Generating token...');
    const token = generateToken(user._id);

    console.log('[AUTH:LOGIN]: Sending success response');
    return successResponse(res, 'Login successful', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('[AUTH:LOGIN]: CRITICAL ERROR', error);
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 'Profile fetched successfully', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };
