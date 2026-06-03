# Deepfake Detection Platform

## Overview

Deepfake Detection Platform is a full-stack AI application designed to identify manipulated videos using deep learning techniques. Users can upload videos through a web interface, and the system analyzes extracted frames to determine whether the content is authentic or deepfake.

---

## Features

* Video Upload Interface
* Frame Extraction
* Face Detection
* Deepfake Prediction
* Confidence Score Generation
* FastAPI Backend
* Modern Frontend Interface

---

## Tech Stack

### Frontend

* React
* TypeScript
* Framer Motion

### Backend

* FastAPI
* Python
* TensorFlow
* PyTorch
* OpenCV
* FaceNet

---

## Project Structure

Deepfake_App/

├── frontend/

├── backend/

├── README.md

└── .gitignore

---

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Future Enhancements

* User Authentication
* Scan History Dashboard
* Cloud Storage Integration

---

## Author

Developed as a Deepfake Detection and AI Security project.
