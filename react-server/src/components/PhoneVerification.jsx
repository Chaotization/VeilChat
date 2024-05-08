import { useState, useEffect } from "react";
import axios from 'axios';

const PhoneVerificationModal = ({ initialPhoneNumber, onVerificationSuccess }) => {
    const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
    const [enteredCode, setEnteredCode] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isCodeRequested, setIsCodeRequested] = useState(false);
    const [error, setError] = useState('');
    const [resendCodeTimer, setResendCodeTimer] = useState(null);

    useEffect(() => {
        if (phoneNumber.length === 10) {
            setIsCodeRequested(false);
            setError('');
        }
    }, [phoneNumber]);

    useEffect(() => {
        if (enteredCode.length === 6) {
            const numericEnteredCode = Number(enteredCode);
            const numericVerificationCode = Number(verificationCode);
            if (numericVerificationCode === numericEnteredCode) {
                setIsVerified(true);
                onVerificationSuccess();
                console.log('Phone number verified successfully.');
            } else {
                setError('Verification code does not match.');
            }
        }
    }, [enteredCode]);

    const handlePhoneNumberChange = (event) => {
        setPhoneNumber(event.target.value);
    };

    const requestVerificationCode = async () => {
        try {
            const response = await axios.post("http://localhost:4000/sendNotification/verification", {
                phoneNumber
            });
            if (response.data.sendStatus) {
                setVerificationCode(response.data.verificationCode);
                setIsCodeRequested(true);
                console.log('Verification code requested:', response.data.verificationCode);
                setResendCodeTimer(setTimeout(() => setIsCodeRequested(false), 120000)); // Reset after 2 minutes
            } else {
                setError('Failed to request verification code.');
            }
        } catch (error) {
            console.error('Error requesting verification code:', error);
            setError('Error requesting verification code.');
        }
    };

    const handleVerificationInput = (event) => {
        setEnteredCode(event.target.value);
    };

    const resetVerification = () => {
        setEnteredCode('');
        setVerificationCode('');
        setIsVerified(false);
        setIsCodeRequested(false);
        clearTimeout(resendCodeTimer);
    };

    return (
        <div className="flex flex-wrap items-center mb-4 space-x-2">
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
                Mobile Number:
            </label>
            <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                placeholder="1234567890"
                pattern="[0-9]{10}"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                disabled={isVerified || isCodeRequested}
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full md:w-auto"
            />
            {!isVerified && !isCodeRequested && (
                <button
                    type="button"
                    onClick={requestVerificationCode}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={phoneNumber.length !== 10}
                >
                    Request Code
                </button>
            )}
            {isCodeRequested && !isVerified && (
                <>
                    <input
                        type="text"
                        placeholder="Enter verification code"
                        value={enteredCode}
                        onChange={handleVerificationInput}
                        maxLength={6}
                        className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full md:w-auto"
                    />
                    <button
                        type="button"
                        onClick={resetVerification}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Resend Code
                    </button>
                </>
            )}
            {isVerified && <div className="text-sm font-bold text-green-500">Phone number verified!</div>}
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default PhoneVerificationModal;
