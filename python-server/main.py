import cv2
from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse
import threading
import time
import base64
from ultralytics import YOLO

# DroidCam URL - adjust the IP and port to match your setup
DROIDCAM_URL = "http://192.168.68.158:4747/video"

app = FastAPI()

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
    
    if not cap.isOpened():
        print("Error: Could not connect to DroidCam")
        return
    
    print("Connected to DroidCam!")
    
    while True:
        ret, frame = cap.read()
        if ret:
            with frame_lock:
                current_frame = frame
        else:
            time.sleep(0.1)

@app.on_event("startup")
def startup_event():
    """Start the capture thread when the server starts"""
    thread = threading.Thread(target=capture_loop, daemon=True)
    thread.start()

@app.get("/get-frame")
def get_frame():
    """Return the current frame with person detection bounding boxes"""
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

