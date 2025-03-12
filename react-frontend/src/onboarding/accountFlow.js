/*
IMPORTS
*/
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import RBDLogo from "./RBDLogo.png";
import { initDB } from "../utils/db";

// Styles
import {
    OnboardingContainer,
    OnboardingLayout,
    OnboardingMain,
    OnboardingContent,
    OnboardingFooter,
    HeaderGroup,
    IconDisplay,
    LogoImage,
    Title,
    Form,
    InputGroup,
    Label,
    Input,
    Button,
    SecondaryButton,
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
    SuccessMessage,
    ModalContent,
    CloseButton,
    InstallInstructions,
    InstallButton,
    ThemeOption,
    ThemeGrid,
    FeatureItem,
    FeatureIcon,
    FeatureTitle,
    FeatureDesc,
    FeatureGrid,
    FeatureContent
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
        if (e) e.preventDefault();
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
        if (e) e.preventDefault();
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
        if (e) e.preventDefault();
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
            try {
                // Prompt user to install
                await deferredPrompt.prompt();
                const { outcome } =
                    await deferredPrompt.userChoice;

                if (outcome === "accepted") {
                    console.log(
                        "User accepted the install prompt"
                    );
                    setDeferredPrompt(null);
                    setShowInstallModal(false);
                    setCurrentStage(STAGES.EMAIL);
                } else {
                    console.log(
                        "User dismissed the install prompt"
                    );
                    setShowInstallModal(false);
                }
            } catch (error) {
                console.error("Install prompt error:", error);
                setStatusMessage(
                    "Installation failed. Please try again."
                );
                setTimeout(() => setStatusMessage(""), 3000);
            }
        } else {
            // Fallback for when the deferredPrompt is not available
            setStatusMessage(
                "Please use your browser's install function or add to home screen option."
            );
            setTimeout(() => setStatusMessage(""), 5000);
            setShowInstallModal(false);
        }
    };

    const handleIOSInstall = () => {
        try {
            // Modern approach - Use the Web Share API if available
            if (navigator.share) {
                navigator
                    .share({
                        title: "Install RBT App",
                        url: window.location.href
                    })
                    .then(() => {
                        setStatusMessage(
                            "Look for 'Add to Home Screen' in the share menu"
                        );
                        setTimeout(
                            () => setStatusMessage(""),
                            5000
                        );
                    })
                    .catch((error) => {
                        console.error("Error sharing:", error);
                    });
            } else {
                // Fallback to showing instructions
                setStatusMessage(
                    "Tap the share icon in your browser and select 'Add to Home Screen'"
                );
                setTimeout(() => setStatusMessage(""), 5000);
            }
        } catch (error) {
            console.error("Share error:", error);
            // Final fallback
            alert(
                "To install: tap the share icon in your browser and select 'Add to Home Screen'"
            );
        }

        setShowInstallModal(false);
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        // Theme is applied through the useEffect hook
    };

    // Apply theme to the entire app, not just this component
    useEffect(() => {
        // Remove any other themes
        document.body.classList.remove(
            "dark-mode",
            "min-theme",
            "blue-theme",
            "green-theme"
        );

        // Apply current theme
        document.body.classList.add(theme);

        // Save theme preference
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Render Form Based on Stage
    const renderContent = () => {
        switch (currentStage) {
            case STAGES.PWA_INSTALL:
                return (
                    <OnboardingContent>
                        <SubTitle>
                            Thanks for checking out RBT! It's
                            even better as a PWA.
                        </SubTitle>
                    </OnboardingContent>
                );

            case STAGES.EMAIL:
                return (
                    <OnboardingContent>
                        <Form
                            id="emailForm"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleEmailSubmit(e);
                            }}
                        >
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
                        </Form>
                    </OnboardingContent>
                );

            case STAGES.LOGIN:
                return (
                    <OnboardingContent>
                        <Form
                            id="loginForm"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleLoginSubmit(e);
                            }}
                        >
                            <InputGroup>
                                <Label htmlFor="password">
                                    Password
                                </Label>
                                <Input
                                    type="password"
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={
                                        handlePasswordChange
                                    }
                                    required
                                />
                            </InputGroup>
                        </Form>
                    </OnboardingContent>
                );

            case STAGES.CREATE:
                return (
                    <OnboardingContent>
                        <Form
                            id="registerForm"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleRegisterSubmit(e);
                            }}
                        >
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
                                        setFirstName(
                                            e.target.value
                                        )
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
                                    onChange={
                                        handlePasswordChange
                                    }
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
                        </Form>
                    </OnboardingContent>
                );

            case STAGES.THEME:
                return (
                    <OnboardingContent>
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
                                color="#2a2a2a"
                                name="Dark"
                                selected={theme === "dark-mode"}
                            />
                            <ThemeOption
                                onClick={() =>
                                    handleThemeChange(
                                        "blue-theme"
                                    )
                                }
                                color="#b8d3eb"
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
                                color="#ccd7c2"
                                name="Sage"
                                selected={
                                    theme === "green-theme"
                                }
                            />
                        </ThemeGrid>
                    </OnboardingContent>
                );

            case STAGES.GET_STARTED:
                return (
                    <OnboardingContent>
                        <SubTitle>
                            Now you can reflect on your day, in
                            a whole new way.
                        </SubTitle>
                        <FeatureGrid>
                            <FeatureItem accentColor="var(--fill-color)">
                                <FeatureIcon background="var(--fill-color)">
                                    🌹
                                </FeatureIcon>
                                <FeatureContent>
                                    <FeatureTitle>
                                        Rose
                                    </FeatureTitle>
                                    <FeatureDesc>
                                        Celebrate your daily
                                        victories and positive
                                        moments
                                    </FeatureDesc>
                                </FeatureContent>
                            </FeatureItem>
                            <FeatureItem accentColor="var(--button-color)">
                                <FeatureIcon background="var(--button-color)">
                                    🌱
                                </FeatureIcon>
                                <FeatureContent>
                                    <FeatureTitle>
                                        Bud
                                    </FeatureTitle>
                                    <FeatureDesc>
                                        Identify areas for
                                        personal growth and
                                        development
                                    </FeatureDesc>
                                </FeatureContent>
                            </FeatureItem>
                            <FeatureItem accentColor="var(--journal-background)">
                                <FeatureIcon background="var(--journal-background)">
                                    🌿
                                </FeatureIcon>
                                <FeatureContent>
                                    <FeatureTitle>
                                        Thorn
                                    </FeatureTitle>
                                    <FeatureDesc>
                                        Acknowledge difficulties
                                        and learn from them
                                    </FeatureDesc>
                                </FeatureContent>
                            </FeatureItem>
                        </FeatureGrid>
                    </OnboardingContent>
                );

            default:
                return null;
        }
    };

    // Render buttons based on stage
    const renderButtons = () => {
        switch (currentStage) {
            case STAGES.PWA_INSTALL:
                return (
                    <>
                        <Button
                            type="button"
                            onClick={handleInstallClick}
                        >
                            Install App
                        </Button>
                        <SecondaryButton
                            type="button"
                            onClick={() =>
                                setCurrentStage(STAGES.EMAIL)
                            }
                        >
                            Maybe Later
                        </SecondaryButton>
                    </>
                );

            case STAGES.EMAIL:
                return (
                    <Button
                        type="button"
                        disabled={!isFormValid}
                        onClick={handleEmailSubmit}
                    >
                        Continue
                    </Button>
                );

            case STAGES.LOGIN:
                return (
                    <Button
                        type="button"
                        disabled={!isFormValid}
                        onClick={handleLoginSubmit}
                    >
                        Sign In
                    </Button>
                );

            case STAGES.CREATE:
                return (
                    <div
                        style={{
                            position: "relative",
                            width: "100%"
                        }}
                    >
                        <Button
                            type="button"
                            disabled={!isFormValid}
                            onClick={handleRegisterSubmit}
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
                );

            case STAGES.THEME:
                return (
                    <Button
                        onClick={() =>
                            setCurrentStage(STAGES.GET_STARTED)
                        }
                    >
                        Continue
                    </Button>
                );

            case STAGES.GET_STARTED:
                return (
                    <Button
                        onClick={completeOnboarding}
                        style={{
                            background: "var(--fill-color)",
                            fontSize: "18px",
                            padding: "18px",
                            color: "var(--text-primary)",
                            fontWeight: "700",
                            boxShadow:
                                "0 6px 16px var(--hover-color)"
                        }}
                    >
                        Begin Your Journey
                    </Button>
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
                return "Let's Get Started";
            case STAGES.LOGIN:
                return (
                    <>
                        Welcome Back{" "}
                        <UserName>{userName}!</UserName>
                    </>
                );
            case STAGES.CREATE:
                return "Create Your Account";
            case STAGES.THEME:
                return "Choose Your Theme";
            case STAGES.GET_STARTED:
                return "Ready to Grow?";
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
                    <SuccessMessage>
                        Welcome to RBT
                    </SuccessMessage>
                </SuccessOverlay>
            )}
            <OnboardingContainer className="onboarding-content">
                <OnboardingLayout>
                    <OnboardingMain>
                        <HeaderGroup>
                            {currentStage !==
                                STAGES.GET_STARTED && (
                                <IconDisplay>
                                    <LogoImage
                                        src={RBDLogo}
                                        alt="RBD Logo"
                                    />
                                </IconDisplay>
                            )}
                            <Title>{getTitle()}</Title>
                        </HeaderGroup>

                        {renderContent()}
                    </OnboardingMain>

                    <OnboardingFooter>
                        {renderButtons()}
                    </OnboardingFooter>
                </OnboardingLayout>

                {statusMessage && (
                    <AlertOverlay>
                        <AlertText>{statusMessage}</AlertText>
                    </AlertOverlay>
                )}

                {showInstallModal && (
                    <ModalContent
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CloseButton
                            onClick={() =>
                                setShowInstallModal(false)
                            }
                        >
                            ×
                        </CloseButton>
                        <InstallInstructions>
                            {isIOS ? (
                                <>
                                    <p>Install RBT on iOS</p>
                                    <p className="subtitle">
                                        When the share sheet
                                        opens:
                                        <br />
                                        1. Tap the Share icon
                                        <br />
                                        2. Scroll to find "Add
                                        to Home Screen"
                                        <br />
                                        3. Tap "Add" to complete
                                        installation
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p>
                                        Install RBT on Android
                                    </p>
                                    <p className="subtitle">
                                        Add to your home screen
                                        for the best experience
                                        with offline access and
                                        faster loading.
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
                            isIOS={isIOS}
                        >
                            {isIOS
                                ? "Open Share Menu"
                                : "Install App"}
                        </InstallButton>
                    </ModalContent>
                )}
            </OnboardingContainer>
        </>
    );
}

export default AccountFlow;
