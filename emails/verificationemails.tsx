import React from 'react';

type VerificationEmailProps = {
    email : string,
    username: string,
    verifyCode: string
}

        export const VerificationEmail: React.FC<VerificationEmailProps> = ({ username, verifyCode }) => {
    return (
        <div>
            <h2>Verify Your Email</h2>
            <p>
                Hi {username},
            </p>
            <p>
                Thanks for signing up! To verify your email address, please enter the following code:
            </p>
            <p>
                <strong>{verifyCode}</strong>
            </p>
            <p>
                This code will expire in 10 min.
            </p>
            <p>
                If you didn't request this verification, please ignore this email.
            </p>
            <p>
                Best regards,
                <br />
                The Vidlive Team
            </p>
        </div>
    );
};

