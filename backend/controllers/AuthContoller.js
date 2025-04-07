const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshTokenAndSetCookie, clearRefreshTokenCookie } = require('../lib/utilis');
const passport = require('passport');
const crypto = require('crypto');
const Invitation = require('../models/Invitation');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const Signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });

        if (newUser) {
            await newUser.save();

            res.status(201).json({
                success: true,
                message: "Signup successful. Please login."
            });

        }
        else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const Login = async (req, res) => {
    const { email, password } = req.body;

    try{
        if(!email || !password){
            return res.status(400).json({message:'All fields are required'});
        }

        const user = await User.findOne({email}).select('+password');
        if(!user){
            return res.status(400).json({message:'Invalid email or password'});
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message:'Invalid email or password'});
        }

        // Update lastActive timestamp when user logs in
        user.lastActive = new Date();
        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        generateRefreshTokenAndSetCookie(res, user._id);

        // Return access token and user info in the response body
        res.status(200).json({
            accessToken,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              profilePic: user.profilePic,
              role: user.role
            }
        });

    }
    catch(error){
        console.error("Login Error:", error);
        res.status(500).json({message: 'Server error during login.'});
    }
}

const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

const googleAuthCallback = (req, res, next) => {
  
  passport.authenticate('google', {
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`,
      session: false
    }, async (err, user, info) => {
    
    if (err) {
        console.error("Google Auth Error:", err);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_error`);
    }
    if (!user) {
        console.error("Google Auth Failed:", info?.message);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(info?.message || 'google_auth_failed')}`);
    }

    
    // User authenticated successfully by Google Strategy
    try {
        // Update lastActive for Google login
        user.lastActive = new Date();
        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        generateRefreshTokenAndSetCookie(res, user._id);
        

        // Redirect to a dedicated frontend callback handler page/route
        const feRedirectUrl = new URL(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`);
        feRedirectUrl.searchParams.set('accessToken', accessToken);
        feRedirectUrl.searchParams.set('user', JSON.stringify({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            role: user.role
        }));

        return res.redirect(feRedirectUrl.toString());

    } catch (error) {
        console.error("Error during Google auth token generation/redirect:", error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=processing_failed`);
    }
  })(req, res, next);
};

const Logout = async (req, res) => {
    clearRefreshTokenCookie(res);
    res.status(200).json({ message: 'Logged out successfully' });
}

const refreshTokenController = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not found' });
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Optional: Check if refresh token is revoked in DB if implementing revocation
        const user = await User.findById(decoded.userId);
        if (!user) {
             return res.status(401).json({ message: 'User not found for refresh token' });
        }
        // Issue a new access token
        const newAccessToken = generateAccessToken(decoded.userId);

        // Optionally update lastActive here as well
        user.lastActive = new Date();
        await user.save();

        res.status(200).json({ accessToken: newAccessToken });

    } catch (error) {
         console.error("Refresh Token Error:", error);
         clearRefreshTokenCookie(res); // Clear invalid refresh token cookie
         if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
             return res.status(403).json({ message: 'Invalid or expired refresh token' });
         }
         return res.status(500).json({ message: 'Server error during token refresh' });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        // req.user is populated by protectRoute middleware (using access token)
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update lastActive timestamp when user data is fetched via protected route
        user.lastActive = new Date();
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            role: user.role
        });
    } catch (error) {
        console.error("Get Current User Error:", error);
        res.status(500).json({ message: 'Server error fetching user data.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // Only admin should be able to get all users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to access this resource' });
        }
        
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD
  }
});

// Send invitation to a new team member
const inviteTeamMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    // Verify the current user is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can send invitations' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    
    // Generate a unique invitation token
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Token valid for 7 days
    
    // Create invitation record
    const invitation = new Invitation({
      email,
      role,
      token,
      expiresAt,
      invitedBy: req.user._id
    });
    
    await invitation.save();
    
    // Send email invitation
    const inviteUrl = `${process.env.FRONTEND_URL}/register?token=${token}`;
    
    // Here you would integrate with your email service (SendGrid, Nodemailer, etc.)
    // For example with Nodemailer:
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Invitation to join the team',
      html: `
        <h1>You've been invited to join the team</h1>
        <p>You've been invited by ${req.user.name} to join as a ${role}.</p>
        <p>Click the link below to create your account:</p>
        <a href="${inviteUrl}" style="padding: 10px 15px; background-color: #3182ce; color: white; border-radius: 5px; text-decoration: none;">Accept Invitation</a>
        <p>This invitation expires in 7 days.</p>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      
      return res.status(200).json({
        success: true,
        message: 'Invitation sent successfully'
      });
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      
      // If email sending fails, delete the invitation
      await Invitation.findByIdAndDelete(invitation._id);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send invitation email'
      });
    }
  } catch (error) {
    console.error('Error sending invitation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending invitation'
    });
  }
};

/**
 * Get count of pending invitations
 * @route GET /api/auth/pending-invites/count
 * @access Private (Admin only)
 */
const getPendingInvitesCount = async (req, res) => {
  try {
    // Verify the current user is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can view pending invitations' 
      });
    }
    
    const count = await Invitation.countDocuments({ 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });
    
    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting pending invites count:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting pending invites count'
    });
  }
};

// Add this new function to set user as inactive
const setInactive = async (req, res) => {
    try {
        // req.user is available thanks to protectRoute middleware
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const userId = req.user._id;
        await User.findByIdAndUpdate(userId, { $set: { lastActive: null } });

        res.status(200).json({ success: true, message: 'User marked as inactive.' });
    } catch (error) {
        console.error("Error setting user inactive:", error);
        res.status(500).json({ success: false, message: 'Failed to mark user as inactive.' });
    }
};

module.exports = { Signup, Login, Logout, googleAuth, googleAuthCallback, refreshTokenController, getCurrentUser, getAllUsers, inviteTeamMember, getPendingInvitesCount, setInactive };
