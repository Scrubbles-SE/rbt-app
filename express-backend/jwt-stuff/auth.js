import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
    try {
        // First try to get token from cookies
        let token = req.cookies.jwt;
        let tokenSource = "cookie";

        // If no cookie, check Authorization header (Bearer token)
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            console.log(
                "Auth header found:",
                authHeader.substring(0, 15) + "..."
            );

            // Check if it's a Bearer token
            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                tokenSource = "authorization_header";
                console.log(
                    "Using token from Authorization header"
                );
            }
        }

        if (!token) {
            console.log(
                "No token found in request (cookies or auth header)"
            );
            return res
                .status(401)
                .json({ message: "Authentication required" });
        }

        // Verify token
        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            // Add userId to request object
            req.userId = decoded.userId;
            console.log(
                `Auth successful via ${tokenSource} - userId: ${req.userId}`
            );

            next();
        } catch (jwtError) {
            console.error(
                "JWT verification error:",
                jwtError.name
            );

            if (jwtError.name === "JsonWebTokenError") {
                return res
                    .status(401)
                    .json({ message: "Invalid token" });
            }
            if (jwtError.name === "TokenExpiredError") {
                return res
                    .status(401)
                    .json({ message: "Token expired" });
            }
            throw jwtError;
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({
            message: "Authentication failed"
        });
    }
};
