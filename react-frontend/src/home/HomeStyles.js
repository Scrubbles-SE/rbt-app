import styled from "styled-components";
import Calendar from "react-calendar";
import Modal from "react-modal";

export const HomeContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    gap: 2.5rem;
`;

export const WelcomeSection = styled.div`
    width: 100%;
    text-align: center;
    margin-bottom: 0.5rem;
`;

export const WelcomeHeader = styled.h1`
    font-size: 2.4rem;
    font-weight: 800;
    color: ${(props) =>
        props.theme.mode === "dark-mode" ? "#fff" : "#2c3e50"};
    margin-bottom: 1.2rem;
    text-shadow: 2px 2px 4px var(--fill-color);
    letter-spacing: -0.5px;
    position: relative;
    display: inline-block;

    &::after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        height: 3px;
        background: linear-gradient(
            90deg,
            transparent,
            var(--fill-color) 20%,
            var(--fill-color) 80%,
            transparent
        );
        border-radius: 2px;
    }
`;

export const StreakCounter = styled.div`
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1.1rem;
    text-align: center;
    margin: 0.5rem 0;
    background: var(--fill-color);
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    display: inline-block;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;
    border: 1px solid var(--button-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h2 {
        color: ${(props) =>
            props.theme.mode === "dark-mode"
                ? "#fff"
                : "#2c3e50"};
    }

    &:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
`;

export const NoEntryMessage = styled.div`
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.9rem;
    text-align: center;
    margin: 0.5rem 0;
    background: var(--fill-color);
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    display: inline-block;
    animation: pulse 2s infinite;
    border: 1px solid var(--button-color);

    h3 {
        color: ${(props) =>
            props.theme.mode === "dark-mode"
                ? "#fff"
                : "#2c3e50"};
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.02);
        }
        100% {
            transform: scale(1);
        }
    }
`;

export const SectionTitle = styled.h2`
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    text-align: left;
    width: 100%;
    padding-left: 0.5rem;
    position: relative;

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 1.2rem;
        background: var(--fill-color);
        border-radius: 2px;
    }
`;

export const Section = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const CalendarContainer = styled.div`
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
`;

export const StyledCalendar = styled(Calendar)`
    width: 100%;
    border: none !important;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    background-color: var(--card-background);
    padding: 1.5rem;
    border: 1px solid var(--border-color);

    .react-calendar__navigation {
        margin-bottom: 15px;
    }

    .react-calendar__navigation button {
        min-width: 44px;
        background: none;
        font-size: 16px;
        color: var(--text-primary);
    }

    .react-calendar__navigation button:disabled {
        background-color: transparent;
    }

    .react-calendar__navigation button:enabled:hover,
    .react-calendar__navigation button:enabled:focus {
        background-color: transparent;
    }

    .react-calendar__navigation__label {
        font-weight: 700;
        font-size: 1.1rem;
        color: var(--text-primary);
    }

    .react-calendar__month-view__weekdays {
        text-align: center;
        text-transform: uppercase;
        font-weight: 600;
        font-size: 0.75em;
        color: var(--text-secondary);
    }

    .react-calendar__month-view__days__day {
        padding: 8px;
        color: var(--text-primary);
    }

    .react-calendar__tile {
        padding: 10px;
        border-radius: 8px;
        font-weight: 500;
    }

    .react-calendar__tile--active {
        background: var(--fill-color) !important;
        color: ${(props) =>
            props.theme.mode === "dark-mode"
                ? "#fff"
                : "#2c3e50"} !important;
    }

    .react-calendar__tile--now {
        background: var(--button-color) !important;
        color: ${(props) =>
            props.theme.mode === "dark-mode"
                ? "#fff"
                : "#2c3e50"} !important;
        font-weight: 600;
    }

    .react-calendar__tile:hover {
        background-color: var(--fill-color) !important;
        opacity: 0.7;
    }

    .entry-date {
        position: relative;

        &::after {
            content: "";
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            background-color: var(--fill-color);
            opacity: 0.8;
            border-radius: 50%;
        }
    }
`;

export const EntryDisplay = styled.div`
    width: 100%;
    max-width: 600px;
    background: var(--card-background);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border-color);
`;

export const EntryItem = styled.div`
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
        border-bottom: none;
    }

    h3 {
        color: var(--text-secondary);
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }

    p {
        color: var(--text-primary);
        font-size: 1rem;
        line-height: 1.6;
    }
`;

export const StyledModal = styled(Modal)`
    &.pop-up {
        width: 100%;
        max-width: 350px;
        background: var(--pop-up-background);
        color: var(--pop-up-text-color);
        padding: 20px;
        border-radius: 8px;
    }

    h2 {
        text-align: center;
    }
`;

export const ModalOverlay = styled.div`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
`;

export const NoEntry = styled.p`
    color: #666;
    text-align: center;
    margin-top: 20px;
    font-style: italic;
`;
