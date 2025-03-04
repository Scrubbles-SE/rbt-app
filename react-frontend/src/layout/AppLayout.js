import React from "react";
import styled from "styled-components";
import Header from "./Header";
import Footer from "./Footer";

// Better device detection that considers both screen size and user agent
const isMobileDevice = () => {
    const userAgent =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    return userAgent || window.innerWidth <= 768; // Use 768px as mobile breakpoint
};

const PhoneContainer = styled.div`
    // Desktop styles - force mobile container
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

    // Mobile styles - full width
    @media (max-width: 768px) {
        width: 100%;
        height: 100vh;
        margin: 0;
        background: var(--background-color);
        display: flex;
        flex-direction: column;
    }
`;

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
        padding: 70px 0 calc(70px + 35px);
        -webkit-overflow-scrolling: touch;
        background-color: var(--background-color);
    }

    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
    }
`;

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

export const AppLayout = ({ children }) => {
    const isMobile = isMobileDevice();

    const content = isMobile ? (
        <MobileLayout>
            <div className="header">
                <Header />
            </div>
            <main className="main-content">{children}</main>
            <div className="footer">
                <Footer />
            </div>
        </MobileLayout>
    ) : (
        <DesktopLayout>
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
        </DesktopLayout>
    );

    return isMobile ? (
        content
    ) : (
        <PhoneContainer>{content}</PhoneContainer>
    );
};

export default AppLayout;
