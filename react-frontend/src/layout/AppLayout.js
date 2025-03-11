/*
 * Application Layout Component
 * Provides responsive layout structure with different views for mobile and desktop
 * Desktop view simulates a mobile phone to maintain consistent mobile-first UX
 */
import React from "react";
import styled from "styled-components";
import Header from "./Header";
import Footer from "./Footer";

/**
 * Detects if the current device is mobile based on user agent and screen width
 * This hybrid approach ensures proper detection across various devices
 */
const isMobileDevice = () => {
    const userAgent =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    return userAgent || window.innerWidth <= 768;
};

/**
 * Container that wraps desktop view to simulate a mobile phone
 * Only applied in desktop mode to maintain consistent UX
 */
const PhoneContainer = styled.div`
    @media (min-width: 769px) {
        width: 100%;
        max-width: 450px;
        height: calc(100vh - 28px);
        margin: 14px auto;
        background: var(--background-color);
        position: relative;
        border: 0px solid #000000;
        border-radius: 40px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    @media (max-width: 768px) {
        width: 100%;
        height: 100vh;
        margin: 0;
        background: var(--background-color);
        display: flex;
        flex-direction: column;
    }
`;

/**
 * Layout for true mobile devices with fixed header and footer
 * Main content scrolls independently between fixed elements
 */
const MobileLayout = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background-color: var(--background-color);

    .header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
    }

    .main-content {
        flex: 1;
        width: 100%;
        overflow-y: auto;
        padding: 70px 0 70px;
        -webkit-overflow-scrolling: touch;
        background-color: var(--background-color);
    }

    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        height: 62px;
    }
`;

/**
 * Layout for desktop view inside the phone container
 * Simpler structure as it's already contained within PhoneContainer
 */
const DesktopLayout = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;

    .main-content {
        flex: 1;
        overflow-y: auto;
        padding: 80px 15px 0;
    }
`;

/**
 * Main application layout component that handles responsive design
 * Renders different layouts for mobile and desktop environments
 * For desktop, wraps the content in a phone-like container for consistent UX
 * Can hide header and footer for onboarding flows
 */
export const AppLayout = ({
    children,
    isOnboarding = false
}) => {
    const isMobile = isMobileDevice();

    const content = isMobile ? (
        <MobileLayout>
            {!isOnboarding && (
                <div className="header">
                    <Header />
                </div>
            )}
            <main
                className={`main-content ${isOnboarding ? "onboarding-content" : ""}`}
            >
                {children}
            </main>
            {!isOnboarding && (
                <div className="footer">
                    <Footer />
                </div>
            )}
        </MobileLayout>
    ) : (
        <DesktopLayout>
            {!isOnboarding && <Header />}
            <main
                className={`main-content ${isOnboarding ? "onboarding-content" : ""}`}
            >
                {children}
            </main>
            {!isOnboarding && <Footer />}
        </DesktopLayout>
    );

    return isMobile ? (
        content
    ) : (
        <PhoneContainer>{content}</PhoneContainer>
    );
};

export default AppLayout;
