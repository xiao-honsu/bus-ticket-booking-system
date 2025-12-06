# VIETNAM NATIONAL UNIVERSITY, HO CHI MINH CITY

## UNIVERSITY OF SCIENCE

### FACULTY OF INFORMATION TECHNOLOGY

# Advanced Web Development

## Project Proposal

### Bus Ticket Booking System

**Instructor**

- MSc. Nguyen Huy Khanh
- MSc. Tran Duy Quang
- MSc. Tran Van Quy

**Member**

- Nguyen Trung Quan - 22127346
- Nguyen Minh Toan - 22127419
- Phan Thi Tuong Vi - 22127451

---

**Date:** 13/10/2025

---

## Contents

1. [Project overview](#1-project-overview)
2. [Project statement](#2-project-statement)
3. [Competitive analysis](#3-competitive-analysis)
4. [User roles and responsibilities](#4-user-roles-and-responsibilities)
   - 4.1 [Passenger (User)](#41-passenger-user)
   - 4.2 [Administrator (Admin)](#42-administrator-admin)
5. [Core features](#5-core-features)
6. [Technical challenges](#6-technical-challenges)
7. [Learning goals](#7-learning-goals)
8. [Expected outcomes](#8-expected-outcomes)
9. [Conclusion](#9-conclusion)

---

## 1. Project overview

The Bus Ticket Booking System is a web-based platform that streamlines the process of purchasing bus tickets online. The system enables passengers to search for routes, compare prices, select seats, and make payments digitally by eliminating the need for physical ticket counters or manual reservations.

This project aims to provide a convenient and efficient solution for both passengers and transport operators. Users can easily access real-time bus schedules and receive instant e-ticket confirmations, while bus companies can manage routes, monitor bookings, and track passenger information through an administrative dashboard.

By digitalizing the ticketing process, the system promotes transparency, accuracy, and time efficiency in Vietnam's transportation sector. It also contributes to reducing paper waste and improving user experience through a unified, user-friendly, and reliable booking interface.

---

## 2. Project statement

Traditional bus ticket purchasing methods in Vietnam are still largely manual, requiring passengers to visit physical ticket counters or rely on phone reservations. This process is often time-consuming, inconvenient, and lacks transparency in seat availability or pricing.

Moreover, many local and regional bus companies have limited digital infrastructure, making it difficult for them to offer online booking services and manage their schedules efficiently.

This project aims to address these issues by developing a web-based Bus Ticket Booking System that simplifies the process of searching, booking, and managing bus tickets. The system provides:

- A centralized online platform where users can browse available routes, schedules, and seat options.
- Secure digital payments and real-time booking confirmation to enhance convenience.
- An administrative dashboard for transport companies to manage trips, monitor bookings, and track sales effectively.
- By offering a modern and user-friendly ticketing experience, the project promotes digital transformation in the transportation sector and improves accessibility and efficiency for both passengers and service providers.

---

## 3. Competitive analysis

| Platform                                    | Strengths                                                                                                                                                                                                                                                                                                      | Weaknesses                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **VeXeRe**                                  | • Strong in intercity bus booking with a wide range of operators and routes.<br>• Good user interface and consistent mobile-responsive design across app and web.<br>• Supports various payment methods, including international cards.<br>• Fast loading speed and responsive user experience.                | • Occasional mismatches in ticket price or seat map compared to actual trips.<br>• Refund and cancellation policies are sometimes unclear.<br>• Service quality inconsistency between bus operators affects user trust.<br>• Limited coverage in rural or small routes.                                                                                                           |
| **RedBus**                                  | • Strong international brand with a large network of bus partners.<br>• Specialized in bus ticketing with detailed trip and seat selection features.<br>• Stable business model through commission and SaaS tools for operators.<br>• User-friendly app and web interface.                                     | • Highly dependent on third-party bus operators — poor service affects brand reputation.<br>• Faces high competition; must innovate continuously.<br>• High marketing and maintenance costs for global expansion.<br>• Low penetration in rural areas with weak internet and digital payment habits.<br>• Profit margins may fluctuate due to commission pressure from operators. |
| **FutaBus (FUTA Bus Lines / Phuong Trang)** | • Well-known domestic brand with extensive intercity bus network.<br>• Offers both online and offline booking; trusted by frequent local travelers.<br>• Has its own bus terminals and stations across provinces.<br>• Provides clean, comfortable, and sometimes high-end vehicles (e.g., limousine service). | • Frequent complaints about late buses, cancellations, or unprofessional staff.<br>• Online information (bus type, seat layout) sometimes inaccurate.<br>• App and website not as modern or fast as specialized platforms.<br>• Inconsistent refund and cancellation policies.<br>• Limited options on minor routes or less populated areas.                                      |

---

## 4. User roles and responsibilities

The Bus Ticket Booking System defines two primary user roles: Passenger (User), and Administrator (Admin). Each role has distinct permissions and responsibilities to ensure the platform operates efficiently, securely, and reliably.

### 4.1 Passenger (User)

The Passenger represents an individual who uses the platform to search, book, and manage intercity or local bus tickets.

- Register and authenticate securely using email, phone number, or third-party login (e.g., Google).
  - → _We suggest you to use Firebase Authentication to handle OAuth 2.0_

- Search available routes based on origin, destination, date, and preferred departure time.

- View detailed trip information, including operator name, seat type, vehicle amenities, and ticket price.

- Choose seats directly from an interactive seat map.

- Book and pay for tickets online through integrated payment gateways (e.g., MoMo, Zalopay, or credit card).
  - → _We suggest you to use PayOS, Sapoo (any payment gateway as your preference) to implement this feature._

- Access e-tickets and booking history in their account dashboard.

- Modify or cancel bookings in compliance with the bus company's policy.

- Receive digital notifications, such as trip reminders, delay alerts, or cancellation updates.
  - → _We suggest you to push notification via Email or SMS._

- The chatbot's primary role is to provide a seamless, conversational interface for the entire booking lifecycle. Its functions are grouped into three core categories:

  **Trip inquiry & discovery:**
  - Act as a conversational search engine to find trips based on user prompts (e.g., origin, destination, time, price).
  - Provide real-time details on request, such as trip amenities and live seat availability (e.g., "Show me the seat map").

  **Conversational commerce (Booking & Payment):**
  - Guide the user through the complete booking action within the chat.
  - Securely hold selected seats and gather passenger information.
  - Initiate the payment process by generating a secure payment link directly in the conversation.
  - Confirm the booking instantly upon successful payment.

  **Post-booking & general Support:**
  - Answer general FAQ questions about company policies (e.g., luggage, refunds).
  - (Optional) Provide proactive alerts, such as trip reminders or delay notifications.

  - → _We and our lecturer (Mr. Khanh) highly recommend you to implement this feature by setting up a prompt which contains a list of your API endpoints to filter trip/seat information, make booking, seat selection and let LLM to parse user request and choose appropriate API to make action. However, you can also build a RAG (Retrieval-Augmented Generation) to improve the time response and quality of answer for Chatbot._

### 4.2 Administrator (Admin)

The Administrator oversees the entire system to maintain stability, transparency, and data integrity.

- Approve or verify new bus company accounts before activation.

- Manage all user and operator records, ensuring accurate and updated data.

- Review and handle user reports, complaints, or fraudulent activities.

- Monitor system performance, uptime, and database security.

- Generate platform-wide analytics — including total revenue, most active operators, and traffic metrics.

- Manage platform configurations, such as routes, regions, categories, and policy information.

- Maintain the server, API integrations, and ensure smooth synchronization between app and web platforms.

---

## 5. Core features

| Feature                                | Description                                                                                                                                                          | Primary User(s)   |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **User Registration & Authentication** | Allows passengers to register and log in securely using JWT authentication. Admins are just allowed to an account has been created before                            | Passenger, Admin. |
| **Search & Filter Trips**              | Users can search for bus routes by origin, destination, date, and bus type. Filtering options include time, price, and seat availability.                            | Passenger         |
| **Seat Selection & Booking**           | Displays a real-time seat map for each bus trip. Users can select seats, view prices, and confirm bookings instantly.                                                | Passenger         |
| **Online Payment Integration**         | Supports multiple payment gateways such as MoMo and PayPal Sandbox for seamless digital transactions.                                                                | Passenger         |
| **Booking Management**                 | Users can view, cancel, or reschedule existing bookings (based on operator policy). All changes are logged in the system.                                            | Passenger         |
| **Trip & Fleet Management**            | Admin can add, edit, and remove trip information, including departure time, route, and seat availability.                                                            | Admin             |
| **Revenue & Sales Dashboard**          | Admin is able to view real-time analytics of total sales, booked seats, and revenue reporting dashboard.                                                             | Admin             |
| **User Management**                    | Admins can create new admin account, manage user roles, ban an account, and handle account verification.                                                             | Admin             |
| **Notifications & Email Alerts**       | Sends automatic email notifications for booking confirmations, cancellations, and trip updates.                                                                      | Passenger         |
| **Feedback & Ratings**                 | Passengers can rate trips and leave feedback for bus operators.                                                                                                      | Passenger         |
| **Chatbot**                            | Passengers can interact with website via Chatbot interface by prompting (query trip/seat information and make booking action directly by chatting with the Chatbot). | Passenger         |

**There are 11 features in total.**

---

## 6. Technical challenges

- **Complex data relationships and consistency:** Managing multiple bus routes, schedules, and seat maps across various operators.
  - _Suggested solution:_ Applying saga pattern for data consistency (Choreography-based saga or Orchestration-based saga) and service decomposition with flexible column type as JSON (JSONB in PostgreSQL)

- **Real-time booking and payment integration:** Preventing double bookings and ensuring secure transaction flow.
  - _Suggested solution:_ Use transactional locking on seat reservations.

- **Dynamic seat synchronization:** Updating available seats instantly across users after each booking or cancellation.
  - _Suggested solution:_ Apply WebSocket or periodic API refresh to maintain consistent state.

- **Multi-role access control:** Different permissions for Passengers, and Admins.
  - _Suggested solution:_ Implement role-based access middleware and modular API routing.

---

## 7. Learning goals

- Strengthen hands-on experience in full-stack development.

- Learn secure authentication, authorization, and payment integration for high-concurrency scalable systems.

- Improve UI/UX skills by designing a responsive, user-friendly booking flow.

- Gain deeper understanding of cloud deployment, CI/CD pipelines, and API optimization.

- Apply software engineering principles such as modularization, scalability, and maintainability.

---

## 8. Expected outcomes

### Criteria 1

_In this criteria, you are allowed to build your system as a monolith application._

**A fully functional Bus Ticket Booking Web Application supporting real-time route browsing and seat selection. (5.0/10.0)**

- **Admin content management:** A secure admin dashboard for CRUD operations on routes, schedules, and fleet/seat maps. **(1.25/10.0)**
  - **Routes & Schedules:** Defining all available routes, departure/arrival times, and pricing. **(0.5/10.0)**
  - **Fleet & Seat Maps:** Managing vehicle types and their specific, interactive seat layouts. **(0.75/10.0)**

- **Passenger search & discovery (route browsing):** The public-facing interface for finding trips. **(1.0/10.0)**
  - Search for available trips based on origin, destination, and date. **(0.5/10.0)**
  - Filter and sort the search results (e.g., by price, time). **(0.5/10.0)**

- **Seat selection:** The core mechanism for reserving a ticket. **(1.75/10.0)**
  - View a seat map (real-time is optional) for a selected trip. **(0.25/10.0)**
  - Select one or more available seats, which are then temporarily "held". **(0.5/10.0)**
  - Confirm a booking, which is then saved in a "pending payment" state. **(0.5/10.0)**
  - Send automatic email notifications for booking confirmation, cancellations and trip updates (on time, route, ...) **(0.5/10.0)**

- **Core user system:** The foundational account management for both roles. **(1.0/10.0)**
  - Secure registration and authentication for Passengers and Admins (password recovery/change password/sign-in/sign-up/sign-out). **(0.5/10.0)**
  - A "My Bookings" dashboard for passengers to view and manage their booking history (e.g., view e-ticket, cancel booking). **(0.25/10.0)**
  - Leave feedback and rate trips via "My Bookings" dashboard for passengers. **(0.25/10.0)**

**Integrated payment functionality (refund functionality is optional) via any payment gateway or sandbox. (1.0/10.0)**

**Allow user to book seats without register/login an account. (1.0/10.0)**

**Allow user to interact with Chatbot to query trip/seat information and pay for a seat. (0.5/10.0)**

**Deploy the application to allow user access publicly. (1.0/10.0)**

→ **An application adapting fully Criteria 1 would score 8.5/10.0**

---

### Criteria 2

_For each bullet point below this criteria to be fulfilled, your application would score 0.5/10.0 for each one. To get score from this criteria, you need to fulfill Criteria 1 in beforehand:_

- **Decompose the project into Microservices** which requires to have these components: API Gateway, Load Balancer, Service Registry/Discovery, Database per service. **(0.5/10.0)**
  - _Note: If you decide to deploy Microservices with Kubernetes, the Service Registry/Discovery is no need to be implemented._

- **Deploy the Microservices with Cloud** (any of these and not limited by: AWS, Digital Ocean, Google Cloud Platform, ...) and running them with a CI/CD pipeline **(0.5/10.0)**

- **Deploy the Microservices locally (0.25/10.0)**
  - _Note: If you have deployed your application following Monolith deployment (from Criteria 1), you have to change your application's deployment to Microservices deployment. Your type of deployment (Cloud or running locally) is your choice and you have to choose one (which mean you either score 0.5/10.0 or 0.25/10.0 based on your decision on Cloud deployment or running locally)._

- **Build a system that can handle concurrent requests** for booking and paying for seats **(0.5/10.0)**

- **Ensure data consistency** by implementing Saga pattern (Orchestrator or Choreography) **(0.5/10.0)**

- **Using more than 1 authentication method for system:** Passenger (OAuth 2.0 or OTP-based authentication), Admin (Basic authentication with email and password) **(0.5/10.0)**.

- **Setup monitoring services for the system** (any of these and not limited by: Grafana, Prometheus, ELK, Datadog, ...) **(0.5/10.0)**

→ **An application adapting fully Criteria 2 would score 3.0/10.0**

⇒ **An application adapting fully Criteria 1 and Criteria 2 would score 11.5/10.0.**

---

## 9. Conclusion

The Bus Ticket Booking System aims to modernize Vietnam's intercity bus ticketing experience by providing a seamless, digital-first platform for passengers and operators alike. It fills the gap between fragmented offline ticket purchasing and the growing demand for real-time, cashless booking systems.

Through this project, the development team demonstrates solid technical understanding, problem-solving capability, and user-centered design, building a professional-level web application aligned with real-world transportation services.

---

**Project Proposal** | Page 9 / 9
