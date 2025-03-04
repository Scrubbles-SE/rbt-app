import styled from "styled-components";
import { Link } from "react-router-dom";

export const FooterContainer = styled.footer`
    width: auto;
    height: 62px;
    background-color: var(--fill-color);
    padding: 0;
    z-index: 100;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    position: relative;
`;

export const TabBarContainer = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    overflow: visible;
    padding-bottom: 15px;
`;

export const ActionButton = styled.div`
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background-color: var(--fill-color);
    border-radius: 50%;
    z-index: 102;
    margin-bottom: 5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const NewEntryButton = styled(Link)`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;

    svg {
        font-size: 35px;
        color: ${(props) =>
            props.$isActive ? "#2c3e50" : "#666"};
        opacity: ${(props) => (props.$isActive ? "1" : "0.7")};
        transition: all 0.3s ease;
    }

    &:hover svg {
        transform: scale(1.1);
        opacity: 1;
        color: #2c3e50;
    }
`;

export const Nav = styled.nav`
    height: 100%;
`;

export const TabList = styled.ul`
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100%;
    margin: 0;
    padding: 0 15px;
    list-style: none;
`;

export const TabItem = styled.li`
    position: relative;
    width: 65px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const TabLink = styled(Link)`
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
    width: 100%;
    height: 100%;

    svg {
        font-size: 32px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: ${(props) => (props.$isActive ? "1" : "0.7")};
        transform: scale(
            ${(props) => (props.$isActive ? "1.1" : "1")}
        );
        color: ${(props) =>
            props.$isActive ? "#2c3e50" : "#666"};
    }

    &:hover svg {
        opacity: 1;
        transform: scale(1.1);
        color: #2c3e50;
    }
`;
