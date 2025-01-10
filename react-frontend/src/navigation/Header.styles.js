import styled from "styled-components";

export const HeaderContainer = styled.header`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    background-color: var(--background-color);
    display: flex;
    align-items: flex-end;
    padding: 0 24px 16px;
    z-index: 100;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

export const ViewInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;

    svg {
        font-size: 32px;
        color: #2c3e50;
        opacity: 0.9;
    }
`;

export const ViewTitle = styled.h1`
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    letter-spacing: -0.5px;
`;
