// Libraries
import styled from "styled-components";

/**
 * Theme and animation definitions for the account flow
 * Contains styled components for login/registration forms
 */

/*
STYLES 
*/

// Modern full-screen container replacing AccountContainer and FormContainer
export const OnboardingContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: var(--background-color);
    transition: background-color 0.3s ease;
    overflow: hidden;
    position: relative;
`;

// Main layout divider for proper content positioning
export const OnboardingLayout = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    min-height: 100%;
    padding-bottom: 0;
    overflow: hidden;
    position: relative;
`;

// Combined header and content section for upper portion of screen
export const OnboardingMain = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0px 24px;
    flex: 1;
    padding-bottom: 20px;
`;

// Footer section for action buttons
export const OnboardingFooter = styled.div`
    padding: 16px 24px;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 30px;
`;

// Content area inside main section
export const OnboardingContent = styled.div`
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
`;

// Logo and title section, grouped
export const HeaderGroup = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 42px;
`;

// Improved logo display
export const IconDisplay = styled.div`
    width: 110px;
    height: 110px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
`;

export const LogoImage = styled.img`
    border-radius: 18px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h2`
    color: var(--text-primary);
    font-size: 32px;
    margin-bottom: 16px;
    text-align: center;
    font-weight: 700;
    line-height: 1.2;
`;

export const SubTitle = styled.div`
    font-size: 18px;
    color: var(--text-secondary);
    font-weight: 500;
    text-align: center;
    margin-bottom: 32px;
    line-height: 1.4;
    max-width: 300px;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 16px;
`;

export const InputGroup = styled.div`
    margin-bottom: 16px;
    position: relative;
    width: 100%;
`;

export const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    color: var(--text-primary);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.5px;
    width: 100%;
`;

export const Input = styled.input`
    width: 100%;
    padding: 14px 16px;
    background-color: var(--card-background);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
    box-sizing: border-box;
    color: var(--text-primary);

    &:focus {
        border-color: var(--fill-color);
        box-shadow: 0 0 0 3px var(--hover-color);
        outline: none;
    }

    &:hover {
        border-color: var(--fill-color);
    }

    &::placeholder {
        color: var(--text-secondary);
        opacity: 0.7;
    }
`;

export const PasswordStrengthContainer = styled.div`
    margin-top: 10px;
    height: 6px;
    background-color: var(--border-color);
    border-radius: 3px;
    overflow: hidden;
`;

export const PasswordStrengthBar = styled.div`
    height: 100%;
    transition:
        width 0.3s,
        background-color 0.3s;
    border-radius: 3px;
`;

export const Button = styled.button`
    background: var(--fill-color);
    color: var(--text-primary);
    border: none;
    padding: 16px;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    letter-spacing: 0.5px;
    width: 100%;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px var(--hover-color);

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px var(--hover-color);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

export const SecondaryButton = styled(Button)`
    background: transparent;
    color: var(--text-primary);
    border: 2px solid var(--fill-color);
    box-shadow: none;
    margin-top: 12px;

    &:hover:not(:disabled) {
        background: var(--hover-color);
        box-shadow: none;
    }
`;

export const LinkText = styled.p`
    text-align: center;
    margin-top: 16px;
    font-size: 14px;
    color: var(--text-secondary);

    a {
        color: var(--fill-color);
        text-decoration: none;
        font-weight: 600;

        &:hover {
            text-decoration: underline;
        }
    }
`;

export const AlertOverlay = styled.div`
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    padding: 16px 24px;
    border-radius: 12px;
    background: var(--fill-color);
    color: var(--text-primary);
    box-shadow: 0 4px 20px var(--hover-color);
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideDown 0.3s ease-out;
    max-width: 90%;

    @keyframes slideDown {
        from {
            transform: translate(-50%, -100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
`;

export const AlertText = styled.span`
    font-size: 14px;
    font-weight: 500;
`;

export const UserName = styled.span`
    font-family: var(--font-header);
    font-size: 44px;
    font-weight: 800;
    font-style: italic;
    display: block;
    color: #ed7095;
    position: relative;
    margin-top: 4px;
    margin-bottom: 8px;
    padding: 0 4px;
    transform-origin: center;
    animation: floatIn 1s ease-out;

    @keyframes floatIn {
        0% {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -4px;
        height: 2px;
        background: var(--fill-color);
        transform: scaleX(0);
        animation: underlineExpand 0.8s ease-out forwards 0.3s;
    }

    @keyframes underlineExpand {
        0% {
            transform: scaleX(0);
        }
        100% {
            transform: scaleX(1);
        }
    }
`;

export const NameInput = styled(Input)`
    background: var(--card-background);
`;

export const RequirementsText = styled.div`
    color: var(--text-secondary);
    font-size: 13px;
    margin-top: 6px;
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
`;

export const Tooltip = styled.div`
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 8px;
    white-space: nowrap;
    pointer-events: none;
    animation: fadeIn 0.2s ease-out;

    &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.8);
    }
`;

export const SuccessOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--background-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.5s ease-out;
    backdrop-filter: blur(10px);
    width: 100%;
    height: 100%;
    gap: 24px;

    @keyframes fadeIn {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
`;

export const SuccessCheckmark = styled.div`
    width: 90px;
    height: 90px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--fill-color);
    animation:
        scaleIn 0.5s ease-out,
        pulse 2s ease-in-out infinite 0.5s;
    box-shadow: 0 8px 24px var(--hover-color);
    position: relative;

    &::after {
        content: "✓";
        color: var(--background-color);
        font-size: 46px;
        font-weight: bold;
        animation: fadeInSlide 0.4s ease-out 0.2s both;
    }

    @keyframes scaleIn {
        0% {
            transform: scale(0);
        }
        70% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }

    @keyframes fadeInSlide {
        0% {
            opacity: 0;
            transform: translateY(10px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0
                rgba(var(--fill-color-rgb, 242, 196, 187), 0.7);
        }
        70% {
            box-shadow: 0 0 0 15px
                rgba(var(--fill-color-rgb, 242, 196, 187), 0);
        }
        100% {
            box-shadow: 0 0 0 0
                rgba(var(--fill-color-rgb, 242, 196, 187), 0);
        }
    }
`;

export const SuccessMessage = styled.div`
    color: var(--text-primary);
    font-size: 20px;
    font-weight: 600;
    opacity: 0;
    animation: fadeIn 0.5s ease-out 0.6s forwards;
`;

export const ModalOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
    animation: fadeIn 0.3s ease-out;
    padding: 0;
    margin: 0;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

export const ModalContent = styled.div`
    background: var(--card-background);
    padding: 2.5rem 2rem;
    border-radius: 24px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.25);
    animation: slideUp 0.3s ease-out;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    z-index: 1000;

    @keyframes slideUp {
        from {
            transform: translate(-50%, -40%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%);
            opacity: 1;
        }
    }
`;

export const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.75rem;
    line-height: 1;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border-radius: 50%;

    &:hover {
        background: var(--hover-color);
        color: var(--text-primary);
    }
`;

export const InstallInstructions = styled.div`
    text-align: center;
    color: var(--text-primary);
    font-size: 1.5rem;
    line-height: 1.4;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    padding: 0 1rem;

    p {
        margin: 0;
        &.subtitle {
            font-size: 1.1rem;
            font-weight: 400;
            color: var(--text-secondary);
            max-width: 280px;
        }
    }
`;

export const InstallButton = styled(Button)`
    font-size: 1.1rem;
    padding: 1rem 2rem;
    width: auto;
    min-width: 200px;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;
    border-radius: 16px;
    text-transform: none;
    background: ${(props) =>
        props.isIOS
            ? "linear-gradient(135deg, #5ac8fa, #007aff)"
            : "linear-gradient(135deg, #8bc34a, #4CAF50)"};
    box-shadow: ${(props) =>
        props.isIOS
            ? "0 4px 12px rgba(0, 122, 255, 0.3)"
            : "0 4px 12px rgba(76, 175, 80, 0.3)"};
    color: white;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: ${(props) =>
            props.isIOS
                ? "0 8px 20px rgba(0, 122, 255, 0.4)"
                : "0 8px 20px rgba(76, 175, 80, 0.4)"};
    }
`;

// Modern theme selection components
export const ThemeGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
`;

export const ThemeOption = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    padding: 14px 16px;
    border-radius: 14px;
    background: var(--card-background);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid
        ${(props) =>
            props.selected
                ? "var(--fill-color)"
                : "transparent"};
    box-shadow: ${(props) =>
        props.selected
            ? "0 4px 12px var(--hover-color)"
            : "0 2px 6px var(--hover-color)"};
    position: relative;

    &:hover {
        background: var(--hover-color);
        transform: translateY(-2px);
    }

    &::before {
        content: "";
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${(props) => props.color};
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &::after {
        content: "${(props) => props.name}";
        color: var(--text-primary);
        font-weight: 600;
        font-size: 16px;
    }
`;

// Feature components
export const FeatureGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 500px;
    margin: 0 auto 32px;
    padding: 0 16px;
`;

export const FeatureItem = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    background: var(--card-background);
    border-radius: 16px;
    padding: 18px 20px;
    box-shadow: 0 4px 12px var(--hover-color);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px var(--hover-color);
    }

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 6px;
        height: 100%;
        background: ${(props) =>
            props.accentColor || "var(--fill-color)"};
    }

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            to right,
            ${(props) =>
                    `${props.accentColor || "var(--fill-color)"}10`}
                0%,
            transparent 30%
        );
        z-index: 0;
        pointer-events: none;
    }
`;

export const FeatureContent = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
`;

export const FeatureIcon = styled.div`
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: ${(props) =>
        props.background || "var(--fill-color)"};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-right: 20px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px var(--hover-color);
    position: relative;
    z-index: 1;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 50%;
        background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.4),
            transparent 70%
        );
        z-index: 1;
    }
`;

export const FeatureTitle = styled.div`
    font-weight: 700;
    font-size: 18px;
    color: var(--text-primary);
    margin-bottom: 6px;
    font-family: var(--font-header);
`;

export const FeatureDesc = styled.div`
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.4;
`;
