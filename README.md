# 🥋 Sensei AI - Ancient Wisdom, Modern Learning

<div align="center">
  <img src="https://i.ibb.co/gb8z37N9/Sensei.gif" alt="Sensei AI Logo" width="100" height="100">

  [![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-sensei--ai--phi.vercel.app-blue?style=for-the-badge)](https://sensei-ai-phi.vercel.app)
  ![Frontend](https://img.shields.io/badge/Frontend-React_+_TypeScript-61DAFB?style=for-the-badge&logo=react)
  ![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=for-the-badge&logo=node.js)
  ![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)
  ![AI](https://img.shields.io/badge/AI-OpenAI_+_Gemini-412991?style=for-the-badge&logo=openai)

  *Experience the perfect intersection of technical innovation and learning mastery*
</div>

---

## 🌟 The Challenge We Solve

Traditional learning methods fail to adapt to individual needs, leaving students overwhelmed with generic content and no personalized guidance. Language barriers, lack of practice materials, and absence of career direction further hinder effective learning.

**Sensei AI** bridges this gap with an intelligent learning ecosystem that adapts to your pace, creates personalized content from your materials, and provides comprehensive guidance for your educational journey.

---

## 🚀 Features Overview

### 🏯 Complete Learning Ecosystem

| Feature | Description | AI Technology |
|---------|-------------|---------------|
| 🥊 **Study Dojos** | Focused learning sessions with AI-generated quizzes from PDFs | RAG + LLM Quiz Generation |
| 🎓 **Concept Academy** | AI-powered explainer videos from complex concepts | Multimodal AI + TTS |
| 🧭 **Course Advisor** | Personalized upGrad course recommendations | Vector Similarity + ML |
| 🧠 **Memory Palace** | Spaced repetition flashcards with active recall | Adaptive Learning Algorithms |

### 🔮 Advanced AI-Powered Tools

<details>
<summary><strong>🔍 Oracle's Insight - PYQ Analysis</strong></summary>

- **Pattern Recognition**: Identifies frequently asked topics
- **Sample Papers**: Generates prophetic practice papers  
- **Smart Analysis**: Reveals hidden examination patterns
- **Focus Areas**: Prioritizes high-impact study topics

</details>

<details>
<summary><strong>📚 Sensei's Path - Study Plans</strong></summary>

- **CRAG Technology**: Corrective Retrieval Augmented Generation
- **Goal-Oriented**: Personalized learning trajectories
- **Progressive Learning**: Adaptive difficulty scaling
- **Time Management**: Optimized study schedules

</details>

<details>
<summary><strong>🌉 Language Bridge - Translation</strong></summary>

- **PDF Translation**: English to Hindi conversion
- **Context Aware**: Maintains technical accuracy
- **Download Support**: Exportable translated materials
- **Inclusive Learning**: Breaking language barriers

</details>

<details>
<summary><strong>🎬 AI Video Creation</strong></summary>

- **Slide Generation**: Automated PowerPoint creation
- **Voice Narration**: Professional AI-generated audio
- **Video Synthesis**: Synchronized visual content
- **Easy Sharing**: Exportable learning materials

</details>

---

## 🛠️ Technology Stack

### Frontend
- ⚛️ React 18 + TypeScript
- 🎨 Tailwind CSS + Framer Motion  
- 🔄 React Router DOM
- 📊 Recharts for Analytics
- 🎭 Lottie React for Animations
- 🔐 Supabase Auth

### Backend
- 🚀 Node.js + Express.js
- 🗄️ Supabase (PostgreSQL)
- 🤖 OpenAI GPT-4 + Google Gemini
- 🎵 Text-to-Speech APIs
- 📄 PDF Processing (pdf-parse)
- 🎯 Vector Embeddings (Pinecone)

### AI & ML Services
- 🧠 Large Language Models (GPT-4, Gemini)
- 🎯 Vector Similarity Search
- 📊 Retrieval Augmented Generation (RAG)
- 🔄 Corrective RAG (CRAG)
- 🎙️ Text-to-Speech Synthesis
- 🖼️ Automated Slide Generation

---

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Google Gemini API key

### 🎨 Frontend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/sensei-ai.git
cd sensei-ai/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Environment Variables (`.env`):
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
```

```bash
# Start development server
npm run dev
```

### 🔧 Backend Setup

```bash
# Navigate to backend
cd ../backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Environment Variables (`.env`):
```bash
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index
```

```bash
# Start development server
npm run dev
```

### 🗄️ Database Setup

1. **Create Supabase Project**: Visit [Supabase](https://supabase.com) and create a new project

2. **Run Database Migrations**:
   - Create tables for users, dojos, videos, courses
   - Set up Row Level Security (RLS) policies
   - Configure storage buckets for files
   - Enable real-time subscriptions

3. **Enable Authentication**:
   - Configure Google OAuth in Supabase Auth settings
   - Set redirect URLs for your domain

---

## 📱 Feature Deep Dive

### 🥊 Study Dojos
Transform your PDFs into interactive learning sessions:

```javascript
// Upload PDF → AI Analysis → Generate Quizzes
const createDojo = async (pdfFile: File, settings: DojoSettings) => {
  // AI processes PDF content
  // Generates contextual questions
  // Creates adaptive difficulty levels
}
```

**Tech Stack**: RAG + Vector Embeddings + LLM Question Generation

### 🎓 Concept Academy
Create explainer videos from complex topics:

```javascript
// Text Input → Slide Generation → Voice Narration → Video Synthesis
const createExplainerVideo = async (concept: string, audience: string) => {
  // AI breaks down complex concepts
  // Generates educational slides
  // Creates professional narration
  // Synthesizes synchronized video
}
```

**Tech Stack**: Multimodal AI + TTS + Video Processing

### 🧭 Course Advisor
Personalized course recommendations:

```javascript
// Career Goals → Vector Similarity → Course Matching
const getRecommendations = async (userProfile: UserProfile) => {
  // Analyzes career objectives
  // Matches with course database
  // Provides personalized suggestions
}
```

**Tech Stack**: Vector Similarity + ML Recommendation Engine

---

## 🎯 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - User logout

### Study Dojos
- `POST /api/dojos/create` - Create new dojo
- `GET /api/dojos/user/:userId` - Get user dojos
- `POST /api/dojos/:id/start-session` - Start practice session
- `POST /api/dojos/:id/submit-answer` - Submit quiz answer

### Concept Academy
- `POST /api/explainers/create-lesson` - Create explainer video
- `GET /api/explainers/user/:userId` - Get user videos
- `GET /api/explainers/video/:id` - Stream video content
- `DELETE /api/explainers/:id` - Delete video

### Course Recommendations
- `POST /api/recommend-courses` - Get course recommendations
- `GET /api/recommendation-history` - Get recommendation history
- `POST /api/save-recommendation` - Save recommendation
- `GET /api/courses/trending` - Get trending courses

### Advanced Features
- `POST /api/pyq-analysis` - Upload PYQ for analysis
- `POST /api/translate-notes` - Translate documents
- `POST /api/generate-study-plan` - Create personalized study plan
- `GET /api/analytics/progress` - Get learning analytics

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
npm run build
vercel --prod

# Set environment variables in Vercel dashboard
```

### Backend (Render)
```bash
# Deploy to Render
git push origin main

# Configure environment variables in Render dashboard
```

### Environment Configuration
- **Frontend**: Set `VITE_BACKEND_URL` to your deployed backend URL
- **Backend**: Set `CORS_ORIGIN` to your deployed frontend URL
- **Supabase**: Configure redirect URLs for production domain

---

## 📊 Analytics & Monitoring

- **User Engagement**: Track learning session duration and frequency
- **Content Performance**: Monitor quiz accuracy and video completion rates
- **AI Model Metrics**: Evaluate response quality and user satisfaction
- **System Performance**: Monitor API response times and error rates

---

## 🏆 What Makes This Hackathon-Worthy

### 🎯 Innovation
- **CRAG Implementation**: Cutting-edge Corrective RAG for accurate study plans
- **Multimodal AI**: Seamlessly combines text, audio, and visual learning
- **Adaptive Learning**: AI that evolves with user progress

### 🔧 Technical Excellence
- **Scalable Architecture**: Microservices-ready backend design
- **Real-time Processing**: Efficient PDF parsing and content generation
- **Modern Frontend**: Responsive design with smooth animations

### 🌍 Social Impact
- **Accessibility**: Breaking language barriers with AI translation
- **Personalization**: Adapting to individual learning styles
- **Career Guidance**: Connecting learning to real-world opportunities

### 📈 Market Potential
- **8+ AI-Powered Features** in a single platform
- **Comprehensive Learning Ecosystem** from content creation to career guidance
- **Scalable Business Model** with freemium and enterprise tiers

---

## 👥 The Dojo Masters

<table>
<tr>
<td align="center">
<img src="https://github.com/animish-agrahari.png" width="100px;" alt="Animish"/>
<br />
<b>Animish Agrahari</b>
<br />
<sub>Full Stack Developer</sub>
<br />
<i>"Pixel pusher by day, bug hunter by night."</i>
</td>
<td align="center">
<img src="https://github.com/dhairya-luthra.png" width="100px;" alt="Dhairya"/>
<br />
<b>Dhairya Luthra</b>
<br />
<sub>Full Stack Developer</sub>
<br />
<i>"Made this app during a caffeine high."</i>
</td>
<td align="center">
<img src="https://github.com/aariv-walia.png" width="100px;" alt="Aariv"/>
<br />
<b>Aariv Walia</b>
<br />
<sub>Full Stack Developer</sub>
<br />
<i>"The Ctrl+C, Ctrl+V wizard."</i>
</td>
<td align="center">
<img src="https://github.com/shreejeet-mishra.png" width="100px;" alt="Shreejeet"/>
<br />
<b>Shreejeet Mishra</b>
<br />
<sub>Full Stack Developer</sub>
<br />
<i>"Thinks in binary, dreams in color."</i>
</td>
</tr>
</table>

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **Google** for Gemini AI
- **Supabase** for backend infrastructure
- **Vercel** for frontend hosting
- **upGrad** for course data partnership

---

<div align="center">

## 🥋 Ready to Transform Your Learning Journey? 🥋

[![Start Learning](https://img.shields.io/badge/🚀_Start_Learning-Visit_Sensei_AI-FF6B6B?style=for-the-badge)](https://sensei-ai-phi.vercel.app)

*Ancient Wisdom, Modern Learning*

</div>
