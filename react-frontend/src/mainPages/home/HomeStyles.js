/**
 * Home Page Styled Components
 * Styling for calendar, entry displays, and UI elements on the home page
 */
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
    gap: 1.75rem;
`;

export const WelcomeSection = styled.div`
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: ${(props) =>
        props.children.length > 1 ? "1rem" : "0"};
    padding: 0.5rem 0 1rem;
`;

export const WelcomeHeader = styled.h1`
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    text-shadow: 2px 2px 4px var(--fill-color);
    letter-spacing: -0.5px;
    position: relative;
    display: inline-block;
    margin: 0 auto;

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
        color: var(--text-primary);
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
        color: var(--text-primary);
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
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
    text-align: left;
    width: 100%;
    padding-left: 0.75rem;
    position: relative;
    font-family: var(--font-header);

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 1.4rem;
        background: var(--fill-color);
        border-radius: 2px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
`;

export const Section = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
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
        color: var(--text-primary) !important;
    }

    .react-calendar__tile--now {
        background: var(--button-color) !important;
        color: var(--text-primary) !important;
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
    padding: 0.75rem;
    padding-horizontal: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    }
`;

export const EntryItem = styled.div`
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 0.25rem;

    &:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }

    h3 {
        color: var(--text-secondary);
        font-size: 1.1rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
        display: inline-block;
        position: relative;

        &::after {
            content: "";
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: var(--fill-color);
            opacity: 0.7;
            border-radius: 1px;
        }
    }

    p {
        color: var(--text-primary);
        font-size: 1rem;
        line-height: 1.7;
        padding: 0.25rem 0.5rem;
    }
`;

export const StyledModal = styled(Modal)`
    &.pop-up {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        max-width: 350px;
        background: var(--card-background);
        color: var(--text-primary);
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        border: 1px solid var(--border-color);
    }

    h2 {
        text-align: center;
        margin-bottom: 15px;
        color: var(--text-primary);
        font-weight: 600;
        border-bottom: 2px solid var(--fill-color);
        padding-bottom: 8px;
    }

    p {
        margin: 12px 0;
        line-height: 1.5;
    }

    button {
        background: var(--button-color);
        color: var(--text-primary);
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        margin-top: 15px;
        transition: all 0.2s ease;

        &:hover {
            background: var(--fill-color);
            transform: translateY(-2px);
        }
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
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 999;
`;

export const NoEntry = styled.div`
    color: var(--text-secondary);
    text-align: center;
    margin: 20px 0;
    font-style: italic;
    display: flex;
    flex-direction: column;
    align-items: center;

    button {
        margin-top: 15px;
        min-width: 100px;
    }
`;

export const EntryTag = styled.span`
    background: var(--fill-color);
    color: var(--text-primary);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    margin-right: 5px;
    margin-bottom: 5px;
    display: inline-block;
`;

export const TagsContainer = styled.div`
    margin-top: 15px;
    display: flex;
    flex-wrap: wrap;
`;

export const EntrySection = styled.div`
    margin-bottom: 15px;

    strong {
        color: var(--text-secondary);
        font-weight: 600;
    }

    p {
        padding: 5px 0;
    }
`;

export const ModalContent = styled.div`
    max-height: 70vh;
    overflow-y: auto;
    padding-right: 5px;

    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--fill-color);
        border-radius: 10px;
    }
`;

// Add global styles for Modal
export const ModalStyles = styled.div`
    /* This is a dummy component just to inject the styles below */
`;

// Adding global CSS for the modal
const injectGlobalStyles = `
  .pop-up {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 350px;
    background: var(--card-background);
    color: var(--text-primary);
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    border: 1px solid var(--border-color);
  }
  
  .pop-up h2 {
    text-align: center;
    margin-bottom: 15px;
    color: var(--text-primary);
    font-weight: 600;
    border-bottom: 2px solid var(--fill-color);
    padding-bottom: 8px;
  }
  
  .pop-up p {
    margin: 12px 0;
    line-height: 1.5;
  }
  
  .pop-up button {
    background: var(--button-color);
    color: var(--text-primary);
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    margin-top: 15px;
    transition: all 0.2s ease;
  }
  
  .pop-up button:hover {
    background: var(--fill-color);
    transform: translateY(-2px);
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 999;
  }
`;

// Add the styles to the document
if (typeof document !== "undefined") {
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.appendChild(
        document.createTextNode(injectGlobalStyles)
    );
    document.head.appendChild(styleElement);
}
