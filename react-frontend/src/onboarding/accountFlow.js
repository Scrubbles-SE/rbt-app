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
    SuccessCheckmark,
    themeColors,
    ModalContent,
    CloseButton,
    InstallInstructions,
    SecondaryButton,
    InstallButton,
    ThemeOption,
    ThemeGrid,
    ThemeForm
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
    PWA_INSTALL: "PWA_INSTALL",
    EMAIL: "EMAIL",
    LOGIN: "LOGIN",
    CREATE: "CREATE",
    THEME: "THEME",
    GET_STARTED: "GET_STARTED"
};

/*
COMPONENT
*/

/**
 * AccountFlow component handles user authentication and onboarding
 * Implements a multi-stage flow for account creation, login, and onboarding
 */
function AccountFlow({ setIsLoggedIn, setOnboardingComplete }) {
    // Form States
    const [currentStage, setCurrentStage] = useState(
        STAGES.PWA_INSTALL
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
    const [showInstallModal, setShowInstallModal] =
        useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const [theme, setTheme] = useState("light-mode");

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

    // Check if running as PWA on component mount
    useEffect(() => {
        const isPWA =
            window.matchMedia("(display-mode: standalone)")
                .matches ||
            window.navigator.standalone === true;
        if (isPWA) {
            setCurrentStage(STAGES.EMAIL);
        }
    }, []);

    // Listen for beforeinstallprompt event
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    /**
     * Handles email form submission and determines next flow stage
     * Checks if user exists to route to login or PWA install
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
            // For existing users, mark onboarding as complete and redirect
            localStorage.setItem("onboardingComplete", "true");
            setOnboardingComplete(true);
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
     * Creates user account and moves to PWA install phase
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
            setIsLoggedIn(true); // They are logged in but not done with onboarding
            setCurrentStage(STAGES.THEME);
        } else {
            setStatusMessage(result.message);
            setTimeout(() => setStatusMessage(""), 3000);
        }
    };

    /**
     * Completes the onboarding process
     * Called from the final "Get Started" phase
     */
    const completeOnboarding = () => {
        localStorage.setItem("onboardingComplete", "true");
        setShowSuccessAnimation(true);
        setTimeout(() => {
            setOnboardingComplete(true);
        }, 800);
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

    const handleInstallClick = async () => {
        setShowInstallModal(true);
    };

    const handleAndroidInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
                setShowInstallModal(false);
                setCurrentStage(STAGES.EMAIL);
            }
        }
    };

    const handleIOSInstall = () => {
        window.location.href =
            'data:text/html;charset=utf-8,<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; text-align: center; padding: 20px;"><div>Tap the share button below<br>↓<br>Then select "Add to Home Screen"</div></body></html>';
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.body.classList.remove(
            "dark-mode",
            "min-theme",
            "blue-theme",
            "green-theme"
        );
        document.body.classList.add(newTheme);
    };

    // Initialize theme on mount
    useEffect(() => {
        const currentTheme =
            localStorage.getItem("theme") || "light-mode";
        setTheme(currentTheme);
        document.body.classList.remove(
            "dark-mode",
            "min-theme",
            "blue-theme",
            "green-theme"
        );
        document.body.classList.add(currentTheme);
    }, []);

    // Render Form Based on Stage
    const renderForm = () => {
        switch (currentStage) {
            case STAGES.PWA_INSTALL:
                return (
                    <>
                        <Form
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <div
                                style={{
                                    textAlign: "center",
                                    marginBottom: "2rem",
                                    color: themeColors.green
                                        .dark,
                                    fontSize: "1.1rem",
                                    lineHeight: "1.5"
                                }}
                            >
                                Thanks for checking out RBT!
                                <br />
                                It's even better as a PWA...
                            </div>
                            <Button
                                type="button"
                                onClick={handleInstallClick}
                                style={{
                                    marginBottom: "1rem",
                                    background:
                                        themeColors.green
                                            .gradient
                                }}
                            >
                                Install App
                            </Button>
                            <SecondaryButton
                                type="button"
                                onClick={() =>
                                    setCurrentStage(
                                        STAGES.EMAIL
                                    )
                                }
                            >
                                Maybe Later
                            </SecondaryButton>
                        </Form>

                        {showInstallModal && (
                            <ModalContent
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
                            >
                                <CloseButton
                                    onClick={() =>
                                        setShowInstallModal(
                                            false
                                        )
                                    }
                                >
                                    ×
                                </CloseButton>
                                <InstallInstructions>
                                    {isIOS ? (
                                        <>
                                            <p>
                                                Quick Install
                                                Guide
                                            </p>
                                            <p className="subtitle">
                                                1. Tap the share
                                                button below
                                                <br />
                                                2. Click "Add to
                                                Home Screen"
                                                <br />
                                                3. Tap "Add" to
                                                finish
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p>Install RBT</p>
                                            <p className="subtitle">
                                                Add to your home
                                                screen for quick
                                                access and a
                                                better
                                                experience
                                            </p>
                                        </>
                                    )}
                                </InstallInstructions>
                                <InstallButton
                                    onClick={
                                        isIOS
                                            ? handleIOSInstall
                                            : handleAndroidInstall
                                    }
                                >
                                    {isIOS
                                        ? "Share to Start"
                                        : "Install App"}
                                </InstallButton>
                            </ModalContent>
                        )}
                    </>
                );

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
                                        width: `${passwordStrength * 25}%`,
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

            case STAGES.THEME:
                return (
                    <ThemeForm
                        onSubmit={(e) => {
                            e.preventDefault();
                            setCurrentStage(STAGES.GET_STARTED);
                        }}
                    >
                        <ThemeGrid>
                            <ThemeOption
                                onClick={() =>
                                    handleThemeChange(
                                        "light-mode"
                                    )
                                }
                                color="#f2c4bb"
                                name="Classic"
                                selected={
                                    theme === "light-mode"
                                }
                            />
                            <ThemeOption
                                onClick={() =>
                                    handleThemeChange(
                                        "dark-mode"
                                    )
                                }
                                color="#000000"
                                name="Dark"
                                selected={theme === "dark-mode"}
                            />
                            <ThemeOption
                                onClick={() =>
                                    handleThemeChange(
                                        "blue-theme"
                                    )
                                }
                                color="#9bc4e2"
                                name="Sky"
                                selected={
                                    theme === "blue-theme"
                                }
                            />
                            <ThemeOption
                                onClick={() =>
                                    handleThemeChange(
                                        "min-theme"
                                    )
                                }
                                color="#d3d3d3"
                                name="Minimalist"
                                selected={theme === "min-theme"}
                            />
                            <ThemeOption
                                onClick={() =>
                                    handleThemeChange(
                                        "green-theme"
                                    )
                                }
                                color="#afbf9f"
                                name="Sage"
                                selected={
                                    theme === "green-theme"
                                }
                            />
                        </ThemeGrid>
                        <Button type="submit">Continue</Button>
                    </ThemeForm>
                );

            case STAGES.GET_STARTED:
                return (
                    <ThemeForm
                        onSubmit={(e) => {
                            e.preventDefault();
                            completeOnboarding();
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "2rem",
                                flex: 1,
                                marginBottom: "2rem"
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "1.2rem",
                                    color: "var(--text-primary)",
                                    textAlign: "center",
                                    lineHeight: 1.6
                                }}
                            >
                                <p
                                    style={{
                                        marginBottom: "1rem"
                                    }}
                                >
                                    Your journal is ready for
                                    your daily reflections
                                </p>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(3, 1fr)",
                                        gap: "1rem",
                                        margin: "2rem 0"
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "center",
                                            gap: "0.5rem"
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius:
                                                    "50%",
                                                background:
                                                    "#f2c4bb",
                                                display: "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                fontSize:
                                                    "1.5rem"
                                            }}
                                        >
                                            🌹
                                        </div>
                                        <span
                                            style={{
                                                color: "var(--text-primary)",
                                                fontWeight: 500
                                            }}
                                        >
                                            Rose
                                        </span>
                                        <span
                                            style={{
                                                fontSize:
                                                    "0.9rem",
                                                color: "var(--text-secondary)"
                                            }}
                                        >
                                            Highlights
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "center",
                                            gap: "0.5rem"
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius:
                                                    "50%",
                                                background:
                                                    "#afbf9f",
                                                display: "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                fontSize:
                                                    "1.5rem"
                                            }}
                                        >
                                            🌱
                                        </div>
                                        <span
                                            style={{
                                                color: "var(--text-primary)",
                                                fontWeight: 500
                                            }}
                                        >
                                            Bud
                                        </span>
                                        <span
                                            style={{
                                                fontSize:
                                                    "0.9rem",
                                                color: "var(--text-secondary)"
                                            }}
                                        >
                                            Potential
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "center",
                                            gap: "0.5rem"
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius:
                                                    "50%",
                                                background:
                                                    "#9bc4e2",
                                                display: "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                fontSize:
                                                    "1.5rem"
                                            }}
                                        >
                                            🌿
                                        </div>
                                        <span
                                            style={{
                                                color: "var(--text-primary)",
                                                fontWeight: 500
                                            }}
                                        >
                                            Thorn
                                        </span>
                                        <span
                                            style={{
                                                fontSize:
                                                    "0.9rem",
                                                color: "var(--text-secondary)"
                                            }}
                                        >
                                            Challenges
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            style={{
                                background: "var(--fill-color)",
                                fontSize: "1.1rem",
                                padding: "1.2rem"
                            }}
                        >
                            Begin Your Journey
                        </Button>
                    </ThemeForm>
                );

            default:
                return null;
        }
    };

    // Get title based on stage
    const getTitle = () => {
        switch (currentStage) {
            case STAGES.PWA_INSTALL:
                return "Welcome to RBT";
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
            case STAGES.THEME:
                return "Choose Your Theme";
            case STAGES.GET_STARTED:
                return "Ready to Begin";
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
        <>
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
            <AccountContainer>
                <FormContainer>
                    {currentStage !== STAGES.THEME && (
                        <LogoImage
                            src={RBDLogo}
                            alt="RBD Logo"
                        />
                    )}
                    <Title
                        style={{
                            color:
                                theme === "dark-mode"
                                    ? "#fff"
                                    : themeColors.green.dark,
                            marginTop:
                                currentStage === STAGES.THEME
                                    ? "1rem"
                                    : "0"
                        }}
                    >
                        {getTitle()}
                    </Title>
                    {renderForm()}
                    {statusMessage && (
                        <AlertOverlay>
                            <AlertText>
                                {statusMessage}
                            </AlertText>
                        </AlertOverlay>
                    )}
                </FormContainer>
            </AccountContainer>
        </>
    );
}

export default AccountFlow;
