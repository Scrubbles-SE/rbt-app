import jwt from "jsonwebtoken";

// Create JWT token
export const createToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // Token expires in 7 days
    );
};

// Set JWT cookie
export const setTokenCookie = (res, token) => {
    // For production or if running on HTTPS
    const isProduction = process.env.NODE_ENV === "production";

    // iOS Safari requires secure=true when sameSite=none
    // Also store in localStorage as fallback for iOS devices
    res.cookie("jwt", token, {
        httpOnly: true, // Prevents JavaScript access
        secure: isProduction || process.env.HTTPS === "true", // HTTPS only in production or HTTPS env
        sameSite: isProduction ? "none" : "lax", // 'lax' is more permissive than 'strict' but safer than 'none'
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    // Send token in response for frontend to store as fallback
    // This allows clients to store in localStorage if cookies fail
    return {
        token,
        userId: jwt.decode(token).userId
    };
};
