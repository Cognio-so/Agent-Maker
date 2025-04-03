const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../lib/utilis');
const passport = require('passport');

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
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
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

        generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            role: user.role
          });

        
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
}

const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Google authentication failed' });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) { return next(loginErr); }

      generateToken(res, user._id);

      // Redirect based on user role
      const redirectUrl = user.role === 'admin' 
        ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin`
        : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/user`;
        
      return res.redirect(redirectUrl);
    });
  })(req, res, next);
};

const Logout = async (req, res) => {    
    res.clearCookie('token');
    res.status(200).json({message:'Logged out successfully'});
}

const getCurrentUser = async (req, res) => {
    try {
        // req.user should be populated by your auth middleware
        const userId = req.user._id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { Signup, Login, Logout, googleAuth, googleAuthCallback, getCurrentUser };
