import React, { useState, useEffect, useLayoutEffect } from "react";
import axios from "axios";
import {
    useParams,
    useNavigate,
    useLocation
} from "react-router-dom";
import {
    FiCopy,
    FiShare,
    FiHash,
    FiChevronLeft
} from "react-icons/fi";
import { ThemeProvider } from "styled-components";

// Styles
import {
    Container,
    ContentContainer,
    EntryPageTitle,
    CodeButton,
    GroupCodeDisplay,
    ActionIcon,
    Toast,
    HeaderRow,
    BackButton,
    HeaderContainer,
    getGradient,
    EntriesContainer,
    EntryCard,
    EntryName,
    EntrySection,
    EntryText,
    EntryHeader,
    EntryDate,
    EntryReactions,
    Reaction,
    ReactionCount
} from "./group.styles";

function GroupEntries({ userId }) {
    // Constants & states
    const { groupId, groupName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const groupCode = location.state?.group_code;
    const [theme, setTheme] = useState({ mode: "light-mode" });


    useLayoutEffect(() => {
            const currentTheme = localStorage.getItem("theme");
            setTheme({ mode: currentTheme || "light-mode" });
    }, []);
    


    const API_BASE_URL = "http://localhost:8000";

    


    return (
        <ThemeProvider theme={theme}>
                <Container>
                    <ContentContainer>
                    
                    
                    </ContentContainer>

                </Container>

        </ThemeProvider>



    );



}