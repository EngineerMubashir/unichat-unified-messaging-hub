TABLE OF CONTENTS

INTRODUCTION	1
1.1 Brief	2
1.2 Relevance to Course Modules	2
1.3 Project Background	3
1.3.1 Evolution of Communication Systems	3
1.3.2 Rise of Multi-Channel Messaging	3
1.3.3 Need for a Unified Messaging Solution	3
1.4 Literature Review	3
1.4.1 Existing Solutions	3
1.4.2 Gaps in Research	3
1.5 Analysis from Literature Review	3
1.5.1 Comparative Evaluation	3
1.5.2 Lessons Learned	4
1.6 Methodology and Software Lifecycle	4
1.6.1 Agile Methodology	4
1.6.2 Tools and Platforms	4
2 PROBLEM STATEMENT	4
2.1 Brief	4
2.2 Relevance to Course Modules	4
2.3 Project Background	4
2.3.1 Challenges in Multi-Channel Communication	4
2.3.2 Limitations of APIs in Isolation	5
2.4 Literature Review	5
2.5 Analysis from Literature Review	5
2.6 Methodology and Software Lifecycle	5
 
3 SYSTEM DESIGN AND IMPLEMENTATION	5
3.1 Architecture Overview	5
3.1.1 System Components	5
3.1.2 Data Flow Description	5
3.1.3 Use Case Scenarios	6
3.2 Detailed Design	6
3.2.1 ERD (Entity Relationship Discussion)	6
3.2.2 DFD (Data Flow Diagram)	7
3.2.3 Sequence Diagram	7
3.2.4 Class Diagram	7
3.3 Technologies Used	7
3.3.1 Frontend (React Native)	7
3.3.2 Backend (Node.js + Express)	7
3.3.3 Database (MongoDB)	8
3.3.4 APIs	8
3.4 Security Considerations	8
3.4.1 API Authentication	8
3.4.2 HTTPS and Encryption	8
3.4.3 Database Security	8
4 IMPLEMENTATION	8
4.1 Frontend Implementation	8
4.1.1 Project Structure & Libraries	8
4.1.2 Authentication Flow	9
4.1.3 Conversation & Message UI	9
4.1.4 Real-Time Updates & Notifications	9
4.2 Backend Implementation	9
4.2.1 Project Structure & Libraries	9
4.2.2 REST Endpoints	10
4.2.3 Outbound Message Handling	10
4.2.4 Webhook Handling (Inbound)	10
4.3 Database Implementation	11
4.3.1 Collections & Sample Schema	11
4.3.2 Indexes & Performance	12
 
4.4 API Integration (WhatsApp & Messenger)	12
4.4.1 WhatsApp Cloud API – Key Points	12
4.4.2 Messenger Platform – Key Points	12
4.4.3 Error Handling & Rate Limiting	13
5 TESTING AND QUALITY ASSURANCE	13
5.1 Testing Strategy	13
5.2 Test Cases	13
5.3 Tools Used	14
5.4 Quality Assurance Metrics	14
6 DEPLOYMENT AND OPERATIONS	14
6.1 Deployment Strategy	14
6.2 CI/CD Pipeline	14
6.3 Monitoring and Logging	15
6.4 Maintenance Plan	15
7 RESULTS AND EVALUATION	15
7.1 Functional Achievements	15
7.2 Comparison with Existing Tools	16
7.3 Limitations	16
7.4 User Feedback	16
8 FUTURE WORK	16
8.1 Additional Platforms	16
8.2 AI Chatbots	16
8.3 Analytics & Reporting	16
8.4 Mobile Application Improvements	16
8.5 Collaboration Features	17
9 CONCLUSION	17
10 REFERENCES	17
 
11 APPENDICES	17
A.1 WhatsApp Send Message (Postman example)	17
A.2 Messenger Send Message (Graph API)	18
B.1 Example: Node.js Express route to send message	18
B.2 Example: Platform adapter (conceptual)	19
B.3 Example: Webhook verification (Messenger)	19
C.1 Test Case Template	19


 
LIST OF FIGURES
Figure 1-UniChat - Architecture Diagram	8
Figure 2-UniChat - ERD Diagram	10
Figure 3-UniChat - DFD Diagram	11
Figure 4-UniChat - Sequence Diagram	12
Figure 5-UniChat - Class Diagram	13
Figure 6-UniChat_app_landing_page	17
Figure 7-UniChat__login	18
Figure 8-UniChat__connectiont_Screen	19
Figure 9-UniChat__messenger_login	20
Figure 10-UniChat__whatsapp_login	21
Figure 11-UniChat_Chat_screen	22

 
LIST OF TABLES
Table 1:	35



 
1 INTRODUCTION
In the modern era, communication has become the backbone of personal, educational, and business interactions. With the proliferation of smartphones and internet connectivity, messaging applications such as WhatsApp and Facebook Messenger have become the most widely used platforms for day-to-day communication. These platforms enable real-time exchange of text, media, voice notes, and documents, ensuring that individuals and organizations can stay connected seamlessly across the globe.
However, the increasing diversity of messaging applications has created a significant fragmentation problem. Users often find themselves switching between multiple applications to manage conversations with different contacts. For example, business communication may rely heavily on WhatsApp Business APIs, while personal and group chats may still take place on Messenger. This constant context-switching reduces productivity and creates inefficiencies in communication management.
To address this issue, there is a growing demand for unified communication platforms that integrate multiple messaging services into a single interface. Such a solution can help users save time, improve accessibility, and provide organizations with centralized communication management.
This project, titled "UniChat – A Unified Messaging Platform", aims to develop a React Native mobile application that integrates both WhatsApp and Messenger APIs into one application. The application will allow users to send and receive messages from both platforms without switching between apps, providing a seamless and efficient communication experience. The backend is developed using Node.js, ensuring scalability, API handling, and secure data management.
The significance of this project lies in its ability to demonstrate how modern API-driven software development can address real-world communication challenges. By leveraging official APIs and following secure authentication methods, this project highlights the importance of interoperability and system integration in software engineering.
In addition, the project is designed to follow standard Software Development Life Cycle (SDLC) phases, particularly the Agile methodology, ensuring iterative development, continuous feedback, and adaptability. The final system is tested using different quality assurance strategies, including unit testing, integration testing, and API response validation, ensuring that the solution is reliable and production-ready.

PROBLEM STATEMENT
In the modern era, communication is critical for businesses, educational institutions, and organizations of all scales. However, the reliance on multiple messaging platforms such as WhatsApp and Messenger creates a fragmented communication environment. Customer support teams, students, and organizational staff are often forced to switch between different applications, resulting in missed messages, delayed responses, and duplication of effort. This lack of centralized communication management reduces efficiency and makes it difficult to maintain proper records of conversations for future reference.
Existing solutions such as Twilio Conversations API and Zendesk Messaging provide partial unification, but they are costly, subscription-based, and lack flexibility for smaller organizations or academic use. On the other hand, open-source alternatives like Chatwoot require significant technical setup and maintenance, which limits their adoption by non-technical users. As a result, there remains a need for a simpler, customizable, and cost-effective unified messaging platform.
The problem addressed by this project is the absence of an open, lightweight system that integrates WhatsApp and Messenger into a single interface, while also ensuring real-time messaging, centralized storage, and scalability. Without such a platform, organizations face challenges in:
•	Managing customer or student conversations across multiple platforms.
•	Ensuring timely responses due to platform-switching.
•	Keeping track of historical records for analysis and accountability.
•	Maintaining data security and reliability across multiple APIs.
Therefore, the core problem statement is:
“There is a lack of an affordable, user-friendly, and scalable solution for integrating WhatsApp and Messenger into a unified communication platform, which leads to inefficiencies, message mismanagement, and increased workload in organizations.”





1.1 Brief
In the twenty-first century, digital communications form the backbone of social, educational, and commercial interactions. With billions of users worldwide relying on instant-messaging platforms, the means by which people exchange information have evolved beyond telephone calls and short message service (SMS) into asynchronous and synchronous internet-based messaging. Two of the most prominent services in this landscape are WhatsApp and Facebook Messenger. Each has become ubiquitous for personal conversations and, increasingly, for business-to-customer interactions. Despite their pervasiveness, the existence of multiple independent messaging platforms produces friction: users and organizations must switch applications to maintain conversations, and businesses must operate multiple support channels in parallel. The project documented in this thesis addresses the need for a consolidated solution by designing and implementing a unified messaging application that integrates both WhatsApp and Messenger channels into a single mobile client. The solution aims to reduce user overhead, centralize data for analytics, and provide a single development surface for features such as message search, notifications, and conversation history.
The principal goal of this project is to produce an application implemented in React Native (frontend) with a Node.js and Express backend and MongoDB datastore which communicates with official WhatsApp Cloud API and Facebook Messenger Platform. By relying on official APIs and secure server-to-server integration, the project intends to be compliant with platform policies while providing demonstrable, reproducible integration patterns suitable for educational and small-business use.
1.2 Relevance to Course Modules
This project synthesizes and applies many core modules of a typical Software Engineering curriculum:
•	Software Engineering Methods & Project Management: The project follows Agile practices, including sprint planning, backlog refinement, and continuous integration (CI). It demonstrates requirement engineering, software lifecycle planning, and documentation.
•	Mobile Application Development: Implementation uses React Native, covering cross-platform UI design, state management, navigation, and push notification handling.
•	Web Technologies & APIs: Node.js + Express demonstrates RESTful API design, webhook handling, and secure server-side integration with third-party services.
•	Databases & Data Modeling: MongoDB is used to model users, conversations, attachments, and logs. The thesis also covers schema design decisions relevant to chat applications, such as denormalization and message indexing for retrieval performance.
•	Networking & Security: Use of TLS/HTTPS, token-based authentication, secure storage, and webhook verification are discussed to ensure secure message flow and data privacy.
•	Testing & QA: The system is validated with unit tests, integration tests, and API tests (Postman), along with end-to-end manual testing strategies.
•	Deployment & DevOps: The thesis demonstrates containerized deployment, CI/CD pipelines (GitHub Actions), and monitoring with logging and observability considerations.
This multidisciplinary approach showcases how the theoretical knowledge from coursework can be implemented in a practical, production-like system.
1.3 Project Background
1.3.1 Evolution of Communication Systems
Historically, communication technologies progressed from postal mail to telephony, then to SMS and email. With the advent of smartphones and always-on internet, a new class of real-time messaging services emerged, combining low-latency text, voice notes, multimedia sharing, and rich messaging features. These platforms enabled a shift in how social interaction and business communication occur, opening the door to constant connectivity, chatbots, and commerce over messaging.
1.3.2 Rise of Multi-Channel Messaging
Modern users often keep several messaging apps installed: WhatsApp for personal chats, Messenger for social interactions and pages, Telegram for communities, and platform-native DM systems for specific services. Businesses, particularly small and medium enterprises, increasingly rely on messaging apps to engage customers. The proliferation of channels increases reach but also raises operational complexity—messages are scattered across distinct silos, each requiring separate administration and monitoring.
1.3.3 Need for a Unified Messaging Solution
A unified messaging solution reduces context switching, enables consistent handling of messages, and centralizes analytic capabilities. For example, support agents can handle requests from multiple channels in a single interface, and users can maintain a unified chat history across platforms. This project demonstrates that such unification is technically feasible using official APIs, while emphasizing security, privacy, and compliance with platform terms of use.

1.4 Literature Review
1.4.1 Existing Solutions
Several software packages and platforms aim to simplify multi-channel messaging:
•	Commercial SaaS: Services like Twilio Conversations and Zendesk integrate multiple channels (SMS, WhatsApp, Messenger) but are paid and often enterprise-focused.
•	Open-source Platforms: Chatwoot provides open-source customer engagement features and supports WhatsApp and Messenger via connectors, but setting up full production-grade deployments can be complex.
•	Aggregator Apps: Desktop apps such as Franz or Rambox allow multiple web clients in one interface but do not unify conversation identities across platforms.
•	Bridging Projects: Matrix-based bridges (e.g., mautrix) allow inter-protocol bridging but rely on additional infrastructure (Matrix homeserver), and present a different architectural trade-off.
1.4.2 Gaps in Research
Research and open-source projects often focus on either desktop aggregation, enterprise SaaS, or protocol bridging. There is less public material on mobile-first, educationally-oriented projects that demonstrate direct, secure integration of WhatsApp and Messenger into a single React Native application using official APIs, while documenting design trade-offs, webhook reliability, and data modeling strategies suitable for message-centric applications.
1.5 Analysis from Literature Review
1.5.1 Comparative Evaluation
Analyzing existing solutions reveals trade-offs:
•	Ease of Use vs Control: Commercial platforms offer ease but reduce control. Self-hosted solutions provide full control with more operational overhead.
•	Mobile-first vs Desktop-first: Many open-source tools are desktop-first; mobile-centric implementations are less common.
•	Official API Constraints: WhatsApp’s Business and Cloud APIs impose policies (opt-in, templates for notifications) and usage constraints which must be respected; Messenger requires page tokens and webhook setup.
1.5.2 Lessons Learned
The literature suggests that using official APIs is preferred for long-term reliability. A middleware layer (backend) that abstracts API differences is useful for presenting a unified interface to the front end. Such a layer must handle conversions of message formats, attachments, read receipts, and error handling.
1.6 Methodology and Software Lifecycle
1.6.1 Agile Methodology
The project followed Agile Scrum with two-week sprints. Each sprint delivered incremental functionality — early sprints created authentication and basic chat flows; middle sprints added API integration and message persistence; final sprints focused on testing, deployment, and documentation. Continuous integration ensured code quality through automated tests on pull requests.
1.6.2 Tools and Platforms
•	Version Control: Git + GitHub (branches for features and PR process).
•	Project Management: GitHub Issues & Projects for backlog and sprint planning.
•	Development Tools: Node.js LTS (backend), React Native (frontend), MongoDB (data store).
•	Testing: Jest for unit testing, Supertest for API tests, Postman for manual API verification.
•	Deployment: Docker for containerization; Heroku/Render/Vercel as example cloud platforms; Expo/EAS for mobile builds.
•	Observability: Winston for logging, Sentry for crash reporting (optional), and basic metrics capture for latency.









2 PROBLEM STATEMENT
2.1 Brief
This project addresses the fragmentation of real-time messaging across distinct consumer platforms. Specifically, users and small businesses have to monitor and respond via separate native applications (WhatsApp and Messenger), leading to potential message loss, delayed response times, and administrative overhead. There is a need for a consolidated, mobile-first solution that integrates both channels into a single, coherent experience.

2.2 Relevance to Course Modules
This problem intersects with mobiles systems, API design, database modeling, and security—topics core to software engineering education
2.3 Project Background
2.3.1 Challenges in Multi-Channel Communication
•	User Experience: Switching apps is cumbersome and leads to disjointed conversation context.
•	Operational Complexity: Businesses need multiple channels to be correctly configured and monitored; engineers maintain multiple systems with different authentication mechanisms and webhook semantics.
•	Analytics & Reporting: Collecting interaction metrics across platforms is challenging when messages are siloed.
2.3.2 Limitations of APIs in Isolation
Although both WhatsApp Cloud API and Messenger provide robust capabilities, they each use different authentication flows, message models, and webhook events. Implementing both directly on the client is insecure (exposes tokens) and impractical; therefore a server-side mediator is required to keep credentials secure, manage state, and persist messages.
2.4 Literature Review
The literature suggests that middleware-based architectures which centralize API credentials and translate between client and platform-specific formats lead to simpler client implementations and allow features like unified search and central analytics.
2.5 Analysis from Literature Review
The major conclusion is that a server-side integration layer is essential for secure, maintainable, and scalable multi-channel messaging solutions. Using official APIs reduces the risk of policy violations but imposes constraints (e.g., WhatsApp template messages, rate limits).
2.6 Methodology and Software Lifecycle
During development, a disciplined approach to requirement prioritization and interface contract design (OpenAPI for REST endpoints) ensured interoperability between frontend and backend. Design decisions favored eventual extensibility (adding Slack, Telegram later) while implementing the minimal viable product (MVP) for WhatsApp & Messenger.













3 SYSTEM DESIGN AND IMPLEMENTATION
3.1 Architecture Overview
 
Figure 1-UniChat - Architecture Diagram
3.1.1 System Components
•	React Native Client (Mobile): Provides user authentication, conversation listing, message compose, message viewing, attachments, and push notifications. The client interacts with the backend over HTTPS.
•	Backend Server (Node.js + Express): Exposes RESTful endpoints for client actions (/login, /conversations, /messages/send), verifies and stores incoming webhook events from WhatsApp and Messenger, mediates outgoing API calls, and manages tokens.
•	Database (MongoDB): Persists user profiles, conversation metadata, message content, delivery states, and logs for auditing.
•	Third-Party APIs (WhatsApp Cloud API & Messenger Platform): External services that deliver messages to recipients and notify the backend via webhooks.
•	Optional Services: Push notification service (Firebase Cloud Messaging), monitoring (Sentry), and analytics.
3.1.2 Data Flow Description
1.	Outbound Message Flow:
o	User composes a message in the React Native app.
o	The app sends an HTTPS request to the backend (POST /messages/send) including recipient id, platform, and message payload.
o	Backend validates user session and routes request to the appropriate external API using stored tokens.
o	The external API responds with a message id and status, which backend records in the database.
o	Backend returns a delivery status to the client; the client updates UI (optimistic rendering and final status).
2.	Inbound Message Flow:
o	External platform delivers events (incoming messages, status updates) to the backend webhook endpoint (POST /webhooks/whatsapp or /webhooks/messenger).
o	Backend validates webhook signature, parses message format, maps to internal data model, persists message, and notifies the client (via WebSocket or push notification).
o	Client receives the new message via real-time channel and renders it.
3.1.3 Use Case Scenarios
•	Single agent conversation: User replies to a WhatsApp message directly within the app; message is delivered through WhatsApp Cloud API.
•	Unified inbox: Agent views both Messenger and WhatsApp conversations ordered by last activity; can search across all chats.
•	Attachment delivery: User sends an image file; backend uploads it to the appropriate platform media endpoint and includes resulting media id in the outgoing message.
•	Notification handling: Push notifications alert offline users to new messages.
3.2 Detailed Design
3.2.1 ERD (Entity Relationship Discussion)
The primary entities:
•	User: { _id, name, email, phone, password_hash, auth_tokens, preferences }
•	Conversation: { _id, participants: [userId OR externalId], platform, title, last_message_id, unread_count }
•	Message: { _id, conversation_id, sender (user or external), recipient, body, media_url, platform_message_id, status, timestamp }
•	PlatformCredentials: { platform (whatsapp|messenger), token, refresh_info, phone_number_id, page_id }
•	WebhookEventLog: { raw_payload, event_type, received_at, processed }
Design rationale includes denormalizing conversation data to improve read performance (messages are typically read far more frequently than updated). Indexes on conversation_id, timestamp, and platform_message_id support efficient retrieval.
 
Figure 2-UniChat - ERD Diagram
3.2.2 DFD (Data Flow Diagram)
•	Level 0: User ↔ System.
•	Level 1: Client ↔ Backend API ↔ External APIs ↔ Database.
•	Level 2: Includes webhooks, push notification services, and optional worker queue (e.g., Bull/Redis) for media uploads and retries.
 
Figure 3-UniChat - DFD Diagram
3.2.3 Sequence Diagram
Sequence of events for sending a message:
1.	Client -> Backend: POST /messages/send
2.	Backend validates -> stores message as pending
3.	Backend -> External API: call to send message
4.	External API -> Backend: response (message_id)
5.	Backend updates Message record -> status sent
6.	Backend -> Client: sends final status via WebSocket or push
 
Figure 4-UniChat - Sequence Diagram

3.2.4 Class Diagram
Back-end classes/modules:
•	AuthService – manages user authentication and token issuance.
•	MessageController – handles HTTP endpoints for message send/receive.
•	PlatformAdapter (abstract) – concrete implementations: WhatsAppAdapter, MessengerAdapter to encapsulate API differences.
•	DatabaseService – abstracted DB operations.
•	WebhookHandler – verifies and parses webhook events.
 
Figure 5-UniChat - Class Diagram
3.3 Technologies Used
3.3.1 Frontend (React Native)
React Native leverages JavaScript (or TypeScript) to produce native-like cross-platform mobile applications. The UI uses components for chat lists, message bubbles, file pickers, and navigation (React Navigation). State management can use Context API, Redux, or Recoil depending on team preference. Handling offline storage is recommended (e.g., AsyncStorage or SQLite) for message caching.
3.3.2 Backend (Node.js + Express)
Node.js provides non-blocking I/O suitable for the real-time nature of messaging. Express offers flexible routing for REST endpoints and webhook handlers. For heavy workloads, a worker queue (Bull with Redis) can be used for media uploads, retries, and rate-limit handling.
3.3.3 Database (MongoDB)
MongoDB’s document model aligns well with the structure of messages (JSON-like) and enables flexible storage for different platforms. Using MongoDB Atlas simplifies hosting and includes built-in security features like IP whitelisting and global distribution.
3.3.4 APIs
•	WhatsApp Cloud API (Meta): Provides endpoints to send text, media, and messages templates. It requires a Meta Business account, registered phone number (or phone number id for cloud API), and use of access tokens. Template messages require pre-approval for outbound notifications.
•	Facebook Messenger Platform (Graph API): Requires a Facebook app, page access token, and webhook subscription. The messenger API supports structured messages, quick replies, and attachments.
3.4 User Interface Design
The user interface was meticulously crafted with a strong focus on usability and clarity, guided by several core design principles. We prioritized consistency in our use of color, typography, and iconography to ensure the application feels cohesive and familiar to users. Simplicity was key, as each screen was designed to have a clear, singular purpose, avoiding visual clutter, and making it easy for users to find what they need. We implemented intuitive navigation through a persistent bar that provided easy access to main sections like Home, Search, and Messages. To ensure accessibility for a wide range of devices, we adopted a responsive design that adapts smoothly to different screen sizes. Lastly, we integrated immediate and descriptive user feedback for every action, from confirmation messages for successful bookings to clear error messages, ensuring a transparent and reassuring user experience. This design was iteratively refined using mock-ups and prototypes, with feedback from user testing being central to our process.
3.4.1 Design Principles
The user interface (UI) is designed with a focus on clarity and ease of use. Key principles guiding the UI design include:
•	Consistency: The interface uses a coherent color scheme, typography, and iconography so that users learn one style and the rest of the application feels familiar.
•	Simplicity: Each screen has a clear purpose. For example, the home screen shows either upcoming appointments or highlighted providers, avoiding clutter. Forms use straightforward input fields and labels.
•	Intuitive Navigation: A bottom or side navigation bar (depending on platform) provides access to main sections: Home, Search, Messages, Profile, and (for admins) Dashboard. Common actions like “Search” or “Book Now” use prominent buttons.
•	Responsive Design: The layout adapts to different screen sizes (phones, tablets) so that the app is usable on various devices. Touch targets (buttons, links) are large enough for easy tapping.
•	Accessibility: Color contrast meets readability standards. Alternative text is provided for images/icons. The app supports system text size settings for users with visual impairments.
•	User Feedback: After each action (e.g. booking an appointment), the user receives immediate feedback (such as a confirmation message). Error messages are descriptive (e.g. “Please enter a valid date”).
Mock-ups and prototypes were created during design, and key interface elements like the login screen, profile view, search results list, and booking form were tested with sample users. Based on feedback, layouts were iterated until users could complete tasks without confusion. By adhering to these design standards, the interface helps users accomplish their goals (finding services or workers) quickly and pleasantly, which is essential for adoption and satisfaction.
 3.4.2 Key Interface Elements
The UniChat user interface has been designed with a focus on efficiency, clarity, and accessibility for three primary roles: agents, administrators, and end-users. The navigation model is structured into four main functional areas: Conversations, Contacts, Reports, and Profile Management. Each view is organized to support the user’s active task. For example, the conversation dashboard displays chat threads with clear timestamps, sender alignment, and channel identifiers (WhatsApp, Messenger), while the contact management view provides searchable and filterable records.
Visual indicators are used to highlight status and priority. Messages are labeled with delivery states (sent, delivered, read), while ongoing conversations are marked with active or closed tags. The design also supports real-time feedback: input validation highlights missing or invalid fields immediately, confirmation prompts reduce the risk of accidental deletions, and notification toasts inform users about the success or failure of actions.
Consistency has been maintained across the interface by following established design principles. Buttons, input fields, and icons are styled uniformly to provide predictability, while plain-language error messages (e.g., “Please enter a valid phone number”) ensure clarity. For critical functions such as account deletion or closing a conversation, contextual tooltips and warnings are displayed to guide the user.
3.4.3 Dashboard
The dashboard as a centralized hub where patients can access an overview of their account, including categories, popular doctors, applications, notifications, and messages. The dashboard is organized to present additional relevant information at a glance, allowing users to quickly understand their activity and navigate to specific tasks.
3.4.4 Screen images

 
Figure 6-UniChat_app_landing_page
•	Login page — fields: email, password, login button, forgot password link
 
Figure 7-UniChat__login

•	Conversations list — left pane showing list of conversations with latest message preview and unread badge

 
Figure 8-UniChat__connectiont_Screen
•	Integration settings — form to add provider credentials (Graph API token, WhatsApp API token), test connection button
 
Figure 9-UniChat__messenger_login
 
Figure 10-UniChat__whatsapp_login

•	Chat window — center/right pane showing messages, timestamps, input box, send button, attachments button.
 
Figure 11-UniChat_Chat_screen
3.5 Security Considerations
3.5.1 API Authentication
Store all platform tokens and secrets in environment variables or a secrets manager (e.g., AWS Secrets Manager). Do not expose tokens to the client. Use server-to-server token exchange and rotation mechanisms where supported.
3.5.2 HTTPS and Encryption
Enforce HTTPS for all client → server communication. Ensure TLS certificates are valid and up-to-date. For sensitive data at rest, encrypt critical fields where needed (e.g., token storage) and restrict database access with role-based access controls.
3.5.3 Database Security
Enable IP whitelisting for the database, use strong credentials, and periodically rotate access keys. Ensure least-privilege access for production systems, and sanitize all inputs to avoid injection attacks.











 
4 IMPLEMENTATION
4.1 Frontend Implementation
4.1.1 Project Structure & Libraries
A suggested React Native structure:
/src
  /components
    MessageBubble.js
    ChatInput.js
  /screens
    LoginScreen.js
    ConversationsScreen.js
    ChatScreen.js
  /services
    api.js     // wrapper for backend calls
    auth.js
  /utils
    date.js
    constants.js
App.js
Key libraries:
•	react-navigation for navigation.
•	axios or fetch for HTTP.
•	react-native-image-picker for attachments.
•	socket.io-client or @react-native-community/netinfo for real-time and connectivity.
4.1.2 Authentication Flow
•	User logs in with email/password or social login.
•	Backend returns JWT access token and refresh token.
•	Tokens stored in secure storage (e.g., react-native-keychain or encrypted storage).
•	Each request includes Authorization header Bearer <token>.
4.1.3 Conversation & Message UI
•	List conversations with last message preview and timestamp.
•	Chat screen uses FlatList with inverted rendering to display messages.
•	Optimistic UI updates: on send, show message immediately with pending status, then update when server confirms.
4.1.4 Real-Time Updates & Notifications
•	Use WebSocket (Socket.IO) or server-sent events to push messages to connected clients.
•	For offline users, use Firebase Cloud Messaging (FCM) to notify about new messages.
4.2 Backend Implementation
4.2.1 Project Structure & Libraries
/src
  /controllers
    messages.controller.js
    users.controller.js
  /services
    whatsapp.service.js
    messenger.service.js
    webhook.service.js
  /models
    user.model.js
    message.model.js
  /routes
    messages.routes.js
    users.routes.js
app.js
Libraries:
•	express for routing
•	mongoose for MongoDB
•	jsonwebtoken for JWT
•	axios for external HTTP calls
•	winston for logging
•	socket.io for real-time
4.2.2 REST Endpoints
Main endpoints:
•	POST /auth/login – user login.
•	GET /conversations – list conversations.
•	POST /messages/send – send message through platform-specific adapter.
•	POST /webhooks/whatsapp – WhatsApp incoming webhook.
•	POST /webhooks/messenger – Messenger webhook.
4.2.3 Outbound Message Handling
/messages/send flow:
1.	Validate user token.
2.	Create message document with status pending.
3.	Use PlatformAdapter to call the external API.
4.	On success: update message status to sent and store platform message id.
5.	On failure: retry policy (exponential backoff) or notify user.
4.2.4 Webhook Handling (Inbound)
•	Validate webhook signature (use X-Hub-Signature for Messenger).
•	Parse the event for message content, sender id, timestamp, and attachments.
•	Map sender id to conversation (if exists) else create new conversation record.
•	Persist message to DB and notify client.
4.3 Database Implementation
4.3.1 Collections & Sample Schema
User:
{
  _id: ObjectId,
  name: String,
  email: String,
  password_hash: String,
  created_at: Date
}
Conversation:
{
  _id: ObjectId,
  title: String,
  participants: [{ type: String, id: String }], // can be internal user IDs or external IDs
  platform: 'whatsapp'|'messenger'|'internal',
  last_message_at: Date
}
Message:
{
  _id: ObjectId,
  conversation_id: ObjectId,
  sender: { kind: 'user'|'external', id: String },
  body: String,
  media: { url: String, mime_type: String },
  platform_message_id: String,
  status: 'pending'|'sent'|'delivered'|'read'|'failed',
  created_at: Date
}
4.3.2 Indexes & Performance
•	Index conversation_id + created_at for fast retrieval.
•	TTL indexes for ephemeral logs.
•	Consider partitioning or sharding for very large datasets.
4.4 API Integration (WhatsApp & Messenger)
4.4.1 WhatsApp Cloud API – Key Points
•	Setup: Requires Meta developer account and configuration of a Meta Business account. A phone number must be added to the system and verified, or a phone number id used for Cloud API.
•	Authentication: Access tokens (permanent or short-lived with rotation). Store tokens securely.
•	Message Types: Text, media (image, audio, video, document), template messages (for notifications), interactive messages.
•	Templates: Outbound notifications often require pre-approved message templates. Use templates only where permitted (e.g., notifications).
•	Media Upload: Upload to /v16.0/<phone-number-id>/media to get media_id, then include in message send call.
•	Webhooks: WhatsApp sends webhook events for incoming messages, message status updates, and media events. Use webhook verification to confirm events.
Sample send text (conceptual):
POST https://graph.facebook.com/v16.0/<phone-number-id>/messages
Headers: Authorization: Bearer <ACCESS_TOKEN>
Body:
{
  "messaging_product": "whatsapp",
  "to": "<recipient_phone>",
  "type": "text",
  "text": { "body": "Hello from unified app!" }
}
4.4.2 Messenger Platform – Key Points
•	Setup: Create a Facebook App, a Page, and subscribe to webhooks. Obtain Page Access Token and set a verify token for webhook verification.
•	Authentication: Page Access Token is included in API calls.
•	Message Types: Text, attachments, templates, quick replies.
•	Webhooks: Messenger sends webhooks for messages, message reads, and delivery events.
•	Rate Limits: Respect Graph API rate-limits; implement backoff and retry.
Sample webhook flow:
•	Messenger sends POST to /webhooks/messenger with entry containing message events.
•	Respond with 200 OK quickly — background processing handles message storage and client notification.
4.4.3 Error Handling & Rate Limiting
Implement exponential backoff on 429 responses. Use a queue for high-volume outbound messages.
5 TESTING AND QUALITY ASSURANCE
5.1 Testing Strategy
Testing strategy includes:
•	Unit Tests: For business logic (message formatting, adapter behavior).
•	Integration Tests: For backend to external APIs (simulate calls with mocks or use sandbox/test tokens).
•	API Tests: Manual and automated via Postman collections or Newman.
•	End-to-End Tests: Basic flows from client → backend → external API → webhook handling → client update.
•	Security Tests: Penetration tests for common vulnerabilities (OWASP Top 10), token leakage checks.
•	Performance Tests: Load testing with representative message volumes.
5.2 Test Cases
Example test cases:
1.	Send Text via WhatsApp:
o	Input: valid recipient number and text body.
o	Expected: 200 OK from backend, message persisted in DB with status sent, external API acknowledged.
2.	Receive Incoming Messenger Message:
o	Simulated webhook POST to /webhooks/messenger.
o	Expected: webhook validated, message saved, client notified.
3.	Media Upload Flow:
o	Input: user attaches image; backend uploads to platform; platform returns media_id.
o	Expected: media id stored and message sent with media reference.
4.	Auth Token Expiry:
o	Simulate token expiry; expected behavior is token refresh or failure with clear error to client.
5.	Webhook Signature Verification:
o	Post webhook with invalid signature; expected: 403 Forbidden and error logged.
5.3 Tools Used
•	Postman for manual API testing and to generate runnable collections.
•	Newman for automated CI usage of Postman collections.
•	Jest for unit testing Node.js logic.
•	Supertest for endpoint testing.
•	Artillery or k6 for performance testing.
5.4 Quality Assurance Metrics
Key QA metrics include:
•	Test Coverage (target >70% for business logic).
•	API Latency (P95 under acceptable threshold e.g., 300ms for internal endpoints).
•	Message Delivery Rate (percentage of messages acknowledged as sent by platform).
•	Error Rate (percentage of failed messages).
•	Webhook Processing Time (time from external event to client notification).







6 DEPLOYMENT AND OPERATIONS
6.1 Deployment Strategy
Containerize backend services using Docker. Suggested deployment flow:
•	Build Docker image on commit to main.
•	Push to container registry (GitHub Packages, Docker Hub).
•	Deploy to cloud provider (Render, Heroku, AWS ECS, or DigitalOcean App Platform).
For mobile, use Expo for development and building production binaries via EAS (Expo Application Services).
6.2 CI/CD Pipeline
Implement GitHub Actions:
•	On Pull Request: Run lint, unit tests, and build checks.
•	On Merge to Main: Run full test suite, build Docker image, and push to registry.
•	On Tag / Release: Deploy to production environment.
Sample GitHub Actions job (conceptual):
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: docker build -t repo/app:${{ github.sha }} .
      - run: docker push repo/app:${{ github.sha }}
6.3 Monitoring and Logging
•	Use winston for structured logs; ship logs to a centralized system (LogDNA, Papertrail, or ELK stack).
•	Use Sentry for error reporting in both backend and React Native.
•	Capture metrics: request rates, latencies, queue lengths, webhook failures.
6.4 Maintenance Plan
•	Regularly rotate platform tokens and maintain automated alerts on token expiry.
•	Patch dependencies and monitor CVEs via Dependabot/GitHub Security Alerts.
•	Backup MongoDB and test restore procedures.
•	Maintain runbooks for incident response involving webhook downtime or API changes.











7 RESULTS AND EVALUATION
7.1 Functional Achievements
The implemented system demonstrates:
•	Unified inbox that shows conversations from WhatsApp and Messenger.
•	Two-way message flow: messages sent from the app reach recipients via respective official APIs; incoming messages are received via webhooks and appear in-app.
•	Media handling: images and files can be sent and received via media upload endpoints.
•	Real-time updates using WebSocket (Socket.IO) and push notifications.
Quantitative measurements (example figures to be filled with your test results):
•	Average outbound message latency (client -> backend -> external): X ms.
•	Message acknowledgment rate: Y%.
•	Number of test users: N.
7.2 Comparison with Existing Tools
Compared to commercial offerings, this project is:
•	Lower cost (self-hosted or simple cloud hosting) for small-scale usage.
•	Mobile-first: offers native-like experience.
•	Limited in scope: lacks some enterprise features (agent routing, SLA, multi-tenant isolation) that mature platforms provide.
7.3 Limitations
•	WhatsApp Template Constraints: outbound notifications require templates approved by Meta for certain non-session messages.
•	Scalability: initial architecture assumes a modest message volume; high volume would require horizontally scaling worker queues and DB partitioning.
•	Platform Policy Changes: APIs might change; maintenance is needed to keep up with Graph API versions.
7.4 User Feedback
User testing (sample feedback summary):
•	Pros: Saves time by avoiding app switching; intuitive UI; consistent conversation history.
•	Cons: Need for richer agent features (labels, assignment), and occasional API throttling causing delays.


Table 1-Requirements_feedback
Req. No.	Requirement (Short)	Requirement (Full description)	Priority	Source (SRS ref)	Design Component	Implementation Location / File
FR01	Send Message (WhatsApp)	Agents must be able to send text and attachments via WhatsApp Business Cloud API	High	SRS-FR-01	ChannelAdapter → WhatsAppAdapter	backend/services/whatsappAdapter.js
FR02	Receive Message (Messenger)	System must accept inbound Messenger webhooks and persist messages	High	SRS-FR-02	WebhookHandler → MessengerAdapter	backend/controllers/webhookController.js
FR03	Message History	Store full message history for each conversation for at least 1 year	Medium	SRS-FR-03	Persistence Layer	DB schema: messages table
FR04	Real-time updates	Agents must see incoming messages in <2s via WebSocket	High	SRS-NFR-01	API Layer + Socket.IO	backend/services/socketService.js
FR05	Attachments	Support images, audio, PDF attachments up to 10 MB	Medium	SRS-FR-05	AttachmentStore, Object Storage	storage/attachments/
FR06	Retry Logic	On provider send failures retry with exponential backoff, max 5 attempts	Medium	SRS-NFR-02	Background Worker	workers/retryWorker.js
FR07	Authentication	JWT-based authentication with role claims (admin/agent)	High	SRS-FR-07	AuthService	backend/middleware/auth.js
FR08	Conversation Assignment	Auto-assignment rule engine for queueing messages to agents	Low	SRS-FR-08	AssignmentService	backend/services/assignment.js
FR09	Monitoring	Admin dashboard shows message throughput, failed delivery counts	Medium	SRS-NFR-03	Admin Dashboard, Metrics	frontend/pages/admin/metrics.js
FR10	Scalability	Support at least 100 concurrent agents per instance	Medium	SRS-NFR-05	Load balancer, Redis cache	deployment/README.md








 
8 FUTURE WORK
8.1 Additional Platforms
Planned expansion to integrate Telegram, Signal, and Instagram DMs. System design keeps Platform Adapter extensible to add new adapters without changing core logic.
8.2 AI Chatbots
Introduce NLP-driven auto-responders and task automation:
•	Intent classification with transformer-based models (e.g., Hugging Face).
8.3 Analytics & Reporting
Add dashboards for message volume, response times, user engagement metrics, and conversation sentiment analysis.
8.4 Mobile Application Improvements
•	Richer UI components for attachments and message threading.
•	Offline-first behavior with message sync reconciliation.
•	Support for read receipts and typing indicators across platforms where available.
8.5 Collaboration Features
Multi-agent workflows, role-based access controls, conversation assignment, and audit logs for enterprise usage.








9 CONCLUSIONS
This thesis documents the design and implementation of a unified messaging platform that bridges WhatsApp and Facebook Messenger into a single mobile client implemented in React Native with a Node.js backend and MongoDB datastore. The project demonstrates the feasibility of integrating official platform APIs to provide a consolidated conversation experience. It emphasizes secure handling of tokens and webhooks, message persistence, and modular architecture to facilitate future platform additions. Although limitations exist (API constraints, scalability considerations), the system establishes a robust foundation for further development and practical deployment scenarios for small businesses and advanced student projects.





















10 REFRENCESREFERENCES
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




11 APPENDICES
Appendix A – API Testing (Postman)
A.1 WhatsApp Send Message (Postman example)
•	Endpoint: POST https://graph.facebook.com/v16.0/<PHONE_NUMBER_ID>/messages
•	Headers: Authorization: Bearer <ACCESS_TOKEN>; Content-Type: application/json
•	Body (send text):
{
  "messaging_product": "whatsapp",
  "to": "RECIPIENT_PHONE",
  "text": { "body": "Hello from Unified App" }
}
Figure A.1: [Placeholder for Postman WhatsApp request screenshot]
A.2 Messenger Send Message (Graph API)
•	Endpoint: POST https://graph.facebook.com/v16.0/me/messages?access_token=<PAGE_ACCESS_TOKEN>
•	Body (send text):
{
  "recipient": { "id": "<PSID>" },
  "message": { "text": "Hello from Unified App" }
}
Figure A.2: [Placeholder for Postman Messenger request screenshot]
Appendix B – Code Snippets
B.1 Example: Node.js Express route to send message
// routes/messages.js
const express = require('express');
const router = express.Router();
const { sendMessageToPlatform } = require('../services/platform.service');
router.post('/send', async (req, res) => {
  try {
    const { conversationId, text, platform, recipient } = req.body;
    // validate & auth
    const result = await sendMessageToPlatform({ platform, recipient, text });
    return res.json({ ok: true, result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});
module.exports = router;
B.2 Example: Platform adapter (conceptual)
// services/platform.service.js
async function sendMessageToPlatform({ platform, recipient, text }) {
  if (platform === 'whatsapp') {
    return sendViaWhatsApp(recipient, text);
  }
  if (platform === 'messenger') {
    return sendViaMessenger(recipient, text);
  }
  throw new Error('Unsupported platform');
B.3 Example: Webhook verification (Messenger)
app.get('/webhooks/messenger', (req, res) => {
  const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
Appendix C – Test Cases
C.1 Test Case Template
•	Test ID: TC-001
•	Title: Send text message via WhatsApp
•	Preconditions: User authenticated, valid access token.
•	Steps:
1.	Client POST /messages/send with platform=whatsapp, recipient phone, body text.
2.	Observe backend logs for outgoing API call.
3.	Verify upstream platform acknowledges message.
4.	Verify message saved in MongoDB with correct fields.
5.	Verify client receives delivery update.
•	Expected Result: Message status transitions from pending → sent and is visible in recipient app.
•	Actual Result: (To be filled during testing)
