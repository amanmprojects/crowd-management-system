// Gets the video stream from localhost:8000/stream-with-boxes and displays it in a box
'use client';


function VideoBox() {
    // Using MJPEG stream directly in img tag
    // Port 8000 is used by the python server, but get from env variables
    const streamUrl = process.env.PYTHON_SERVER_URL + '/stream-with-boxes';

    return (
        <div className="w-full max-w-4xl mx-auto border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-black aspect-video flex items-center justify-center">
            <img
                src={streamUrl}
                alt="Live Video Stream"
                className="w-full h-full object-contain"
            />
        </div>
    );
}

export default VideoBox;