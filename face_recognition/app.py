import time
from flask import Flask, request, jsonify
from deepface import DeepFace
import cloudinary
import cloudinary.api
import os
from urllib.parse import urlparse
import logging
from dotenv import load_dotenv
from PIL import Image
import io
import base64
import requests
from flask_cors import CORS
import cv2
import numpy as np
import mediapipe as mp
from io import BytesIO
import logging
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
from flask import jsonify

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

# Image resizer
def resize_image_base64(image_base64):
    img_data = base64.b64decode(image_base64.split(',')[1])
    img = Image.open(io.BytesIO(img_data)).convert("RGB")
    img = img.resize((224, 224))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    encoded_img = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded_img}"

# Blurry detection using Laplacian variance
def is_image_blurry(image_base64, threshold=100):
    try:
        img_data = base64.b64decode(image_base64.split(',')[1])
        np_img = np.frombuffer(img_data, np.uint8)
        image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        return variance < threshold
    except Exception as e:
        logger.error(f"Blurry check failed: {str(e)}")
        return True
    
def process_image(image_content, image_type):
    """Helper function to process an image and detect faces"""
    try:
        img_pil = Image.open(BytesIO(image_content)).convert("RGB")
        img_array = np.array(img_pil)
        faces = DeepFace.extract_faces(
            img_path=img_array,
            detector_backend="retinaface",
            enforce_detection=False,
            align=True
        )
        return faces
    except Exception as e:
        logger.error(f"Failed to process {image_type} image: {str(e)}")
        raise


# Basic liveness check using facial landmarks
def is_liveness_passed(image_base64):
    try:
        img_data = base64.b64decode(image_base64.split(',')[1])
        np_img = np.frombuffer(img_data, np.uint8)
        image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        mp_face_mesh = mp.solutions.face_mesh
        with mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1) as face_mesh:
            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb)

            if not results.multi_face_landmarks:
                return False

            face_landmarks = results.multi_face_landmarks[0]
            landmarks = [(int(pt.x * image.shape[1]), int(pt.y * image.shape[0])) for pt in face_landmarks.landmark]

            # Blink check using basic eye aspect ratio (can be refined)
            def eye_aspect_ratio(eye_indices):
                p1 = landmarks[eye_indices[1]]
                p2 = landmarks[eye_indices[2]]
                return abs(p1[1] - p2[1])

            left_eye = [33, 160, 158]
            right_eye = [362, 385, 387]
            left_ear = eye_aspect_ratio(left_eye)
            right_ear = eye_aspect_ratio(right_eye)

            if left_ear > 5 and right_ear > 5:
                return False  # Eyes not blinking

            # Basic head turn: difference in x-coordinates of cheeks
            left_cheek_x = landmarks[234][0]
            right_cheek_x = landmarks[454][0]
            nose_x = landmarks[1][0]

            if abs(nose_x - left_cheek_x) < 30 and abs(nose_x - right_cheek_x) < 30:
                return False  # Not turning head enough

            return True

    except Exception as e:
        logger.error(f"Liveness check failed: {str(e)}")
        return False
    

@app.route('/check-face-duplicate', methods=['POST'])
def check_face_duplicate():
    try:
        data = request.json
        if 'image' not in data:
            return jsonify({"exists": False, "message": "Image not provided"}), 400

        image_base64 = data['image']
        image_resized = resize_image_base64(image_base64)

        # Get embedding
        embedding_obj = DeepFace.represent(img_path=image_resized, model_name='Facenet')[0]
        embedding = embedding_obj['embedding']

        # Send to Node.js to check if similar embedding exists
        node_response = requests.post("http://localhost:5000/api/face/check-face", json={
            "embedding": embedding
        })

        result = node_response.json()
        if result.get("exists", False):
            return jsonify({
                "exists": True,
                "message": result.get("message", "Face already registered"),
            })
        else:
            return jsonify({
                "exists": False,
                "embedding": embedding,  # ⬅️ Return this only when it's unique
                "message": "Unique face. Proceed with registration.",
            })

    except Exception as e:
        logger.error(f"Face duplication check failed: {str(e)}")
        return jsonify({"exists": False, "message": "Error during face verification"}), 500

@app.route('/compare-faces', methods=['POST'])
def compare_faces():
    try:
        data = request.json

        # Detect-only mode for registration (check for one clear face)
        if data.get('detectOnly') and 'image' in data and 'prompt' in data:
            try:
                image_resized = resize_image_base64(data['image'])

                # Check for multiple faces
                faces = DeepFace.extract_faces(img_path=image_resized, enforce_detection=False)
                if len(faces) == 0:
                    return jsonify({
                        "faceDetected": False,
                        "message": "No face detected. Please retake the image.",
                        "success": True
                    })
                elif len(faces) > 1:
                    return jsonify({
                        "faceDetected": False,
                        "message": "Multiple faces detected. Please ensure only your face is visible.",
                        "success": True
                    })

                if is_image_blurry(image_resized):
                    return jsonify({
                        "faceDetected": False,
                        "message": "Image is too blurry. Please retake a clear image.",
                        "success": True
                    })

                if not is_liveness_passed(image_resized):
                    return jsonify({
                        "faceDetected": False,
                        "message": "Liveness check failed. Please blink and turn your head.",
                        "success": True
                    })

                DeepFace.analyze(img_path=image_resized, actions=['age'], enforce_detection=True)
                return jsonify({
                    "faceDetected": True,
                    "message": "Face and liveness verified successfully.",
                    "success": True
                })
            except Exception as e:
                logger.warning(f"Face detection failed: {str(e)}")
                return jsonify({
                    "faceDetected": False,
                    "message": "Error during face analysis. Please retake the image.",
                    "success": True
                })

        # Validation for face comparison
        if not data.get('detectOnly') and 'image' in data and 'prompt' in data:
            try:
                image_resized = resize_image_base64(data['image'])
                if not is_liveness_passed(image_resized):
                    return jsonify({
                        "faceDetected": False,
                        "message": "Liveness check failed. Please blink and turn your head.",
                        "success": True
                    })
                DeepFace.analyze(img_path=image_resized, actions=['age'], enforce_detection=True)
                return jsonify({
                    "faceDetected": True,
                    "message": "Face and liveness verified successfully.",
                    "success": True
                })
            except Exception as e:
                logger.warning(f"Face detection failed: {str(e)}")
                return jsonify({
                    "faceDetected": False,
                    "message": "Error during face analysis. Please retake the image.",
                    "success": True
                })




        # Validate input parameters
        if not data or ('image1' not in data or 'image2' not in data):
            logger.error("Missing required parameters")
            return jsonify({
                "error": "Both image1 (URL) and image2 (base64) are required",
                "success": False
            }), 400

        # Step 2: Download registered image from Cloudinary
        try:
            cloudinary_response = requests.get(data['image1'], timeout=10)
            cloudinary_response.raise_for_status()
        except Exception as e:
            logger.error(f"Failed to download image1 from Cloudinary: {str(e)}")
            return jsonify({
                "error": "Failed to fetch registered face image.",
                "technicalDetails": str(e),
                "success": False
            }), 400

        # Step 3: Process registered image
        try:
            img1_pil = Image.open(BytesIO(cloudinary_response.content)).convert("RGB")
            img1_array = np.array(img1_pil)

            img1_faces = DeepFace.extract_faces(img_path=img1_array, enforce_detection=False)
            if len(img1_faces) == 0:
                logger.error("No face found in registered image (img1)")
                return jsonify({
                    "error": "No face detected in the registered image. Please re-register with a clearer face.",
                    "success": False
                }), 400
        except Exception as e:
            logger.error(f"Failed to process image1: {str(e)}")
            return jsonify({
                "error": "Could not process the registered face image.",
                "technicalDetails": str(e),
                "success": False
            }), 400

        # Step 4: Process captured image (image2)
        start_time = time.time()
        image2_resized = resize_image_base64(data['image2'])

        faces = DeepFace.extract_faces(img_path=image2_resized, enforce_detection=False)
        if len(faces) == 0:
            return jsonify({
                "error": "No face detected in the image. Please try again with a clear photo.",
                "success": False
            }), 400
        elif len(faces) > 1:
            return jsonify({
                "error": "Multiple faces detected. Please capture a photo with only your face.",
                "success": False
            }), 400

        if is_image_blurry(image2_resized):
            return jsonify({
                "error": "The captured image is too blurry. Please try again with a clearer image.",
                "success": False
            }), 400

        # Step 5: Face Verification
        try:
            result = DeepFace.verify(
                img1_path=data['image1'],
                img2_path=image2_resized,
                model_name="Facenet",
                detector_backend="opencv",
                enforce_detection=True,
                align=True
            )
        except ValueError as ve:
            logger.error(f"No face detected: {str(ve)}")
            return jsonify({
                "error": "No face detected in one or both images. Please try with clear face images.",
                "success": False
            }), 400
        except Exception as e:
            logger.error(f"Face verification failed: {str(e)}")
            return jsonify({
                "error": "Face verification failed. Please ensure both images are clear and have visible faces.",
                "technicalDetails": str(e),
                "success": False
            }), 500

        processing_time = time.time() - start_time
        logger.info(f"Face verification took {processing_time:.2f} seconds")

        confidence = 1 - result['distance']
        verified = result.get("verified", False)

        logger.info(f"Face verification result: {verified}, Confidence: {confidence:.2f}")

        if not verified:
            return jsonify({
                "verified": False,
                "message": "Faces do not match. Please try again.",
                "confidence": float(confidence),
                "threshold": float(result['threshold']),
                "model": "Facenet",
                "success": True
            })

        return jsonify({
            "verified": True,
            "message": "Faces matched successfully!",
            "confidence": float(confidence),
            "threshold": float(result['threshold']),
            "model": "Facenet",
            "success": True
        })

    except Exception as e:
        logger.error(f"Unexpected server error: {str(e)}")
        return jsonify({
            "error": "An unexpected error occurred. Please try again later.",
            "technicalDetails": str(e),
            "success": False
        }), 500

if __name__ == '__main__':
    required_env_vars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        exit(1)

    app.run(host='0.0.0.0', port=5001, debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true')
