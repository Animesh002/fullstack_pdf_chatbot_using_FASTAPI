## Requirements

### Backend (Python)

- Python >= 3.9
- FastAPI
- Uvicorn (for serving the FastAPI app)
- PyMuPDF (for PDF text extraction)
- Haystack (for question answering)
- SQLAlchemy (for database interactions)

### Frontend (React)

- Node.js >= 14.x
- npm or yarn (for package management)

## Setup Instructions

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd app/
   ```
2. Install dependencies:

   ```bash
   pip install -r requirements.txt

   ```

3. Run the FastAPI application:

   ```bash
   uvicorn main:app --reload

   ```

4. Goto frontend directoy:
   ```bash
   cd /frontend/
   ```
5. Install node dependencies:
   npm install

6. run the react application for frontend:
   npm start

7. Open the browser and go to http://127.0.0.1:3000/
