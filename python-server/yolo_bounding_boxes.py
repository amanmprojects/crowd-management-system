import os
import cv2
import numpy as np
from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import threading
import time
import base64
from ultralytics import YOLO
from pydantic import BaseModel
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

# DroidCam URL - adjust the IP and port to match your setup
DROIDCAM_URL = os.getenv("DROIDCAM_URL") + "/video"

# Global variable to store the latest frame
current_frame = None
frame_lock = threading.Lock()
reconnect_event = threading.Event()

# Load YOLO model
model = YOLO("yolov8n.pt")

# Load face detection cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def capture_loop():
    """Background thread to continuously capture frames from DroidCam"""
    global current_frame, DROIDCAM_URL
    
    while True:
        print(f"Connecting to DroidCam at {DROIDCAM_URL}...")
        cap = cv2.VideoCapture(DROIDCAM_URL)
        
        # Retry logic if initial connection fails
        if not cap.isOpened():
            print("Failed to open camera, retrying in 5s...")
            time.sleep(5)
            continue
            
        print("Connected to DroidCam!")
    
        while cap.isOpened():
            # Check for reconnection request
            if reconnect_event.is_set():
                print("Reconnection requested - closing current connection...")
                reconnect_event.clear()
                break

            ret, frame = cap.read()
            if ret:
                with frame_lock:
                    current_frame = frame
            else:
                print("Stream disconnected or frame read failed")
                break
            
            # Small sleep to prevent tight loop if needed, though read() blocks usually
            # time.sleep(0.001) 
        
        cap.release()
        time.sleep(1) # Wait a bit before reconnecting

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

class CameraConfig(BaseModel):
    url: str

@app.get("/config/camera")
def get_camera_config():
    """Get current camera configuration"""
    return {"url": DROIDCAM_URL}

@app.post("/config/camera")
def update_camera_config(config: CameraConfig):
    """Update camera URL and trigger reconnection"""
    global DROIDCAM_URL
    DROIDCAM_URL = config.url
    reconnect_event.set()
    return {"status": "updated", "url": DROIDCAM_URL}

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


# Define zones for coordinate mapping
ZONES = [
    {"id": "entry", "name": "Entry Gate", "x_range": (0, 20), "y_range": (40, 60)},
    {"id": "main", "name": "Main Plaza", "x_range": (20, 70), "y_range": (20, 70)},
    {"id": "stage", "name": "Stage Area", "x_range": (20, 70), "y_range": (0, 25)},
    {"id": "food", "name": "Food Court", "x_range": (70, 100), "y_range": (20, 55)},
    {"id": "exit", "name": "Exit Gate", "x_range": (70, 100), "y_range": (60, 90)},
    {"id": "parking", "name": "Parking", "x_range": (0, 30), "y_range": (70, 100)},
    {"id": "vip", "name": "VIP Area", "x_range": (70, 100), "y_range": (0, 25)},
]


def get_zone_for_position(x_percent, y_percent):
    """Determine which zone a position falls into"""
    for zone in ZONES:
        x_min, x_max = zone["x_range"]
        y_min, y_max = zone["y_range"]
        if x_min <= x_percent <= x_max and y_min <= y_percent <= y_max:
            return zone["name"]
    return "Main Plaza"  # Default zone


@app.get("/coordinates")
def coordinates():
    """Return lightweight coordinate data for low-bandwidth mode (no image data)"""
    with frame_lock:
        if current_frame is None:
            return JSONResponse(content={"error": "No frame available"}, status_code=503)
        
        frame = current_frame.copy()
    
    # Get frame dimensions for percentage calculations
    frame_height, frame_width = frame.shape[:2]
    
    # Run YOLO detection
    results = model(frame, verbose=False)
    
    # Extract person coordinates as percentages
    people = []
    person_id = 1
    for result in results:
        for box in result.boxes:
            if int(box.cls[0]) == 0:  # person class
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                # Calculate center point as percentage of frame
                center_x = ((x1 + x2) / 2) / frame_width * 100
                center_y = ((y1 + y2) / 2) / frame_height * 100
                
                # Determine zone
                zone = get_zone_for_position(center_x, center_y)
                
                people.append({
                    "id": person_id,
                    "x": round(center_x, 1),
                    "y": round(center_y, 1),
                    "zone": zone
                })
                person_id += 1
    
    # Calculate density
    frame_area = frame_height * frame_width
    max_capacity = frame_area / 10000
    density_percentage = min(100, int((len(people) / max_capacity) * 100)) if max_capacity > 0 else 0
    
    return JSONResponse(content={
        "timestamp": int(time.time() * 1000),  # milliseconds
        "people": people,
        "count": len(people),
        "density": density_percentage
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


def blur_faces(frame):
    """Apply blur to detected faces in the frame"""
    try:
        if face_cascade is None or face_cascade.empty():
            return frame, 0
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        for (x, y, w, h) in faces:
            # Ensure coordinates are within frame bounds
            x = max(0, x)
            y = max(0, y)
            w = min(w, frame.shape[1] - x)
            h = min(h, frame.shape[0] - y)
            
            if w > 0 and h > 0:
                # Extract face region
                face_region = frame[y:y+h, x:x+w]
                if face_region.size > 0:
                    # Apply strong Gaussian blur
                    blur_size = min(99, max(21, (w // 2) * 2 + 1))  # Ensure odd number
                    blurred_face = cv2.GaussianBlur(face_region, (blur_size, blur_size), 30)
                    # Replace face region with blurred version
                    frame[y:y+h, x:x+w] = blurred_face
        
        return frame, len(faces)
    except Exception as e:
        print(f"Error in blur_faces: {e}")
        return frame, 0


def blur_upper_body(frame, bounding_boxes):
    """Blur upper portion of detected person bounding boxes (head/face area)"""
    try:
        faces_blurred = 0
        frame_height, frame_width = frame.shape[:2]
        
        for box in bounding_boxes:
            x1, y1, x2, y2 = box['x1'], box['y1'], box['x2'], box['y2']
            # Calculate upper 30% of bounding box (head region)
            head_height = int((y2 - y1) * 0.3)
            head_y2 = y1 + head_height
            
            # Ensure coordinates are within frame bounds
            x1 = max(0, min(x1, frame_width - 1))
            y1 = max(0, min(y1, frame_height - 1))
            x2 = max(0, min(x2, frame_width))
            head_y2 = max(0, min(head_y2, frame_height))
            
            width = x2 - x1
            height = head_y2 - y1
            
            if height > 0 and width > 0:
                # Extract head region
                head_region = frame[y1:head_y2, x1:x2]
                if head_region.size > 0:
                    # Apply pixelation effect (resize down then up)
                    try:
                        small = cv2.resize(head_region, (max(1, 8), max(1, 8)), interpolation=cv2.INTER_LINEAR)
                        pixelated = cv2.resize(small, (width, height), interpolation=cv2.INTER_NEAREST)
                        frame[y1:head_y2, x1:x2] = pixelated
                        faces_blurred += 1
                    except Exception as resize_error:
                        print(f"Resize error: {resize_error}")
        
        return frame, faces_blurred
    except Exception as e:
        print(f"Error in blur_upper_body: {e}")
        return frame, 0


@app.get("/stream-with-privacy")
def stream_with_privacy():
    """Return MJPEG video stream with privacy masking (face blur) and bounding boxes"""
    return StreamingResponse(
        generate_stream_with_privacy(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


def generate_stream_with_privacy():
    """Generator function for MJPEG streaming with privacy masking"""
    while True:
        try:
            with frame_lock:
                if current_frame is None:
                    time.sleep(0.1)
                    continue
                frame = current_frame.copy()

            # Run YOLO detection
            results = model(frame, verbose=False)
            
            # Extract person detections
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
            
            # Apply privacy masking - blur upper body/head region of each detected person
            frame, faces_blurred = blur_upper_body(frame, bounding_boxes)
            
            # Also try to detect and blur any faces that YOLO might have missed
            frame, additional_faces = blur_faces(frame)
            
            # Draw bounding boxes
            for box in bounding_boxes:
                x1, y1, x2, y2 = box['x1'], box['y1'], box['x2'], box['y2']
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

            # Put text on the frame
            cv2.putText(frame, f"Persons: {len(bounding_boxes)}", (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.putText(frame, "PRIVACY MODE", (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2)

            # Encode frame as JPEG
            _, jpeg = cv2.imencode('.jpg', frame)

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')
            time.sleep(0.033)  # ~30 fps
        except Exception as e:
            print(f"Error in privacy stream: {e}")
            time.sleep(0.1)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)