import cv2
import math
import threading
import time
import requests
import numpy as np
from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from ultralytics.models import YOLO
from fastapi.responses import HTMLResponse

app = FastAPI()

# --- GLOBAL VARIABLES ---
# We use these to share data between the video loop and the API
current_crowd_count = 0
lock = threading.Lock()

# Load Model once at startup
print("Loading YOLOv8 model...")
model = YOLO('yolov8n.pt')

def generate_frames():
    global current_crowd_count

    # 1. Use DroidCam Image URL
    url = "http://192.168.68.172:4747/cam/1/frame.jpg"

    # LOWER Confidence slightly for phone cameras (sometimes lighting is worse)
    PERSON_CLASS_ID = 0
    CONF_THRESHOLD = 0.3  # Changed from 0.4 to 0.3

    while True:
        try:
            # Fetch the image (1 frame per second)
            response = requests.get(url, timeout=5)
            if response.status_code != 200:
                print(f"Failed to fetch frame: {response.status_code}")
                time.sleep(1)
                continue

            # Convert bytes to numpy array and decode
            img_array = np.array(bytearray(response.content), dtype=np.uint8)
            img = cv2.imdecode(img_array, -1)

            if img is None:
                print("Failed to decode image")
                time.sleep(1)
                continue
            
        except Exception as e:
            print(f"Error connecting to camera: {e}")
            time.sleep(1)
            continue

        # --- FIX IS HERE: MANUALLY RESIZE ---
        # Force the image to be 640x480.
        # This makes it fast AND makes the bounding boxes visible.
        img = cv2.resize(img, (640, 480))
        # ------------------------------------

        results = model(img, stream=True, verbose=False)

        frame_person_count = 0

        for r in results:
            boxes = r.boxes
            for box in boxes:
                cls = int(box.cls[0])
                conf = math.ceil((box.conf[0] * 100)) / 100

                if cls == PERSON_CLASS_ID and conf > CONF_THRESHOLD:
                    frame_person_count += 1

                    # Debug Print: Check your terminal to see if it detects "invisible" people
                    # print(f"Detected person with confidence: {conf}")

                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 2)

                    # ... (rest of label drawing code) ...
                    label = f'Person {conf}'
                    t_size = cv2.getTextSize(label, 0, fontScale=0.5, thickness=1)[0]
                    c2 = x1 + t_size[0], y1 - t_size[1] - 3
                    if y1 - t_size[1] - 3 < 0:
                        c2 = x1 + t_size[0], y1 + t_size[1] + 10
                        text_pos = (x1, y1 + t_size[1] + 5)
                        cv2.rectangle(img, (x1, y1), c2, (0, 0, 255), -1)
                    else:
                        cv2.rectangle(img, (x1, y1), c2, (0, 0, 255), -1)
                        text_pos = (x1, y1 - 2)
                    cv2.putText(img, label, text_pos, 0, 0.5, [255, 255, 255], 1)

        with lock:
            current_crowd_count = frame_person_count

        # ... (rest of encoding code) ...
        ret, buffer = cv2.imencode('.jpg', img)
        frame = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        
        # Wait for 1 second to achieve 1 FPS
        time.sleep(1)

# --- API ENDPOINTS ---

@app.get("/")
def home():
    return {"message": "Crowd Detection API is running. Go to /video_feed to see the stream."}

@app.get("/video_feed")
def video_feed():
    """
    Stream video to browser.
    Usage in HTML: <img src="http://localhost:8000/video_feed" />
    """
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/view", response_class=HTMLResponse)
def video_viewer():
    return """
    <html>
        <head>
            <title>Crowd Detection Live</title>
            <style>
                body { font-family: sans-serif; text-align: center; background: #222; color: white; }
                h1 { margin-top: 20px; }
                #video-container { margin: 20px auto; border: 5px solid #444; display: inline-block; }
                #count-box { font-size: 24px; color: #0f0; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>Live Crowd Detection</h1>
            <div id="count-box">Current Count: <span id="count">0</span></div>
            <div id="video-container">
                <img src="/video_feed" width="640" />
            </div>

            <script>
                // This script updates the count every 1 second without reloading the page
                setInterval(async () => {
                    try {
                        const response = await fetch('/stats');
                        const data = await response.json();
                        document.getElementById('count').innerText = data.crowd_count;
                    } catch (e) {
                        console.error("Error fetching stats:", e);
                    }
                }, 1000);
            </script>
        </body>
    </html>
    """

@app.get("/stats")
def get_stats():
    """
    Return current crowd count as JSON.
    Your dashboard can poll this endpoint every second.
    """
    with lock:
        return {
            "crowd_count": current_crowd_count,
            "status": "active"
        }

if __name__ == "__main__":
    import uvicorn
    # Host 0.0.0.0 makes it accessible to other computers on your network
    uvicorn.run(app, host="0.0.0.0", port=8000)