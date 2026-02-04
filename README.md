# 🎥 Crowd Management System

> Real-time crowd detection and monitoring system powered by AI, built with Next.js and YOLO computer vision

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-green?style=flat-square&logo=python)](https://www.python.org/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-purple?style=flat-square)](https://github.com/ultralytics/ultralytics)

## 🌟 Overview

The Crowd Management System is an intelligent real-time monitoring solution that uses computer vision to detect, track, and analyze crowd density in various environments. Perfect for event management, public safety, retail analytics, and smart city applications.

### ✨ Key Features

- 🔐 **Secure Authentication** - Powered by Clerk with email/password and social login
- 📊 **Real-Time Detection** - Live person detection using YOLOv8 object detection model
- 📱 **Mobile Camera Support** - Works with DroidCam to use your phone as a camera source
- 🎯 **Bounding Box Visualization** - Visual indicators for each detected person
- 📈 **Live Count Updates** - Real-time crowd count with confidence scores
- 🚀 **High Performance** - Optimized for low-latency processing
- 🎨 **Modern UI** - Beautiful, responsive interface built with Tailwind CSS
- 🔒 **Protected Routes** - Middleware-based authentication and authorization

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend API    │         │  Python CV      │
│   (Next.js)     │◄────────┤   (Next.js API)  │◄────────┤  (FastAPI)      │
│                 │  HTTP   │                  │  HTTP   │                 │
│  - Dashboard    │         │  - Auth Routes   │         │  - YOLO Model   │
│  - Auth Pages   │         │  - SSE Stream    │         │  - Frame Capture│
│  - Live View    │         │  - Proxy         │         │  - Detection    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
         │                                                         ▲
         │                                                         │
         └─────────────────────────────────────────────────────────┘
                            WebSocket/SSE Updates
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **Python** 3.8+ with pip
- **DroidCam** or any IP camera (optional, for live video)
- **Clerk Account** for authentication ([Sign up free](https://clerk.com))

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/amanmprojects/crowd-management-system.git
cd crowd-management-system
```

#### 2️⃣ Set Up the Frontend

```bash
# Install dependencies
npm install
# or
bun install

# Configure environment variables
cp .env.example .env.local
```

Edit `.env.local` with your Clerk credentials:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### 3️⃣ Set Up the Python Backend

```bash
cd python-server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 4️⃣ Configure Camera Source

Edit `python-server/main.py` to set your camera URL:

```python
# For DroidCam
DROIDCAM_URL = "http://YOUR_PHONE_IP:4747/video"

# For RTSP camera
DROIDCAM_URL = "rtsp://username:password@camera-ip:554/stream"

# For local webcam
DROIDCAM_URL = 0
```

### 🏃 Running the Application

#### Start the Python CV Server

```bash
cd python-server
uvicorn main:app --reload --port 8000
```

The server will be available at `http://localhost:8000`

#### Start the Next.js Frontend

In a new terminal:

```bash
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:3000`

#### Access the Dashboard

1. Navigate to `http://localhost:3000`
2. Sign up or sign in with your credentials
3. Access the protected dashboard at `http://localhost:3000/dashboard`
4. View live crowd detection and analytics

## 📁 Project Structure

```
crowd-management-system/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Protected dashboard pages
│   ├── sign-in/                 # Authentication pages
│   ├── sign-up/
│   ├── api/                     # API routes
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── components/                   # React components
├── lib/
│   └── types/                   # TypeScript type definitions
├── middleware.ts                # Route protection middleware
├── python-server/               # Computer vision backend
│   ├── main.py                  # FastAPI server
│   ├── requirements.txt         # Python dependencies
│   └── yolov8n.pt              # YOLO model weights
├── public/                      # Static assets
└── package.json                 # Node dependencies
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Authentication:** Clerk
- **Styling:** Tailwind CSS v4
- **UI:** React 18 with Server Components

### Backend
- **API Framework:** FastAPI (Python)
- **Computer Vision:** YOLOv8 (Ultralytics)
- **Image Processing:** OpenCV (cv2)
- **Model:** YOLOv8n (Nano - optimized for speed)

## 📡 API Endpoints

### Python CV Server (`http://localhost:8000`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/get-frame` | GET | Returns current frame with bounding boxes (base64 encoded) |
| `/detect` | GET | Returns only detection data (lightweight) |
| `/docs` | GET | FastAPI interactive documentation |

### Next.js API Routes

| Route | Description |
|-------|-------------|
| `/api/detection` | Proxy to Python CV server |
| `/api/stream` | Server-Sent Events for live updates |

## 🎯 Use Cases

- **Event Management:** Monitor crowd density at concerts, festivals, and sports events
- **Public Safety:** Track crowd flow in transportation hubs and public spaces
- **Retail Analytics:** Analyze foot traffic and customer behavior
- **Smart Cities:** Optimize urban planning and emergency response
- **Security:** Detect overcrowding and potential safety hazards

## 🔧 Configuration

### Camera Settings

Adjust detection parameters in `python-server/main.py`:

```python
# Model confidence threshold
model = YOLO("yolov8n.pt")
results = model(frame, conf=0.5)  # Adjust confidence (0.0 - 1.0)
```

### Frontend Settings

Configure polling intervals and UI behavior in your dashboard components.

## 📈 Future Enhancements

- [ ] Heat map visualization for crowd density
- [ ] Historical data analytics and trends
- [ ] Alert system for overcrowding thresholds
- [ ] Multi-camera support
- [ ] Zone-based detection
- [ ] People counting in/out
- [ ] Integration with external sensors
- [ ] Mobile app for notifications
- [ ] Export reports (PDF, CSV)
- [ ] Machine learning for crowd behavior analysis

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) for the object detection model
- [Clerk](https://clerk.com) for authentication infrastructure
- [Vercel](https://vercel.com) for Next.js framework
- [FastAPI](https://fastapi.tiangolo.com) for the Python backend framework

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/amanmprojects">@amanmprojects</a>
</div>