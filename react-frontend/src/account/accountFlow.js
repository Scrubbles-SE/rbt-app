/*
IMPORTS
*/
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import RBDLogo from "./RBDLogo.png";
import { initDB } from "../utils/db";

// Styles
import {
    AccountContainer,
    FormContainer,
    Title,
    Form,
    InputGroup,
    Label,
    Input,
    Button,
    LogoImage,
    AlertOverlay,
    AlertText,
    PasswordStrengthContainer,
    PasswordStrengthBar,
    UserName,
    NameInput,
    RequirementsText,
    Tooltip,
    SubTitle,
    SuccessOverlay,
    SuccessCheckmark
} from "./account.styles";

// Services
import {
    checkIfUserExists,
    loginUser,
    registerUser
} from "./authService";

/**
 * Constants for the multi-stage account flow
 * Controls which form is displayed to the user
 */
const STAGES = {
    EMAIL: "EMAIL",
    LOGIN: "LOGIN",
    CREATE: "CREATE"
};

/*
COMPONENT
*/

/**
 * AccountFlow component handles user authentication
 * Implements a multi-stage form flow for account creation and login
 *
 * @param {Object} props - Component props
 * @param {Function} props.setIsLoggedIn - Function to update login state in parent component
 */
function AccountFlow({ setIsLoggedIn }) {
    // Form States
    const [currentStage, setCurrentStage] = useState(
        STAGES.EMAIL
    );
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [isFormValid, setIsFormValid] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [userName, setUserName] = useState("");
    const [showTooltip, setShowTooltip] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] =
        useState(false);

    /**
     * Evaluates password strength on a scale of 0-4
     * Checks for length, case variation, numbers, and special characters
     */
    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/))
            strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;
        return strength;
    };

    // Form Validation
    useEffect(() => {
        switch (currentStage) {
            case STAGES.EMAIL:
                setIsFormValid(email.trim() !== "");
                break;
            case STAGES.LOGIN:
                setIsFormValid(password.trim() !== "");
                break;
            case STAGES.CREATE:
                setIsFormValid(
                    firstName.trim() !== "" &&
                        password.trim() !== "" &&
                        password === confirmPassword &&
                        passwordStrength >= 3
                );
                break;
            default:
                setIsFormValid(false);
                break;
        }
    }, [
        currentStage,
        email,
        password,
        confirmPassword,
        firstName,
        passwordStrength
    ]);

    /**
     * Handles email form submission and determines next flow stage
     * Checks if user exists to route to login or account creation
     */
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        const result = await checkIfUserExists(email);
        if (result.exists) {
            setUserName(result.firstName);
            setCurrentStage(STAGES.LOGIN);
        } else {
            setCurrentStage(STAGES.CREATE);
        }
    };

    /**
     * Handles login form submission and authentication
     * Shows success animation on successful login before redirecting
     */
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const result = await loginUser({ email, password });
        if (result.success) {
            await initDB();
            setShowSuccessAnimation(true);
            // Wait for animation to complete before transitioning
            setTimeout(() => {
                setIsLoggedIn(true);
            }, 800);
        } else {
            setStatusMessage(result.message);
            setTimeout(() => setStatusMessage(""), 3000);
        }
    };

    /**
     * Handles new account registration form submission
     * Creates user account and initializes local database on success
     */
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const result = await registerUser({
            email,
            password,
            first_name: firstName
        });
        if (result.success) {
            await initDB();
            setShowSuccessAnimation(true);
            // Wait for animation to complete before transitioning
            setTimeout(() => {
                setIsLoggedIn(true);
            }, 800);
        } else {
            setStatusMessage(result.message);
            setTimeout(() => setStatusMessage(""), 3000);
        }
    };

    // Handle Password Change
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (currentStage === STAGES.CREATE) {
            setPasswordStrength(
                calculatePasswordStrength(newPassword)
            );
        }
    };

    // Render Form Based on Stage
    const renderForm = () => {
        switch (currentStage) {
            case STAGES.EMAIL:
                return (
                    <Form onSubmit={handleEmailSubmit}>
                        <InputGroup>
                            <Label htmlFor="email">
                                Enter your email:
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />
                        </InputGroup>
                        <Button
                            type="submit"
                            disabled={!isFormValid}
                        >
                            Continue
                        </Button>
                    </Form>
                );

            case STAGES.LOGIN:
                return (
                    <Form onSubmit={handleLoginSubmit}>
                        <InputGroup>
                            <Label htmlFor="password">
                                Password
                            </Label>
                            <Input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </InputGroup>
                        <Button
                            type="submit"
                            disabled={!isFormValid}
                        >
                            Sign In
                        </Button>
                    </Form>
                );

            case STAGES.CREATE:
                return (
                    <Form onSubmit={handleRegisterSubmit}>
                        <InputGroup>
                            <Label htmlFor="firstName">
                                What's your name?
                            </Label>
                            <NameInput
                                type="text"
                                id="firstName"
                                placeholder="Enter your first name"
                                value={firstName}
                                onChange={(e) =>
                                    setFirstName(e.target.value)
                                }
                                required
                            />
                        </InputGroup>
                        <InputGroup>
                            <Label htmlFor="password">
                                Create a secure password
                            </Label>
                            <Input
                                type="password"
                                id="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={handlePasswordChange}
                                required
                            />
                            <PasswordStrengthContainer>
                                <PasswordStrengthBar
                                    style={{
                                        width: `${
                                            passwordStrength *
                                            25
                                        }%`,
                                        backgroundColor:
                                            getPasswordStrengthColor()
                                    }}
                                />
                            </PasswordStrengthContainer>
                            <RequirementsText>
                                {getPasswordRequirements()}
                            </RequirementsText>
                        </InputGroup>
                        <InputGroup>
                            <Label htmlFor="confirmPassword">
                                Confirm your password
                            </Label>
                            <Input
                                type="password"
                                id="confirmPassword"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </InputGroup>
                        <div style={{ position: "relative" }}>
                            <Button
                                type="submit"
                                disabled={!isFormValid}
                                onMouseEnter={() => {
                                    if (!isFormValid) {
                                        setShowTooltip(true);
                                    }
                                }}
                                onMouseLeave={() =>
                                    setShowTooltip(false)
                                }
                            >
                                Create Account
                            </Button>
                            {showTooltip && !isFormValid && (
                                <Tooltip>
                                    {passwordStrength < 4
                                        ? "Create a stronger password"
                                        : password !==
                                            confirmPassword
                                          ? "Passwords don't match"
                                          : "Please fill all fields"}
                                </Tooltip>
                            )}
                        </div>
                    </Form>
                );

            default:
                return (
                    <Form onSubmit={handleEmailSubmit}>
                        <InputGroup>
                            <Label htmlFor="email">
                                Enter your email:
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />
                        </InputGroup>
                        <Button
                            type="submit"
                            disabled={!isFormValid}
                        >
                            Continue
                        </Button>
                    </Form>
                );
        }
    };

    // Get title based on stage
    const getTitle = () => {
        switch (currentStage) {
            case STAGES.EMAIL:
                return "Let's Get Started.";
            case STAGES.LOGIN:
                return (
                    <>
                        Welcome Back{" "}
                        <UserName>{userName}!</UserName>
                    </>
                );
            case STAGES.CREATE:
                return (
                    <>
                        Welcome to RBT
                        <SubTitle>
                            Let's get you set up
                        </SubTitle>
                    </>
                );
            default:
                return "";
        }
    };

    // Password strength color helper
    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 1:
                return "#ff4d4d";
            case 2:
                return "#ffa500";
            case 3:
                return "#2ecc71";
            case 4:
                return "#27ae60";
            default:
                return "#eee";
        }
    };

    // Password requirements helper
    const getPasswordRequirements = () => {
        const missing = [];
        if (password.length < 8) missing.push("8+ chars");
        if (
            !password.match(/[a-z]/) ||
            !password.match(/[A-Z]/)
        )
            missing.push("a-z & A-Z");
        if (!password.match(/\d/)) missing.push("123");
        if (!password.match(/[^a-zA-Z\d]/)) missing.push("#$@");

        return missing.length
            ? `Missing: ${missing.join(" • ")}`
            : "Password strength: Excellent!";
    };

    return (
        <AccountContainer>
            <Helmet>
                <link
                    href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&display=swap"
                    rel="stylesheet"
                />
            </Helmet>
            {showSuccessAnimation && (
                <SuccessOverlay>
                    <SuccessCheckmark />
                </SuccessOverlay>
            )}
            <FormContainer>
                <LogoImage src={RBDLogo} alt="RBD Logo" />
                <Title>{getTitle()}</Title>
                {renderForm()}
                {statusMessage && (
                    <AlertOverlay>
                        <AlertText>{statusMessage}</AlertText>
                    </AlertOverlay>
                )}
            </FormContainer>
        </AccountContainer>
    );
}

export default AccountFlow;
