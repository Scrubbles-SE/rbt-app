import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            console.log("No token found in request");
            return res
                .status(401)
                .json({ message: "Authentication required" });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Add userId to request object
        req.userId = decoded.userId;
        console.log("Auth middleware - userId:", req.userId);

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        if (error.name === "JsonWebTokenError") {
            return res
                .status(401)
                .json({ message: "Invalid token" });
        }
        if (error.name === "TokenExpiredError") {
            return res
                .status(401)
                .json({ message: "Token expired" });
        }
        res.status(401).json({
            message: "Authentication failed"
        });
    }
};
