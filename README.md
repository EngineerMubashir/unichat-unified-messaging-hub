UniChat – Unified Messaging Platform (API-Based)

📌 Overview
UniChat is a unified messaging platform designed to integrate WhatsApp Cloud API and Facebook Messenger API into a single centralized system. The project was developed as a Final Year Project (FYP) to address the problem of fragmented communication across multiple messaging platforms.
Unlike matrix-based or protocol-bridging systems, UniChat is purely API-based, relying on official platform APIs and webhooks to send, receive, and manage messages securely and efficiently.
The system provides a centralized dashboard where conversations from multiple platforms can be viewed, managed, and stored in a structured manner.
________________________________________
🎯 Problem Statement
Organizations, small businesses, and educational institutions often communicate with clients or students through multiple messaging platforms such as:
•	WhatsApp
•	Facebook Messenger
Managing these platforms separately leads to:
•	Fragmented communication
•	Delayed responses
•	Difficulty in maintaining conversation history
•	Lack of centralized monitoring
•	Poor record management
Commercial solutions (e.g., Twilio, Zendesk) offer unified messaging but are subscription-based and expensive. Open-source tools often require complex deployment and are not tailored for lightweight academic or small-scale use.
UniChat was developed to provide:
•	A customizable
•	Secure
•	Scalable
•	Cost-effective
•	API-driven
unified messaging solution.
________________________________________
🏗 System Architecture
UniChat follows a client-server architecture and is completely API-driven.
🔹 Frontend
•	React / React Native (mobile-friendly UI)
•	Real-time conversation interface
•	Attachment upload support
•	WhatsApp-style chat UI
🔹 Backend
•	Node.js (Express.js)
•	REST APIs
•	Webhook handling for WhatsApp & Messenger
•	Token-based authentication
•	Message routing logic
🔹 Database
•	MongoDB
•	Message persistence
•	Conversation metadata storage
•	Media storage references
________________________________________
🔌 Platform Integrations
✅ WhatsApp Cloud API
•	Two-way messaging
•	Media messages (image, document, audio)
•	Message status updates (sent, delivered, read)
•	Webhook event handling
✅ Facebook Messenger API
•	Page-based messaging
•	Admin ↔ User conversation handling
•	Webhook message reception
•	Attachment handling
This system uses official APIs only. No unofficial libraries or scraping mechanisms are used.
________________________________________
⚙️ Features
UniChat provides the following functionality:
•	Real-time two-way communication
•	Unified conversation dashboard
•	Message status tracking
•	Media file handling (images, documents)
•	Contact message handling
•	Secure token management
•	Webhook validation
•	Message history persistence
•	Scalable architecture for future platform integration
•	API-based modular structure
________________________________________
🔐 Security Implementation
Security was implemented using a security-by-design approach:
•	HTTPS enforcement
•	Webhook verification tokens
•	Environment variable-based token storage
•	No token exposure to frontend
•	Input sanitization
•	Role-based backend access
•	Secure database configuration
•	Regular token rotation strategy
________________________________________
🧠 Development Methodology
The project followed the Agile Software Development Methodology:
•	Iterative sprint-based development
•	Continuous testing
•	Supervisor feedback integration
•	Feature prioritization
•	Incremental improvement
Testing tools used:
•	Jest (unit testing)
•	Supertest (API testing)
•	Postman (manual API validation)
________________________________________
📊 Quality Assurance Metrics
The following QA metrics were considered:
•	Test coverage (>70% business logic)
•	API latency monitoring
•	Webhook processing time
•	Message delivery success rate
•	Error rate tracking
•	System uptime monitoring
•	Database query performance
•	Recovery time objectives (RTO)
•	Mean time to detect (MTTD)
•	Mean time to recover (MTTR)
________________________________________
🛠 Installation Guide
1️⃣ Clone Repository
git clone https://github.com/yourusername/unichat.git
cd unichat
2️⃣ Install Dependencies
npm install
3️⃣ Configure Environment Variables
Create .env file in backend folder:
PORT=5000
MONGO_URI=your_mongodb_connection_string
WHATSAPP_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_token
FACEBOOK_VERIFY_TOKEN=your_verify_token
4️⃣ Start Backend
node server.js
or
npm start
5️⃣ Setup Webhooks
•	Configure webhook URL in Meta Developer Console
•	Add verify token
•	Subscribe to required events:
o	messages
o	message_status
o	messaging_postbacks
________________________________________
📁 Project Structure
backend/
 ├── routes/
 ├── controllers/
 ├── models/
 ├── whatsapp.js
 ├── messenger.js
 ├── server.js
 └── .env

frontend/
 ├── components/
 ├── screens/
 ├── services/
 └── App.js
________________________________________
🔄 Maintenance Plan
•	Regular token rotation
•	CVE monitoring via Dependabot
•	MongoDB backup & restore testing
•	API changelog monitoring
•	Performance monitoring
•	Incident response documentation
•	Version upgrade management
•	Security audits
________________________________________
🚀 Future Enhancements
UniChat is designed for extensibility. Future improvements may include:
•	AI-powered chatbot integration
•	Sentiment analysis
•	Message classification
•	Real-time analytics dashboard
•	Multi-agent conversation assignment
•	CRM integration (Salesforce, HubSpot)
•	Audit logs for enterprise usage
•	Offline-first mobile behavior
•	Slack / Telegram integration
________________________________________
📈 Research Contribution
This project contributes academically by:
•	Demonstrating API-based unified messaging feasibility
•	Comparing self-hosted vs cloud-hosted trade-offs
•	Highlighting security-by-design practices
•	Providing a scalable modular backend model
•	Exploring real-world API constraints
________________________________________
🎓 Academic Context
This project was developed as a Final Year Project (FYP) thesis focusing on:
•	Unified communication systems
•	API-based integration architecture
•	Secure webhook handling
•	Scalable backend design
•	Mobile-first interface development
________________________________________
🏁 Conclusion
UniChat successfully demonstrates how fragmented communication platforms can be unified using official APIs within a secure, scalable, and modular architecture. The system reduces context switching, improves message management, and provides a foundation for intelligent communication systems.
While limitations exist due to platform API policies and rate limits, the architecture is robust enough for future expansion and production-level enhancements.
UniChat stands as a practical, customizable, and research-backed solution for unified communication.
________________________________________
📄 License
This project is developed for academic and research purposes.
You may modify and extend it according to your needs.
