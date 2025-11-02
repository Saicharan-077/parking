require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const app = express();

// HTTPS Enforcement Middleware
app.use((req, res, next) => {
  // Skip HTTPS enforcement in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Check if request is HTTPS
  if (req.header('x-forwarded-proto') !== 'https' && req.protocol !== 'https') {
    // Redirect to HTTPS
    res.redirect(`https://${req.header('host') || req.hostname}${req.url}`);
  } else {
    next();
  }
});

// Security headers with HSTS
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS access
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  name: 'auth.sid' // Change default session name
}));

app.use(express.json());

// Rate limiting configuration for OAuth endpoints
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 10 OAuth requests per windowMs
  message: 'Too many OAuth attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            "parking.vjstartup.com",
            "dev-parking.vjstartup.com",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:4000",
            "http://127.0.0.1:6000",
            "http://127.0.0.1:3117",
            "http://127.0.0.1:3119",
            "https://dev-auth.vjstartup.com",
            "https://auth.vjstartup.com",
            /^https?:\/\/([a-zA-Z0-9-]+\.)?vjstartup\.com/
        ];

        // Check if the origin matches any of the allowed origins
        const isAllowed = allowedOrigins.some((allowedOrigin) => {
            if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin); // Check with regex for subdomains
            }
            return origin === allowedOrigin;
        });

        

        if (isAllowed || !origin) {
            callback(null, true); // ✅ Allow the request
        } else {
            callback(new Error('Not allowed by CORS'), false); // ❌ Reject the request
        }
    },
    credentials: true   // ✅ Allow cross-origin cookies
}));
app.options("*", cors());
app.use(cookieParser());

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/auth/google", oauthLimiter, async (req, res) => {
    const { token } = req.body;
    console.log("🔍 Debug: Received Google Token =", token);

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        console.log("✅ Google Token Verified:", payload);

        const { email, name, picture, family_name } = payload;

        // Force logout from other devices - destroy all existing sessions for this user
        if (req.sessionStore) {
            req.sessionStore.all((error, sessions) => {
                if (error) {
                    console.error('Error accessing sessions:', error);
                    return;
                }

                Object.keys(sessions).forEach(sessionId => {
                    const session = sessions[sessionId];
                    if (session.user && session.user.email === email && sessionId !== req.session.id) {
                        req.sessionStore.destroy(sessionId, (err) => {
                            if (err) console.error('Error destroying session:', err);
                        });
                    }
                });
            });
        }

        // ✅ Generate new JWT for internal authentication
        const userToken = jwt.sign(
            { email, name, picture, family_name },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        // Store user info in server-side session
        req.session.user = { email, name, picture, family_name };
        req.session.authenticated = true;
        req.session.lastActivity = Date.now();

        const isLocalhost = req.hostname === '127.0.0.1' || req.hostname.startsWith('127.') || req.hostname === '::1';
        const cookieDomain = isLocalhost ? undefined : '.vjstartup.com'; // no domain needed for localhost

        // ✅ Set cookies with correct flags
       // Set userToken cookie
res.cookie("userToken", userToken, {
    domain: cookieDomain,       // ✅ dynamic
    path: "/",
    httpOnly: true,
    secure: !isLocalhost,       // ✅ true if HTTPS (production)
    sameSite: "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  // Set user info cookie
  res.cookie("user", JSON.stringify({ email, name, picture, family_name }), {
    domain: cookieDomain,       // ✅ dynamic
    path: "/",
    secure: !isLocalhost,
    sameSite: "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

        console.log("✅ Cookies Set in Response Headers:", res.getHeaders()['set-cookie']);

        res.json({ token: userToken, user: { email, name, picture ,family_name} });

    } catch (error) {
        console.error("❌ Google Token Verification Failed:", error);
        res.status(401).json({ error: "Invalid Token" });
    }
});





app.get("/check-auth", (req, res) => {
    console.log("🔍 Debug: Received Check-auth ");

    // Check server-side session first
    if (req.session.authenticated && req.session.user) {
        // Update last activity
        req.session.lastActivity = Date.now();
        return res.json({ logged_in: true, user: req.session.user });
    }

    // Fallback to JWT token check
    const token = req.cookies.userToken;
    if (!token) {
        return res.json({ logged_in: false });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        // Sync session with JWT if session is missing
        if (!req.session.authenticated) {
            req.session.user = user;
            req.session.authenticated = true;
            req.session.lastActivity = Date.now();
        }
        res.json({ logged_in: true, user });
    } catch (error) {
        // Clear invalid session
        req.session.destroy();
        res.json({ logged_in: false });
    }
});



app.post("/verify-token", (req, res) => {
    const { token } = req.body; // ✅ Get token from request body
    console.log("🔍 Debug: Received Token for Verification =", token);

    if (!token) return res.status(401).json({ valid: false });

    try {
        // ✅ Verify the token using your secret
        const user = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token Verified:", user);
        res.json({ valid: true, user });
    } catch (error) {
        console.error("❌ Token Verification Failed:", error);
        res.status(403).json({ valid: false });
    }
});

app.post("/logout", (req, res) => {
    console.log("🔍 Debug: Logout");

    // Destroy server-side session
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
        }
    });

    const isLocalhost = req.hostname === '127.0.0.1' || req.hostname.startsWith('127.') || req.hostname === '::1';
    const cookieDomain = isLocalhost ? undefined : '.vjstartup.com'; // no domain needed for localhost

    // Clear userToken cookie for all subdomains of vjstartup.com
    res.cookie("userToken", "", {
        domain: cookieDomain,    // ✅ dynamic domain
        path: "/",               // Applies to the entire domain
        expires: new Date(0),    // Set expiry date in the past to delete the cookie
        httpOnly: true,          // Secure the cookie from JavaScript access
        secure: !isLocalhost,    // ✅ true if HTTPS (production)
        sameSite: "Lax"          // Set appropriate SameSite policy
    });

    // Optionally, clear the 'user' cookie as well
    res.cookie("user", "", {
        domain: cookieDomain,    // ✅ dynamic domain
        path: "/",
        expires: new Date(0),
        secure: !isLocalhost,    // ✅ true if HTTPS (production)
        sameSite: "Lax"
    });

    res.json({ success: true });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Auth Server running on port ${PORT}`));
