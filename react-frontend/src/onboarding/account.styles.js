// Libraries
import styled from "styled-components";

/**
 * Theme and animation definitions for the account flow
 * Contains styled components for login/registration forms
 */

// Color palette used throughout account components
export const themeColors = {
    pink: {
        light: "#f5d8da",
        medium: "#de7792",
        gradient:
            "linear-gradient(135deg, #D66C84 0%, #F0C5BC 100%)"
    },
    green: {
        light: "#879e84",
        dark: "#2d5441",
        gradient:
            "linear-gradient(135deg, #859880 0%, #2E5141 100%)"
    }
};

/*
STYLES 
*/

export const AccountContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    max-width: 480px;
    padding: 0;
    background: var(--background-color);
    transition: background-color 0.3s ease;
`;

export const FormContainer = styled.div`
    background: var(--card-background);
    padding: 95px 30px 20px;
    border-radius: 20px;
    box-shadow: 0 10px 30px var(--hover-color);
    width: 100%;
    box-sizing: border-box;
    margin: 10px 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    border: 1px solid var(--border-color);
    backdrop-filter: blur(10px);
    color: var(--text-primary);

    @media (max-width: 480px) {
        margin: 10px 15px;
        padding: 85px 20px 20px;
    }
`;

export const LogoImage = styled.img`
    width: 150px;
    height: 150px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    object-fit: cover;
    border-radius: 50%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    background-color: white;
    padding: 10px;
    z-index: 1;

    @media (max-width: 480px) {
        width: 120px;
        height: 120px;
        padding: 8px;
    }
`;

export const Title = styled.h2`
    color: ${themeColors.green.dark};
    font-size: 32px;
    margin-bottom: 30px;
    text-align: center;
    font-weight: 800;
    margin-top: 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.1;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

export const InputGroup = styled.div`
    margin-bottom: 5px;
    position: relative;
    width: 100%;
`;

export const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    color: ${themeColors.green.dark};
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: 100%;

    @media (max-width: 480px) {
        font-size: 12px;
        margin-bottom: 6px;
    }
`;

export const Input = styled.input`
    width: 100%;
    padding: 12px 15px;
    background-color: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
    box-sizing: border-box;

    &:focus {
        border-color: ${themeColors.pink.medium};
        box-shadow: 0 0 0 3px rgba(222, 119, 146, 0.1);
        outline: none;
        background-color: white;
    }

    &:hover {
        border-color: ${themeColors.pink.medium}90;
    }

    @media (max-width: 480px) {
        padding: 10px 12px;
        font-size: 14px;
        border-radius: 8px;
    }
`;

export const PasswordStrengthContainer = styled.div`
    margin-top: 10px;
    height: 6px;
    background-color: #eee;
    border-radius: 3px;
    overflow: hidden;
`;

export const PasswordStrengthBar = styled.div`
    height: 100%;
    transition:
        width 0.3s,
        background-color 0.3s;
    border-radius: 3px;
    background: ${(props) => {
        switch (props.strength) {
            case 1:
                return themeColors.pink.gradient;
            case 2:
                return themeColors.pink.gradient;
            case 3:
                return themeColors.green.gradient;
            case 4:
                return themeColors.green.gradient;
            default:
                return "#eee";
        }
    }};
`;

export const Button = styled.button`
    background: ${themeColors.pink.gradient};
    color: white;
    border: none;
    padding: 14px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    width: 100%;
    position: relative;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0)
        );
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(214, 108, 132, 0.2);

        &::before {
            opacity: 1;
        }
    }

    &:disabled {
        background: #e9ecef;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    @media (max-width: 480px) {
        padding: 12px;
        font-size: 14px;
        border-radius: 8px;
    }
`;

export const LinkText = styled.p`
    text-align: center;
    margin-top: 0px;
    font-size: 14px;
    color: #555;

    a {
        color: #23a6d5;
        text-decoration: none;
        font-weight: 600;

        &:hover {
            text-decoration: underline;
        }
    }

    @media (max-width: 480px) {
        font-size: 13px;
        margin-top: 0px;
    }
`;

export const AlertOverlay = styled.div`
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    padding: 16px 24px;
    border-radius: 12px;
    background: ${themeColors.pink.gradient};
    color: white;
    box-shadow: 0 4px 20px rgba(214, 108, 132, 0.2);
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideDown 0.3s ease-out;

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
    color: #333;
    font-size: 14px;
    font-weight: 500;
`;

export const UserName = styled.span`
    font-family:
        "Playfair Display", serif; // Elegant serif font
    font-size: 48px;
    font-weight: 700;
    font-style: italic;
    display: block;
    color: ${themeColors.pink.medium};
    position: relative;
    margin-top: 8px;
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
        background: ${themeColors.pink.gradient};
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
    background: white !important;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s ease;
    color: black !important;

    &::placeholder {
        color: #6c6565 !important;
    }
    &:focus {
        border-color: #23a6d5;
        box-shadow: 0 0 0 3px rgba(35, 166, 213, 0.1);
    }

    @media (max-width: 480px) {
        padding: 10px 12px;
        font-size: 14px;
        border-radius: 6px;
    }
`;

export const SubTitle = styled.div`
    font-size: 0.45em;
    color: ${themeColors.green.dark};
    font-weight: 500;
    display: block;
    text-align: center;
    margin-top: 4px;
`;

export const RequirementsText = styled.div`
    color: #666;
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
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.95);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.5s ease-out;
    backdrop-filter: blur(10px);

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
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${themeColors.green.gradient};
    animation: scaleIn 0.3s ease-out;
    box-shadow: 0 8px 20px rgba(45, 84, 65, 0.2);

    &::after {
        content: "✓";
        color: white;
        font-size: 40px;
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
`;

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
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
    background: white;
    padding: 2.5rem 2rem;
    border-radius: 24px;
    position: fixed;
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
    color: #666;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border-radius: 50%;

    &:hover {
        background: #f5f5f5;
        color: #333;
    }
`;

export const InstallInstructions = styled.div`
    text-align: center;
    color: ${themeColors.green.dark};
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
            color: #666;
            max-width: 280px;
        }
    }

    @media (max-width: 480px) {
        font-size: 1.35rem;

        p.subtitle {
            font-size: 1rem;
        }
    }
`;

export const InstallButton = styled(Button)`
    background: ${themeColors.green.gradient};
    font-size: 1.1rem;
    padding: 1rem 2rem;
    width: auto;
    min-width: 200px;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;
    border-radius: 16px;
    text-transform: none;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(45, 84, 65, 0.2);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

export const SecondaryButton = styled(Button)`
    width: auto;
    min-width: 150px;
    margin: 0 auto;
    background: transparent;
    color: ${themeColors.green.dark};
    border: 2px solid ${themeColors.green.dark};
    box-shadow: none;

    &:hover:not(:disabled) {
        background: rgba(45, 84, 65, 0.1);
    }
`;

export const ThemeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1.5rem;
    margin: 1rem 0 auto;
    width: 100%;
`;

export const ThemeOption = styled.div`
    aspect-ratio: 1;
    background: var(--card-background);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    border: none;

    &::before {
        content: "";
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: ${(props) => props.color};
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;
    }

    &::after {
        content: "${(props) => props.name}";
        color: var(--text-primary);
        font-weight: 600;
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }

    ${(props) =>
        props.selected &&
        `
        &::before {
            transform: scale(1.2);
        }
        background: var(--hover-color);
    `}

    &:hover {
        background: var(--hover-color);
        &::before {
            transform: scale(1.1);
        }
    }
`;

export const ThemeForm = styled(Form)`
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 2rem;

    > button {
        margin-top: auto;
        background: var(--fill-color);

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px var(--hover-color);
        }
    }
`;
