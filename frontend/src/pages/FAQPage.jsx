import  { useState } from "react";
import "./FAQPage.css"; 

const FAQPage = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqData = [
        {
            question: "How does VoteEase ensure my vote is secure?",
            answer: "VoteEase uses Avalanche blockchain to record votes immutably. Each vote is cryptographically signed via MetaMask and verified through facial recognition (DeepFace + MediaPipe) to prevent impersonation."
        },
        {
            question: "Is my facial data stored securely?",
            answer: "Yes! Facial images are encrypted and stored in Cloudinary with strict access controls. They are only used for verification during voting and deleted after elections as per our Privacy Policy."
        },
        {
            question: "Why do I need a crypto wallet (MetaMask)?",
            answer: "MetaMask ensures your vote is signed and recorded on the blockchain anonymously. No personal data is linked to your wallet address."
        },
        {
            question: "What if I fail the facial recognition check?",
            answer: "Ensure proper lighting and follow on-screen instructions (e.g., blink/smile). If issues persist, contact support with your registered email."
        },
        {
            question: "How are election results calculated?",
            answer: "Smart contracts on Avalanche automatically tally votes. Results are published on-chain and can be audited via the Blockchain Explorer."
        },
        {
            question: "Why did you choose Avalanche over Ethereum?",
            answer: "Avalanche offers faster transactions (2-3 sec), lower fees, and eco-friendly PoS consensus—critical for scaling elections without gas price volatility."
        },
        {
            question: "Can anyone see who I voted for?",
            answer: "No! Votes are anonymized on-chain. Only your wallet address and vote choice are recorded, never linked to your identity."
        },
        {
            question: "What prevents someone from using a photo/video to spoof facial recognition?",
            answer: "MediaPipe performs liveliness checks (blinking/head movements). DeepFace also compares embeddings, not just raw images, to block deepfakes."
        },
        {
            question: "What if I wear glasses/grow a beard? Will recognition fail?",
            answer: "DeepFace handles minor appearance changes. For major changes (e.g., facial surgery), re-register with a new selfie via admin approval."
        },
        {
            question: "Can I change my vote after submitting?",
            answer: "No. Blockchain immutability ensures votes are final once recorded to prevent tampering."
        },
        {
            question: "How do I know my vote was counted?",
            answer: "After voting, you can verify your vote, visit Snowtrace, enter your wallet address in the search bar, and view the transaction details on the Avalanche blockchain."
        },
        {
            question: "How are admins verified?",
            answer: "Admins are pre-approved entities (e.g., election commissioners) with multi-sig wallet access to prevent unilateral actions."
        },
        {
            question: "Can elections be hacked or manipulated?",
            answer: "No. Smart contracts are audited, and admin privileges are time-locked. Even admins can’t alter votes after recording."
        },
        {
            question: "Is VoteEase accessible for visually impaired users?",
            answer: "Currently, we support screen readers. Future updates will add voice-guided voting and high-contrast modes."
        },
        {
            question: "What languages are supported?",
            answer: "21 languages including Hindi, Kannada, Tamil, and Spanish via Google Translate API. More coming soon!"
        },
        {
            question: "I didn’t receive my OTP. What should I do?",
            answer: "Check spam folder or request a new OTP. Ensure your registered email is correct. Contact support if issues persist."
        }
    ];

    const filteredFAQs = faqData.filter((item) =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="faq-container">
            <h1>Frequently Asked Questions</h1>

            {/* Search Bar */}
            <div className="faq-search">
                <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
            </div>

            {/* FAQ List */}
            <div className="faq-list">
                {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((item, index) => (
                        <div key={index} className="faq-item">
                            <button
                                className={`faq-question ${activeIndex === index ? "active" : ""}`}
                                onClick={() => toggleFAQ(index)}
                            >
                                {item.question}
                                <span className="toggle-icon">{activeIndex === index ? "−" : "+"}</span>
                            </button>
                            {activeIndex === index && (
                                <div className="faq-answer">{item.answer}</div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-results">No FAQs match your search.</p>
                )}
            </div>
        </div>
    );

};

export default FAQPage;