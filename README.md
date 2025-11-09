# EcoEcho

EcoEcho is a pioneering civic-tech platform designed to create a direct bridge between citizens, their city government, and environmental action. Our mission is to transform real, data-driven environmental insights into actionable community tasks, empowering individuals to contribute to a sustainable future while earning tangible rewards.

**NOTE:** Required documentation which includes Architecture diagram is pushed on this repository. For easier access, you can [click here.](https://github.com/medinmujkovic/green-ear-aid/blob/main/EcoEchoDocu.pdf)

## Video showcase:
[You can find video showcase and presentation here.](https://www.youtube.com/@MuhamedHusi%C4%87-p2t)

## Team:
- [Muhamed Husić](https://github.com/HMByteSensei)
- [Medin Mujković](https://github.com/medinmujkovic)

## 🌟 Features

*   **AI-Generated Insights:** Leverages datasets from the Amazon Sustainability Data Initiative (ASDI), including Sentinel-2 imagery and OpenAQ data, to identify real-world environmental challenges like urban expansion and air quality hotspots. These insights form the basis of our "smart" tasks.
*   **Dynamic Task Marketplace:** A central hub where citizens can browse, accept, and complete a variety of environmental tasks.
*   **Multi-faceted Task Creation:**
    *   **Top-Down (Official Tasks):** City officials can publish tasks aligned with urban sustainability goals (e.g., "Plant 10 trees in a heat-island zone").
    *   **Bottom-Up (Citizen Suggestions):** Citizens act as "eyes on the ground," suggesting tasks (e.g., "Report illegal dumpsite") for official review and publication.
    *   **Community-to-Community (Requests):** Citizens can post direct requests for help from other community members (e.g., "Walk an elderly neighbor's dog").
    *   **"Smart" AI Suggestions:** A specialized AI continuously scans ASDI data to provide officials with data-backed task recommendations.
*   **Seamless Task Completion & Verification:** Citizens easily log in, accept a task, complete it, and mark it as done. Officials then verify completion via an admin dashboard.
*   **Real Rewards System:** Upon official approval of a completed task, citizens receive real rewards from the city (e.g., a free transport pass).
*   **Enhanced Accessibility with ElevenLabs:** Tasks come alive with human-like AI voice narration of descriptions and personalized congratulatory messages upon completion, making the platform engaging and accessible.

## 🚀 User Flow

1.  **AI-Generated Insights:** Our platform analyzes ASDI datasets to detect environmental challenges.
2.  **Task Creation:**
    *   **Officials:** Create tasks directly based on city goals or AI suggestions.
    *   **Citizens:** Suggest tasks that require government intervention.
    *   **Community:** Post peer-to-peer help requests.
    *   **"Smart" AI:** Provides data-driven task suggestions to officials.
3.  **Task Completion:** Citizens log in, accept a task, and complete it.
4.  **Verification & Rewards:** Officials approve completed tasks, and citizens receive their rewards.

## 🛠️ Technology Stack (Key Roles)

### 1. Lovable (Frontend Development & Hosting)
*   **What it does:** Lovable acted as our AI-assisted development teammate. We provided it with high-level instructions, and it generated the entire, production-ready React + Vite frontend for our application.
*   **Key Role:** It also serves as our hosting and deployment platform. The finished application is deployed live on Lovable's infrastructure.

### 2. Supabase (The Backend Brain)
*   **What it does:** Supabase is our all-in-one backend. It handles all critical data and logic.
*   **Key Roles:**
    *   **Authentication:** Manages all user signups and logins securely.
    *   **Database:** Stores all our data in its PostgreSQL database (e.g., the profiles table, tasks table, and user_tasks to link them).

### 3. ElevenLabs Features
*   **What it does:** This is our "wow" feature for accessibility and engagement.
*   **Key Role:** When a user views a task, they don't just have to read the description. They can click a button to hear a clear, human-like AI voice (powered by ElevenLabs) explain the task's importance. This makes the app more accessible and personal. The ElevenLabs voice is also used at the end of task completion to narrate specific congratulations messages to each user after completing a task.

### 4. ASDI (The Insight Engine)
*   **What it does:** This is the conceptual data source that makes our app "smart."
*   **Key Role:** While our demo app has manually-entered tasks, the ASDI Insight field for each task (e.g., “Sentinel-2 derived land cover maps show that built-up areas increased by 15.05%, while vegetation cover decreased by 29.93% in the region between 2016 and 2023.“) proves that our tasks are not random. They are based on real environmental data, solving real problems.



