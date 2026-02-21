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

## Architecture Diagram

<img width="1090" height="613" alt="image" src="https://github.com/user-attachments/assets/fa380f08-83be-4bcf-82bc-d523be7f24e4" />

## ERD Diagram

<img width="504" height="379" alt="image" src="https://github.com/user-attachments/assets/6ac7713c-a232-48f7-9f03-02846f93adee" />

## DFD Diagram

<img width="739" height="556" alt="image" src="https://github.com/user-attachments/assets/5120bb63-533f-4f58-a53b-1ff4f0839390" />

## Sequence Diagram

<img width="398" height="593" alt="image" src="https://github.com/user-attachments/assets/f6fe97c6-7737-449f-98ec-1d63dbed6cbc" />

## Class Diagram

<img width="792" height="445" alt="image" src="https://github.com/user-attachments/assets/414575be-1e9e-47a6-9358-a2162a598b75" />


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

## Outputs 

<img width="621" height="1266" alt="image" src="https://github.com/user-attachments/assets/f3419666-8971-4285-9478-22fd744e6154" />
<img width="585" height="1200" alt="image" src="https://github.com/user-attachments/assets/2803bfdf-6a3e-4258-a32a-8ed25c5c7046" />
<img width="626" height="1266" alt="image" src="https://github.com/user-attachments/assets/bcfc23b1-bf21-4128-87c6-39c69d441940" />
<img width="615" height="1266" alt="image" src="https://github.com/user-attachments/assets/1e549eda-cac8-400a-97fe-16ce764960dc" />
<img width="631" height="1266" alt="image" src="https://github.com/user-attachments/assets/bdf247b4-6496-4187-b558-b5133e04e255" />
<img width="589" height="1200" alt="image" src="https://github.com/user-attachments/assets/5cc9cc0a-e91a-4419-a95c-d55981a7e320" />

## Refrences 

[1] Meta for Developers, “WhatsApp Cloud API Documentation,” Meta Platforms, Inc. [Online]. Available: https://developers.facebook.com/docs/whatsapp/cloud-api. [Accessed: 2025-04-07].

[2] Meta for Developers, “Messenger Platform Documentation,” Meta Platforms, Inc. [Online]. Available: https://developers.facebook.com/docs/messenger-platform. [Accessed: 2025-04-20].

[3] React Native Documentation. “Getting Started — React Native.” [Online]. Available: https://reactnative.dev/docs/getting-started. [Accessed: 2025-05-11].

[4] Node.js Foundation, “Node.js Documentation.” [Online]. Available: https://nodejs.org/en/docs/. [Accessed: 2025-05-22].

[5] Express.js, “Express — Node.js web application framework.” [Online]. Available: https://expressjs.com/. [Accessed: 2025-06-03].

[6] MongoDB Inc., “MongoDB Manual.” [Online]. Available: https://docs.mongodb.com/manual/. [Accessed: 2025-06-14].

[7] Socket.IO, “Socket.IO Documentation.” [Online]. Available: https://socket.io/docs/. [Accessed: 2025-06-28].

[8] D. Bradley et al., “JSON Web Token (JWT),” RFC 7519, Internet Engineering Task Force (IETF), May 2015. [Online]. Available: https://tools.ietf.org/html/rfc7519. [Accessed: 2025-07-04].

[9] D. Hardt, “The OAuth 2.0 Authorization Framework,” RFC 6749, Internet Engineering Task Force (IETF), Oct. 2012. [Online]. Available: https://tools.ietf.org/html/rfc6749. [Accessed: 2025-07-15].

[10] Postman Inc., “Postman Documentation.” [Online]. Available: https://learning.postman.com/docs/. [Accessed: 2025-07-23].

[11] GitHub, “GitHub Actions Documentation.” [Online]. Available: https://docs.github.com/actions. [Accessed: 2025-07-30].

[12] OWASP, “OWASP Top Ten — The Ten Most Critical Web Application Security Risks.” [Online]. Available: https://owasp.org/www-project-top-ten/. [Accessed: 2025-08-02].

[13] Chatwoot, “Chatwoot Documentation (Open-Source Customer Support).” [Online]. Available: https://www.chatwoot.com/docs. [Accessed: 2025-08-10].

[14] Twilio, “Twilio Conversations API (for comparison).” [Online]. Available: https://www.twilio.com/docs/conversations. [Accessed: 2025-08-18].




