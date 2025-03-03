import styled from "styled-components";
import { lightTheme, darkTheme } from "../layout/themes.js";

export const Title = styled.h1`
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 2rem 0;
    position: relative;
    text-align: center;
    opacity: 0.8;
    font-family: var(--font-header);

    &::after {
        content: "";
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 2px;
        background: var(--fill-color);
        border-radius: 2px;
    }
`;

export const Subtitle = styled.h2`
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 2rem;
    position: relative;
    padding-left: 1rem;
    width: 100%;
    letter-spacing: -0.5px;

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 1.6rem;
        width: 4px;
        background: var(--fill-color);
        border-radius: 2px;
        box-shadow: 0 2px 8px var(--fill-color);
    }

    &::after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 1rem;
        width: 100px;
        height: 3px;
        background: linear-gradient(
            90deg,
            var(--fill-color) 0%,
            transparent 100%
        );
        border-radius: 2px;
    }
`;

export const TagName = styled.h1`
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 5px;
    margin-top: 5px;
    position: relative;
    padding-left: 1rem;
    flex: 1;
`;

export const PageContainer = styled.div`
    width: 100%;
    min-height: 100%;
    margin: 20px 0 50px 0;
    padding: 0 20px;
    background-color: var(--background-color);
    color: var(--text-primary);
    box-sizing: border-box;
`;

export const TagFolder = styled.div`
    padding: 1.8rem;
    margin-bottom: 1.25rem;
    margin-top: 20px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(
        135deg,
        var(--fill-color),
        var(--button-color)
    );
    color: var(--text-primary);
    display: flex;
    align-items: center;
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

export const TagContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    color: var(--text-primary);
`;

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

export const HeaderContainer = styled.div`
    background: var(--top-background);
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

export const BackButton = styled.button`
    background: ${(props) =>
        props.theme.mode === "dark-mode"
            ? darkTheme.cardBackground
            : "#f8f9fa"};
    border: none;
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) =>
        props.theme.mode === "dark-mode"
            ? "#ffffff"
            : "#2c3e50"};
    font-size: 20px;
    transition: all 0.2s ease;

    &:hover {
        background: ${(props) =>
            props.theme.mode === "dark-mode"
                ? "#404040"
                : "#e9ecef"};
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

export const EntryDate = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 600;
    padding: 6px 12px;
    background: var(--card-background);
    border-radius: 20px;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        background: var(--fill-color);
        opacity: 0.9;
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
    background: #fadadd;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

export const Folder = styled.div`
    display: flex;
    align-items: center;
    font-size: 3rem;
    opacity: 0.9;
    color: var(--text-primary);
`;

export const EntryNumber = styled.h4`
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 5px;
    margin-top: 5px;
    text-align: right;
    padding-right: 0.5rem;
`;
