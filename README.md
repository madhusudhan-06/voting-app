
# VoteEase: An Online Voting Application Using Blockchain and Facial Recognition

**VoteEase** is a secure, transparent, and decentralized online voting platform that leverages the Avalanche blockchain for immutable vote recording and DeepFace-powered facial recognition for real-time voter authentication. Designed to modernize electoral systems, it ensures trust, accessibility, and fraud prevention through biometric verification, smart contracts, and multi-factor authentication.


## Features

- **Blockchain-Based Voting**: Utilizes the Avalanche blockchain for tamper-proof vote storage and transparency.
- **Facial Recognition**: Integrates DeepFace and MediaPipe for real-time voter identity verification with liveliness detection (blink, smile, head movement).
- **Multi-Factor Authentication**: Combines OTP-based email verification, facial recognition, and MetaMask wallet signing for secure access.
- **Smart Contracts**: Written in Solidity, automates election management, vote recording, and result computation.
- **Multilingual Support**: Supports 21 languages (e.g., English, Hindi, Kannada, etc.) using the Google Translate API.(No api key needed)
- **User-Friendly Interface**: Built with React.js for an intuitive and responsive frontend experience.
- **Admin Dashboard**: Allows admins to create elections, approve voters, and manage election processes.
- **Email Notifications**: Sends OTPs and election updates (start/end) via Nodemailer.
- **Scalability**: Leverages Avalanche’s high throughput and low-cost transactions for large-scale elections.
- **Security**: Employs JWT for session management, bcrypt for password hashing, and Cloudinary for secure image storage.

## Project Structure

The project consists of four main components:
1. **Hardhat**: For developing, testing, and deploying smart contracts on the Avalanche Fuji testnet.
2. **Node.js Backend**: Handles server-side logic, API requests, and database interactions using Express.js and MongoDB.
3. **React.js Frontend**: Provides the user interface for voters and admins.
4. **Python (Flask) App**: Manages facial recognition and verification using DeepFace, OpenCV, and MediaPipe.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or cloud instance, e.g., MongoDB Atlas)
- **MetaMask** (browser extension for wallet integration)
- **Hardhat** (for smart contract development)
- **Git** (for cloning the repository)
- **Avalanche Fuji Testnet** account with test AVAX (obtain from [Avalanche Faucet](https://faucet.avax.network/))
- **Cloudinary** account for image storage
- **Email Service** (e.g., Gmail with app-specific password for Nodemailer)

### Python Dependencies
- DeepFace
- OpenCV
- MediaPipe
- Flask
- PIL (Python Imaging Library)

### Node.js Dependencies
- Express.js
- MongoDB
- JWT
- bcrypt
- Nodemailer
- Ethers.js
- Cloudinary

### Frontend Dependencies
- React.js
- Axios (for API calls)
- MetaMask SDK

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/madhusudhan-06/voting-app.git
   cd voting-app
   ```

2. **Set Up Environment Variables**

   - **Hardhat**: Create a `.env` file in the `hardhat` directory with the following:
     ```env
     PRIVATE_KEY=your_metamask_account_private_key
     MONGO_URI=your_mongo_uri
     ```

   - **Backend**: Create a `.env` file in the `backend` directory with the following:
     ```env
     MONGO_URI=your_mongo_uri
     PRIVATE_KEY=your_admin_wallet_private_key
     JWT_SECRET=your_jwt_secret
     EMAIL=your_email_address
     PASSWORD=your_email_app_password
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     ```

   - **Python (Flask)**: create a `.env` file in the `python` directory for Cloudinary credentials).

3. **Install Dependencies**

   - **Hardhat**:
     ```bash
     cd hardhat
     npm install
     ```

   - **Backend**:
     ```bash
     cd ../backend
     npm install
     ```

   - **Frontend**:
     ```bash
     cd ../frontend
     npm install
     ```

   - **Python (Flask)**:
     ```bash
     cd ../python
     pip install -r requirements.txt
     npm install
     ```

4. **Set Up MongoDB**
   - Ensure MongoDB is running locally or connect to a cloud instance (e.g., MongoDB Atlas).
   - Update the `MONGO_URI` in the `.env` files for both Hardhat and Backend.

5. **Set Up Cloudinary**
   - Create a Cloudinary account and obtain your `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
   - Add these to the backend `.env` file.

6. **Set Up Email Service**
   - Configure an email service (e.g., Gmail) with an app-specific password for Nodemailer.
   - Add the `EMAIL` and `PASSWORD` to the backend `.env` file.

## Hardhat Compilation and Deployment

1. **Compile Smart Contracts**
   - Navigate to the `hardhat` directory:
     ```bash
     cd hardhat
     ```
   - Compile the smart contracts:
     ```bash
     npx hardhat compile
     ```
   - This generates the contract artifacts in the `artifacts` and `cache` folder, which is ignored by `.gitignore`.
   - hardhat.config.js file pre-configured with the Fuji network details.


## Running the Project

1. **Start the Python (Flask) Server**
   - Navigate to the `python` directory:
     ```bash
     cd python
     ```
   - Run the Flask app:
     ```bash
     python app.py
     ```
   - The facial recognition API should be accessible at `http://localhost:5001` (or the configured port) .

2. **Start the Node.js Backend**
   - Navigate to the `backend` directory:
     ```bash
     cd ../backend
     ```
   - Start the backend server:
     ```bash
     nodemon server.js
     ```
   - The backend should be accessible at `http://localhost:5000` (or the configured port).

3. **Start the React.js Frontend**
   - Navigate to the `frontend` directory:
     ```bash
     cd ../frontend
     ```
   - Inside the src folder, create an artifacts directory and copy the Voting.json file from hardhat/artifacts/contracts/Voting.sol into it.
   - Start the frontend development server:
     ```bash
     npm start
     ```
   - The frontend should be accessible at `http://localhost:3000` (or the configured port).

4. **Interact with the Application**
   - Open your browser and navigate to `http://localhost:3000`.
   - Register as a voter by providing your email, wallet address, and a selfie.
   - Admins can log in to manage elections and approve voters.
   - Use MetaMask to connect your wallet and sign transactions for voting.

## Project Workflow

1. **Voter Registration**:
   - Users register with their email, wallet address, and a selfie.
   - OTP is sent to the email for verification.
   - Admin approves/rejects the registration.

2. **Voter Authentication**:
   - During voting, users undergo facial recognition and liveliness checks.
   - OTP verification and MetaMask wallet signing ensure secure access.

3. **Election Management**:
   - Admins create elections, add candidates, and manage the voting period.
   - Smart contracts handle vote recording and result computation.

4. **Voting**:
   - Voters select a candidate, undergo facial verification, and sign the transaction via MetaMask.
   - Votes are recorded immutably on the Avalanche blockchain.

5. **Results**:
   - After the election ends, results are computed and displayed transparently.


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
