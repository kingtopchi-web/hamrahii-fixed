import userModel from "../../models/user.model.js";
import admin from "../firebaseAdmin.js";

export const sendToSingle = async ({ token, title, body, image, route }) => {
    try {
        await admin.messaging().send({
            token,

            notification: {
                title,
                body,
                image,
            },

            data: {
                type: "NAVIGATION",
                route: String(route),
            },

            android: {
                priority: "high",
                notification: {
                    channelId: "high_priority",
                    sticky: true,
                    priority: "max",
                    defaultSound: true,
                },
            },
        });

        console.log("✅ Sent with URL");
    } catch (err) {
        console.error("❌ Error:", err);
        throw err;
    }
};


export const sendToMultiple = async ({
    tokens,
    title,
    body,
    image,
    route,
}) => {
    try {

        // Step 1: Validate tokens
        if (!tokens || !Array.isArray(tokens)) {
            return {
                successCount: 0,
                failureCount: 0,
            };
        }

        // Step 2: Clean tokens
        const cleanTokens = tokens
            .filter(
                (t) =>
                    typeof t === "string" &&
                    t.trim() !== ""
            )
            .map((t) => t.trim());

        if (cleanTokens.length === 0) {
            return {
                successCount: 0,
                failureCount: 0,
            };
        }

        // Step 3: Send notification
        const res =
            await admin.messaging().sendEachForMulticast({
                tokens: cleanTokens,

                notification: {
                    title,
                    body,
                    image,
                },

                data: {
                    type: "NAVIGATION",
                    route: String(route),
                },

                android: {
                    priority: "high",

                    notification: {
                        channelId: "high_priority",
                        sticky: true,
                        priority: "max",
                        defaultSound: true,
                    },
                },
            });

        console.log("✅ Success:", res.successCount);
        console.log("❌ Failed:", res.failureCount);

        // Step 4: Find invalid tokens
        const tokensToDelete = [];

        res.responses.forEach((r, index) => {
            if (!r.success) {
                const errorCode = r.error?.code;

                console.log("❌ ERROR:", errorCode);

                const permanentErrors = [
                    "messaging/registration-token-not-registered",
                    "messaging/invalid-registration-token",
                    "messaging/invalid-argument",
                ];

                if (permanentErrors.includes(errorCode)) {
                    tokensToDelete.push(cleanTokens[index]);
                }
            }
        });

        // Step 5: Remove duplicate tokens
        const uniqueTokens = [
            ...new Set(tokensToDelete),
        ];

        // Step 6: Delete invalid tokens from DB
        if (uniqueTokens.length > 0) {
            await userModel.updateMany(
                {
                    mobileFcm: {
                        $in: uniqueTokens,
                    },
                },
                {
                    $pull: {
                        mobileFcm: {
                            $in: uniqueTokens,
                        },
                    },
                }
            );

            console.log(
                "🗑️ Removed invalid FCM tokens:",
                uniqueTokens.length
            );
        }

        // Step 7: Return result
        return {
            successCount: res.successCount,
            failureCount: res.failureCount,
        };

    } catch (err) {
        console.error("❌ Error:", err);
        throw err;
    }
};