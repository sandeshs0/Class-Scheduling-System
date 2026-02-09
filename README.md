# Class Scheduling System

An application for managing class schedules with support for recurring events (daily, weekly, monthly and custom).

## Project Setup

## Environment Configuration

Create a `.env` file in the `backend` directory:

```env
PORT=
MONGO_URI=
REDIS_URI=
NODE_ENV= Development
```

## Running the Application

### Backend
From the `backend` directory:
```bash
npm run dev
```
Server runs on `http://localhost:5000`.

### Frontend
From the `frontend/class-scheduler` directory:
```bash
npm run dev
```
Application runs on `http://localhost:5173`.

## API Documentation

### Classes

- **GET /api/classes**: List all classes (paginated).
- **POST /api/classes**: Create a new class.
  - Body:
    ```json
    {
      "title": "Math 101",
      "instructor": "instructor_id",
      "roomType": "room_id",
      "isRecurring": true,
      "recurrence": {
        "type": "weekly",
        "weekDays": [1, 3], // Monday and Wednesday
        "timeSlots": [{ "startTime": "09:00", "endTime": "10:30" }],
        "startDate": "2024-01-01",
        "occurrences": 10
      }
    }
    ```
- **PUT /api/classes/:id**: Update class details.
- **DELETE /api/classes/:id**: Soft delete class and future instances.

### Calendar

- **GET /api/classes/calendar**: Get all class instances within a date range.
  - Query content: `?startDate=2024-01-01&endDate=2024-01-31`

### Resources

- **GET /api/instructors**: List instructors.
- **GET /api/room-types**: List room types.

## System Design and Scheduling Logic

### Architecture
- **Backend**: Express.js with MongoDB (Mongoose) and Redis for Caching
- **Frontend**: React (Vite) with TypeScript and Tailwind CSS.

### Scheduling Logic
1. **Class Definition**: A Class model defines the template (Title, Instructor, Recurrence Rule).
2. **Instance Generation**: Upon creation, the recurrenceService generates concrete ClassInstance documents for the specified duration/occurrences.
   - **Daily**: Generates an instance for every day in range.
   - **Weekly**: Checks weekDays array (0=Sun, 6=Sat) against RecurrencePattern.
   - **Monthly**: Checks monthDays array (1-31).
   - **Custom**: Logic creates instances based on "Every N Weeks".

3. **Looping Strategy**: Iterates through dates from startDate to endDate (or max occurrences). For each valid date, iterates through timeSlots to create instances.

4.  **Optimized Data Retrieval**:
    -   MongoDB Aggregation Pipelines ($lookup) are used to efficiently join ClassInstance documents with Instructor and RoomType collections.
    -   Prevents the "N+1 query problem" and ensures fast response times even when fetching thousands of schedule items for the calendar view.