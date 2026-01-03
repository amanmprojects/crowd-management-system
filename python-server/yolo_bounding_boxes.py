import os
import cv2
from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import threading
import time
import base64
from ultralytics import YOLO
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

# DroidCam URL - adjust the IP and port to match your setup
DROIDCAM_URL = os.getenv("DROIDCAM_URL") + "/video"

# Global variable to store the latest frame
current_frame = None
frame_lock = threading.Lock()

# Load YOLO model
model = YOLO("yolov8n.pt")

def capture_loop():
    """Background thread to continuously capture frames from DroidCam"""
    global current_frame
    print(f"Connecting to DroidCam at {DROIDCAM_URL}...")
    cap = cv2.VideoCapture(DROIDCAM_URL)
    
    # Retry every 5 seconds until connection is established
    for i in range(3):
        if cap.isOpened():
            print("Connected to DroidCam!")
            break
        time.sleep(5)
        cap = cv2.VideoCapture(DROIDCAM_URL)
    
    while True:
        ret, frame = cap.read()
        if ret:
            with frame_lock:
                current_frame = frame
        else:
            time.sleep(0.1)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start the capture thread when the server starts"""
    thread = threading.Thread(target=capture_loop, daemon=True)
    thread.start()
    yield

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get-frame")
def get_frame():
    """Return the current frame as base64 encoded image"""
    with frame_lock:
        if current_frame is None:
            return JSONResponse(content={"error": "No frame available"}, status_code=503)
        
        frame = current_frame.copy()
    
    # Encode frame as base64 JPEG
    _, jpeg = cv2.imencode('.jpg', frame)
    image_base64 = base64.b64encode(jpeg.tobytes()).decode('utf-8')
    
    # Just return the image base64
    return JSONResponse(content={
        "image": image_base64
    })


@app.get("/get-image-with-boxes")
def get_image_with_boxes():
    """Return image with bounding box superimposed"""
    with frame_lock:
        if current_frame is None:
            return JSONResponse(content={"error": "No frame available"}, status_code=503)
        
        frame = current_frame.copy()
        
    # Run YOLO detection
    results = model(frame, verbose=False)
    
    # Extract person detections (class 0 is 'person' in COCO)
    bounding_boxes = []
    for result in results:
        for box in result.boxes:
            if int(box.cls[0]) == 0:  # person class
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                bounding_boxes.append({
                    "x1": int(x1),
                    "y1": int(y1),
                    "x2": int(x2),
                    "y2": int(y2),
                    "confidence": round(confidence, 3)
                })
    # Superimpose bounding boxes on the frame
    for box in bounding_boxes:
        x1, y1, x2, y2 = box['x1'], box['y1'], box['x2'], box['y2']
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

    # Encode frame as base64 JPEG
    _, jpeg = cv2.imencode('.jpg', frame)
    image_base64 = base64.b64encode(jpeg.tobytes()).decode('utf-8')

    return JSONResponse(content={
        "image": image_base64,
        "persons": bounding_boxes,
        "person_count": len(bounding_boxes)
    })

@app.get("/detect")
def detect():
    """Return only bounding boxes without the image (lightweight endpoint for polling)"""
    with frame_lock:
        if current_frame is None:
            return JSONResponse(content={"error": "No frame available"}, status_code=503)
        
        frame = current_frame.copy()
    
    # Run YOLO detection
    results = model(frame, verbose=False)
    
    # Extract person detections (class 0 is 'person' in COCO)
    bounding_boxes = []
    for result in results:
        for box in result.boxes:
            if int(box.cls[0]) == 0:  # person class
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                bounding_boxes.append({
                    "x1": int(x1),
                    "y1": int(y1),
                    "x2": int(x2),
                    "y2": int(y2),
                    "confidence": round(confidence, 3)
                })
    
    return JSONResponse(content={
        "persons": bounding_boxes,
        "person_count": len(bounding_boxes)
    })

@app.get("/analytics")
def analytics():
    """Return analytics data including people count and density"""
    with frame_lock:
        if current_frame is None:
            return JSONResponse(content={"error": "No frame available"}, status_code=503)
        
        frame = current_frame.copy()
    
    # Run YOLO detection
    results = model(frame, verbose=False)
    
    # Extract person detections (class 0 is 'person' in COCO)
    person_count = 0
    for result in results:
        for box in result.boxes:
            if int(box.cls[0]) == 0:  # person class
                person_count += 1
    
    # Calculate density based on frame area and person count
    # Frame area in pixels
    frame_height, frame_width = frame.shape[:2]
    frame_area = frame_height * frame_width
    
    # Assume each person needs ~10000 pixels of space for comfortable density
    # Max capacity = frame_area / 10000
    max_capacity = frame_area / 10000
    density_percentage = min(100, int((person_count / max_capacity) * 100)) if max_capacity > 0 else 0
    
    return JSONResponse(content={
        "people_count": person_count,
        "density": density_percentage,
        "timestamp": time.time()
    })


def generate_stream():
    """Generator function for MJPEG streaming"""
    while True:
        with frame_lock:
            if current_frame is None:
                time.sleep(0.1)
                continue
            frame = current_frame.copy()
        
        _, jpeg = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')
        time.sleep(0.033)  # ~30 fps

@app.get("/stream")
def stream():
    """Return MJPEG video stream"""
    return StreamingResponse(
        generate_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

# Stream with bounding boxes
@app.get("/stream-with-boxes")
def stream_with_boxes():
    """Return MJPEG video stream with bounding boxes"""
    return StreamingResponse(
        generate_stream_with_boxes(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

def generate_stream_with_boxes():
    """Generator function for MJPEG streaming with bounding boxes"""
    while True:
        with frame_lock:
            if current_frame is None:
                time.sleep(0.1)
                continue
            frame = current_frame.copy()

        # Run YOLO detection
        results = model(frame, verbose=False)
        
        # Extract person detections (class 0 is 'person' in COCO)
        bounding_boxes = []
        for result in results:
            for box in result.boxes:
                if int(box.cls[0]) == 0:  # person class
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    confidence = float(box.conf[0])
                    bounding_boxes.append({
                        "x1": int(x1),
                        "y1": int(y1),
                        "x2": int(x2),
                        "y2": int(y2),
                        "confidence": round(confidence, 3)
                    })
        # Superimpose bounding boxes on the frame
        for box in bounding_boxes:
            x1, y1, x2, y2 = box['x1'], box['y1'], box['x2'], box['y2']
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        # Encode frame as base64 JPEG
        # Put text on the frame 
        cv2.putText(frame, f"Persons: {len(bounding_boxes)}", (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # Encode frame as base64 JPEG
        _, jpeg = cv2.imencode('.jpg', frame)

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')
        time.sleep(0.033)  # ~30 fps


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

