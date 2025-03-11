/**
 * Group Components Styled Components
 */
import styled from "styled-components";

// Define theme-based gradients that will adapt to the current theme
export const getGradient = (groupId) => {
    // Simple hash function to get a consistent number from the group ID
    let hashValue = 0;
    for (let i = 0; i < groupId.length; i++) {
        hashValue += groupId.charCodeAt(i);
    }

    // Choose a gradient type based on the hash
    const gradientType = hashValue % 5;

    // These gradients use CSS variables, so they'll automatically update with theme changes
    const themeGradients = [
        // Primary theme gradient
        `linear-gradient(135deg, var(--fill-color) 0%, var(--button-color) 100%)`,
        // Reverse theme gradient
        `linear-gradient(135deg, var(--button-color) 0%, var(--fill-color) 100%)`,
        // Horizontal theme gradient
        `linear-gradient(90deg, var(--fill-color) 0%, var(--button-color) 100%)`,
        // Diagonal with transparency
        `linear-gradient(135deg, var(--fill-color) 0%, var(--button-color) 80%, rgba(255,255,255,0.5) 100%)`,
        // Steeper gradient
        `linear-gradient(160deg, var(--fill-color) 0%, var(--button-color) 100%)`
    ];

    return themeGradients[gradientType];
};

export const Container = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 2000;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
`;

export const ContentContainer = styled.div`
    width: 100%;
    max-width: 480px;
    height: 100%;
    background: var(--container-background);
    padding: 20px;
    position: relative;
    display: flex;
    flex-direction: column;
`;

export const Title = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    text-align: center;
    font-family: var(--font-header);
    letter-spacing: 0.02em;
    position: relative;
    display: block;

    &::after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 120px;
        height: 3px;
        background: var(--fill-color);
        border-radius: 2px;
    }
`;

export const Subtitle = styled.h2`
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 3.5rem 0 1.5rem;
    text-align: center;
    font-family: var(--font-header);
    letter-spacing: 0.02em;
    position: relative;
    display: block;

    &:first-of-type {
        margin-top: 1rem;
    }

    &::after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 3px;
        background: var(--fill-color);
        border-radius: 2px;
    }
`;

export const GroupCard = styled.div`
    padding: 1.8rem;
    margin-bottom: 1.25rem;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: ${(props) =>
        props.gradient || getGradient("default")};
    color: var(--text-primary);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
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

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);

        &::before {
            opacity: 1;
        }
    }

    &:last-of-type {
        margin-bottom: 0;
    }

    h3 {
        font-size: 1.4rem;
        font-weight: 600;
        margin: 0;
        letter-spacing: 0.01em;
    }
`;

export const GroupCardContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const ChevronIcon = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    opacity: 0.9;

    svg {
        transition: transform 0.2s ease;
    }

    ${GroupCard}:hover & svg {
        transform: translateX(3px);
    }
`;

export const CloseButton = styled.button`
    position: absolute;
    top: 24px;
    right: 24px;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    color: var(--text-primary);
    font-size: 20px;
    z-index: 10;

    &:hover {
        color: #38a169;
    }
`;

export const ActionCard = styled.div`
    padding: 1.5rem;
    margin: 1rem 0;
    border-radius: 12px;
    background-color: #f5f5f5;
    display: flex;
    justify-content: space-around;
`;

export const ActionButton = styled.button`
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    border: none;
    background-color: #4b79a1;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #283e51;
    }
`;

export const CreateContainer = styled(GroupCard)`
    background: var(--background-color);
    color: var(--text-primary);
    min-height: ${(props) =>
        props.expanded ? "220px" : "auto"};
    padding: 1.8rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: visible;
    border: 2px dashed #38a169;
    box-shadow: none;
    cursor: ${(props) =>
        props.expanded ? "default" : "pointer"};

    &:hover {
        border-color: #38a169;
        background: var(--background-color);
        box-shadow: 0 4px 12px rgba(56, 161, 105, 0.2);
    }

    ${(props) =>
        props.expanded &&
        `
        border: 2px solid #38a169;
        background: var(--background-color);
        box-shadow: 0 4px 20px rgba(56, 161, 105, 0.2);
    `}
`;

export const InitialView = styled.div`
    display: flex;
    align-items: center;
    gap: 1.6rem;
    cursor: pointer;
    height: 1.4rem;
`;

export const PlusIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        font-size: 2.8rem;
        color: #38a169;
    }
`;

export const CreateText = styled.span`
    font-size: 1.7rem;
    font-weight: 700;
    color: #38a169;
    letter-spacing: 0.01em;
`;

export const NameInput = styled.input`
    width: 100%;
    padding: 1.2rem;
    border: 2px solid rgba(56, 161, 105, 0.4);
    border-radius: 12px;
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 1.2rem;
    background: var(--background-color);
    transition: all 0.2s ease;
    color: var(--text-primary);

    &::placeholder {
        color: var(--text-secondary);
        opacity: 0.7;
    }

    &:focus {
        outline: none;
        border-color: #38a169;
        background: var(--card-background);
        box-shadow: 0 0 0 3px rgba(56, 161, 105, 0.2);
    }
`;

export const CreateButton = styled.button`
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    background: ${(props) =>
        props.disabled
            ? "var(--fill-color-transparent)"
            : "#38a169"};
    color: ${(props) =>
        props.disabled ? "var(--text-secondary)" : "white"};
    font-weight: 700;
    font-size: 1.1rem;
    cursor: ${(props) =>
        props.disabled ? "not-allowed" : "pointer"};
    transition: all 0.2s ease;
    display: block;
    width: auto;
    margin: 0 auto 0px;
    letter-spacing: 0.02em;
    z-index: 10;
    position: relative;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(56, 161, 105, 0.2);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

export const ShareHeader = styled.h3`
    text-align: center;
    font-size: 1.4rem;
    color: #38a169;
    margin-bottom: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    padding: 0 2rem;
`;

export const CodeContainer = styled.div`
    background: var(--card-background);
    border-radius: 12px;
    padding: 1.8rem;
    margin: 1rem auto;
    width: 80%;
    border: 2px solid rgba(56, 161, 105, 0.3);
    text-align: center;
`;

export const CodeDisplay = styled.div`
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 2.4rem;
    font-weight: 800;
    letter-spacing: 0.5rem;
    color: var(--text-primary);
    user-select: all;
`;

export const IconsContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 2rem;
    position: relative;
    z-index: 20;
`;

export const Icon = styled.button`
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--card-background);
    border: 2px solid rgba(56, 161, 105, 0.3);
    transition: all 0.2s ease;
    color: var(--text-primary);
    position: relative;
    z-index: 30;
    pointer-events: all;

    svg {
        font-size: 1.4rem;
        pointer-events: none;
    }

    &:hover {
        background: #38a169;
        border-color: #38a169;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(56, 161, 105, 0.2);
    }

    &:active {
        transform: translateY(0);
    }
`;

export const PageContainer = styled.div`
    max-width: 800px;
    margin: 20px auto 50px;
    padding: 0 20px;
    background-color: var(--background-color);
    color: var(--text-primary);
`;

export const Toast = styled.div`
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
    background: ${(props) =>
        props.variant === "error" ? "#e53e3e" : "#38a169"};
    color: white;
    padding: 1.2rem;
    font-weight: 600;
    font-size: 1.1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    animation: fadeInOut 3s ease;
    text-align: center;
    line-height: 1.4;
    border-radius: 0 0 8px 8px;

    @keyframes fadeInOut {
        0% {
            opacity: 0;
            transform: translate(-50%, -100%);
        }
        15% {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        85% {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -100%);
        }
    }
`;

export const JoinContainer = styled(CreateContainer)`
    border: 2px dashed #4299e1;

    &:hover {
        border-color: #4299e1;
        background: var(--background-color);
        box-shadow: 0 4px 12px rgba(66, 153, 225, 0.2);
    }

    ${(props) =>
        props.expanded &&
        `
        border: 2px solid #4299e1;
        background: var(--background-color);
        box-shadow: 0 4px 20px rgba(66, 153, 225, 0.2);
    `}
`;

export const JoinIcon = styled(PlusIcon)`
    svg {
        color: #4299e1;
    }
`;

export const JoinText = styled(CreateText)`
    color: #4299e1;
`;

export const CodeInput = styled.div`
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin: 1.5rem 0;
    position: relative;
    z-index: 20;
`;

export const Digit = styled.input`
    width: 3rem;
    height: 4rem;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    border: 2px solid rgba(66, 153, 225, 0.4);
    border-radius: 8px;
    background: var(--background-color);
    color: var(--text-primary);
    transition: all 0.2s ease;
    position: relative;
    z-index: 30;
    pointer-events: all;

    &:focus {
        outline: none;
        border-color: #4299e1;
        background: var(--card-background);
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
    }

    &::placeholder {
        color: var(--text-secondary);
        opacity: 0.5;
    }
`;

export const JoinButton = styled(CreateButton)`
    background: ${(props) =>
        props.disabled
            ? "var(--fill-color-transparent)"
            : "#4299e1"};
    position: relative;
    z-index: 30;
    pointer-events: all;

    &:hover:not(:disabled) {
        box-shadow: 0 4px 12px rgba(66, 153, 225, 0.2);
    }
`;

export const JoinHeader = styled(ShareHeader)`
    color: #4299e1;
`;

export const GroupCodeSection = styled.div`
    margin-top: 1rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const GroupCodeHeader = styled.h3`
    font-size: 1.1rem;
    color: #38a169;
    margin: 0 0 1rem 0;
    text-align: center;
    font-weight: 600;
`;

export const CodeAndActions = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
`;

export const GroupCodeDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--card-background);
    padding: 0;
    margin: 0 5px;
    border-radius: 16px;
    border: 2px solid rgba(56, 161, 105, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: ${(props) => (props.isVisible ? "60px" : "0")};
    opacity: ${(props) => (props.isVisible ? 1 : 0)};
    overflow: hidden;
    margin-top: ${(props) => (props.isVisible ? "10px" : "0")};
    border-width: ${(props) => (props.isVisible ? "2px" : "0")};
    box-shadow: ${(props) =>
        props.isVisible
            ? "0 2px 8px rgba(0, 0, 0, 0.1)"
            : "none"};

    ${(props) =>
        props.isVisible &&
        `
        padding: 1rem 1.2rem;
    `}

    .code {
        font-family: "SF Mono", "Fira Code", monospace;
        font-size: 1.4rem;
        font-weight: 600;
        letter-spacing: 0.3rem;
        color: var(--text-primary);
        margin-right: auto;
    }
`;

export const AdminDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--card-background);
    padding: 0;
    margin: 0 5px;
    border-radius: 16px;
    border: 2px solid rgba(56, 161, 105, 0.3);
    transition: all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
    max-height: ${(props) => (props.isVisible ? "" : "0")};
    opacity: ${(props) => (props.isVisible ? 1 : 0)};
    overflow: hidden;
    margin-top: ${(props) => (props.isVisible ? "10px" : "0")};
    border-width: ${(props) => (props.isVisible ? "2px" : "0")};
    box-shadow: ${(props) =>
        props.isVisible
            ? "0 2px 8px rgba(0, 0, 0, 0.1)"
            : "none"};

    ${(props) =>
        props.isVisible &&
        `
        padding: 1rem 1.2rem;
    `}

    .code {
        font-family: "SF Mono", "Fira Code", monospace;
        font-size: 1.4rem;
        font-weight: 600;
        letter-spacing: 0.3rem;
        color: var(--text-primary);
        margin-right: auto;
    }
`;

export const ListContainer = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: 400px;
`;

export const MemberCard = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
`;

export const MemberName = styled.span`
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
`;

export const Remove = styled.button`
    background-color: #ff4d4d;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #d93636;
    }
`;

export const ActionIcons = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
`;

export const HeaderContainer = styled.div`
    background: var(--card-background);
    border-radius: 16px;
    padding: 16px 10px;
    margin: 0 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
`;

export const CodeButton = styled.button`
    background: var(--background-color);
    border: none;
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    font-size: 20px;
    transition: all 0.2s ease;

    &:hover {
        background: var(--hover-color);
        transform: translateX(-2px);
    }

    &:active {
        transform: translateX(0);
    }
`;

export const ActionIcon = styled.button`
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    svg {
        font-size: 1.2rem;
    }

    &:hover {
        color: #38a169;
        transform: translateY(-1px);
    }
`;

export const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    gap: 1.5rem;
`;

export const LoadingSpinner = styled.div`
    svg {
        font-size: 3rem;
        color: var(--fill-color);
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;

export const LoadingText = styled.p`
    font-size: 1.2rem;
    color: var(--text-primary);
    font-weight: 500;
    margin: 0;
    text-align: center;
`;

export const BackButton = styled.button`
    background: var(--card-background);
    border: none;
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    font-size: 20px;
    transition: all 0.2s ease;

    &:hover {
        background: var(--hover-color);
        transform: translateX(-2px);
    }

    &:active {
        transform: translateX(0);
    }
`;

export const EntriesContainer = styled.div`
    margin-top: 10px;
    padding: 0 5px;
    overflow-y: auto;
    flex: 1;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
`;

export const EntryHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

export const EntryCard = styled.div`
    background: var(--card-background);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid var(--border-color);

    &:hover {
        transform: translateY(-2px);
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

export const EntryName = styled.h3`
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 0 0;
    display: flex;
    align-items: center;
    gap: 8px;

    &::after {
        content: "";
        flex: 1;
        height: 2px;
        background: linear-gradient(
            to right,
            var(--border-color),
            transparent
        );
    }
`;

export const EntryDate = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 20px;
    transition: all 0.2s ease;
    background: var(--background-color);

    &:hover {
        transform: translateY(-1px);
        background: var(--hover-color);
    }

    span {
        font-size: 1.2rem;
    }
`;

export const EntrySection = styled.div`
    position: relative;
    padding: 16px 20px;
    margin-bottom: 16px;
    border-radius: 12px;
    background: ${(props) => {
        switch (props.type) {
            case "rose":
                return "rgba(255, 143, 177, 0.1)";
            case "thorn":
                return "rgba(184, 58, 58, 0.1)";
            case "bud":
                return "rgba(152, 206, 0, 0.1)";
            default:
                return "transparent";
        }
    }};

    &::before {
        content: "${(props) => {
            switch (props.type) {
                case "rose":
                    return "Rose";
                case "thorn":
                    return "Thorn";
                case "bud":
                    return "Bud";
                default:
                    return "";
            }
        }}";
        position: absolute;
        left: 20px;
        top: -10px;
        font-size: 0.85rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 6px;
        background: var(--card-background);
        color: ${(props) => {
            switch (props.type) {
                case "rose":
                    return "#FF8FB1";
                case "thorn":
                    return "#B83A3A";
                case "bud":
                    return "#98CE00";
                default:
                    return "var(--text-primary)";
            }
        }};
    }
`;

export const EntryText = styled.p`
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-primary);
    margin: 0;
    white-space: pre-wrap;
`;

export const EntryPageTitle = styled.h1`
    font-size: 2.4rem;
    font-weight: 700;
    flex: 1;
    text-align: center;
    margin: 0;
    padding: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: ${(props) => props.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

export const EntryReactions = styled.div`
    width: 100%;
    max-width: 480px;
    height: 100%;
    background: ${(props) =>
        props.theme.mode === "dark-mode"
            ? "#2d1f1f"
            : "#fdf2f1"};
    padding: 0.5em;
    padding-left: 0;
    position: relative;
    justify-content: space-evenly;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 0.2em;
    margin-right: 0.2em;
    border-radius: 16px;
`;

export const Reaction = styled.span`
    position: relative;
    width: 100%;
    height: 100%;
    padding: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 0.3em;

    &:hover {
        transform: scale(1.2);
        cursor: pointer;
    }
`;

export const ReactionCount = styled.div`
    position: absolute;
    top: 0.2em;
    right: 0.05em;
    background-color: #736f6e;
    color: white;
    font-size: 5px;
    font-weight: bold;
    padding: 2px 4px;
    border-radius: 50%;
    display: flex;

    &:hover {
        font-size: 7px;
        cursor: pointer;
    }
`;
// =======================
// 💬 Modal Styles Section
// =======================

// Modal Overlay - Centers the modal and dims the background
export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center; /* Vertically center */
    justify-content: center; /* Horizontally center */
    z-index: 1000; /* Ensure modal is on top */
`;

// Modal Content - Container for the modal content
export const ModalContent = styled.div`
    background: var(--card-background);
    padding: 1.5rem;
    border-radius: 12px;
    width: 90%;
    max-width: 320px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    /* Dark mode styles */
    .dark-mode & {
        color: rgb(232, 232, 232); /* Change text color to white in dark mode */
    }
`;

// Modal Title - Styled for consistency
export const ModalTitle = styled.h3`
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
`;

// Modal Buttons Wrapper - Organizes buttons
export const ModalButtons = styled.div`
    display: flex;
    justify-content: center; /* Center buttons horizontally */
    align-items: center; /* Align buttons vertically */
    gap: 0.75rem;
    margin-top: 1.5rem;
    width: 100%; /* Ensures full width to center properly */
`;


// Button Styles for Modal - "Confirm" and "Cancel" styles
export const ModalButton = styled.button`
    flex: 1;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    &.confirm {
        background-color: #ff4757;
        color: white;

        &:hover {
            background-color: #e74c3c;
        }
    }
    ${(props) =>
        props.variant === "confirm"
            ? `
        background: #ff4757;
        color: white;
        &:hover {
            background: #e74c3c;
        }
    `
            : `
        background: var(--border-color);
        color: var(--text-primary);
        &:hover {
            background: var(--text-secondary);
            color: var(--card-background);
        }
    `}
`;