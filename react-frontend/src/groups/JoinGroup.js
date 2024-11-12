/*
IMPORTS
*/
import React, { useState } from "react";
import { FiUserPlus, FiX } from "react-icons/fi";

// Styles
import {
    JoinContainer,
    InitialView,
    JoinIcon,
    JoinText,
    CodeInput,
    Digit,
    JoinHeader,
    JoinButton,
    CloseButton,
    Toast
} from "./group.styles";

/*
RENDER
*/
function JoinGroup({ onGroupUpdate }) {
    const [stage, setStage] = useState("initial");
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [toastSuccess, setToastSuccess] = useState(true);

    const API_BASE_URL = "http://localhost:8000";

    // Join group API call
    const joinGroup = async (groupCode) => {
        const userId = localStorage.getItem("userId");
        console.log("Joining group:", { groupCode, userId });

        if (!userId) {
            throw new Error("User not logged in");
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/groups/${groupCode}/${userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("Join group response:", response);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error || "Failed to join group"
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Error joining group:", error);
            throw error;
        }
    };

    // Handles the initial join button click
    const handleJoin = () => {
        console.log(
            "Handle join clicked, current stage:",
            stage
        );
        if (stage === "initial") {
            setStage("code");
        }
    };

    // Handles the digit change for the group code
    const handleDigitChange = (index, value) => {
        if (value.length > 1) return;

        const newCode = [...code];
        newCode[index] = value.toUpperCase();
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(
                `digit-${index + 1}`
            );
            if (nextInput) nextInput.focus();
        }
    };

    // Handles the key down event for the group code
    const handleKeyDown = (index, e) => {
        if (
            e.key === "Backspace" &&
            !code[index] &&
            index > 0
        ) {
            const prevInput = document.getElementById(
                `digit-${index - 1}`
            );
            if (prevInput) prevInput.focus();
        }
    };

    // Handles the confirmation of the group code
    const handleConfirmCode = async () => {
        const joinCode = code.join("");
        console.log("Attempting to join with code:", joinCode);

        setIsLoading(true);
        try {
            const result = await joinGroup(joinCode);
            console.log("Join successful:", result);

            setToastSuccess(true);
            setToastMessage("Successfully joined group!");
            setShowToast(true);
            setStage("initial");
            setCode(["", "", "", "", "", ""]);

            // Call the update function after successful join
            onGroupUpdate();
        } catch (error) {
            console.error("Join failed:", error);
            setToastSuccess(false);

            // More user-friendly error messages
            switch (error.message) {
                case "You're already a member of this group":
                    setToastMessage(
                        "You're already a member of this group"
                    );
                    break;
                case "Group not found":
                    setToastMessage(
                        "This group code doesn't exist. Please check and try again."
                    );
                    break;
                default:
                    setToastMessage(
                        "Something went wrong. Please try again later."
                    );
            }
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Handles the closing of the join group modal
    const handleClose = () => {
        setStage("initial");
        setCode(["", "", "", "", "", ""]);
    };

    // Render content based on current stage
    const renderContent = () => {
        switch (stage) {
            case "initial":
                return (
                    <InitialView>
                        <JoinIcon>
                            <FiUserPlus />
                        </JoinIcon>
                        <JoinText>Join Group</JoinText>
                    </InitialView>
                );
            case "code":
                return (
                    <>
                        <CloseButton
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClose();
                            }}
                        >
                            <FiX />
                        </CloseButton>
                        <JoinHeader>
                            Enter group code:
                        </JoinHeader>
                        <CodeInput>
                            {code.map((digit, index) => (
                                <Digit
                                    key={index}
                                    id={`digit-${index}`}
                                    value={digit}
                                    onChange={(e) =>
                                        handleDigitChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        handleKeyDown(index, e)
                                    }
                                    maxLength={1}
                                    placeholder="_"
                                    autoFocus={index === 0}
                                    disabled={isLoading}
                                />
                            ))}
                        </CodeInput>
                        <JoinButton
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmCode();
                            }}
                            disabled={
                                code.some((digit) => !digit) ||
                                isLoading
                            }
                        >
                            {isLoading ? "Joining..." : "Join"}
                        </JoinButton>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <JoinContainer
                expanded={stage !== "initial"}
                onClick={
                    stage === "initial" ? handleJoin : undefined
                }
                role="button"
                tabIndex={0}
            >
                {renderContent()}
            </JoinContainer>
            {showToast && (
                <Toast
                    onAnimationEnd={() => setShowToast(false)}
                    variant={toastSuccess ? "success" : "error"}
                >
                    {toastMessage}
                </Toast>
            )}
        </>
    );
}

export default JoinGroup;
