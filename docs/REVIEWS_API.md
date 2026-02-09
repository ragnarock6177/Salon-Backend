# Salon Reviews API Documentation

## Overview
The Salon Reviews API provides comprehensive functionality for managing customer reviews of salons, including creating, updating, deleting reviews, likes, reports, owner responses, and admin moderation.

## Base URLs
- **Public Review Routes**: `/api/reviews`
- **Admin Review Routes**: `/api/admin/reviews`

---

## Public Endpoints (No Auth Required)

### Get Reviews by Salon
`GET /api/reviews/salon/:salonId`

Fetch paginated reviews for a specific salon.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| sortBy | string | 'created_at' | Sort field: 'created_at', 'rating', 'likes_count' |
| sortOrder | string | 'desc' | Sort order: 'asc' or 'desc' |
| status | string | 'approved' | Filter by status |
| rating | number | null | Filter by specific rating (1-5) |

**Response:**
```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": {
    "reviews": [
      {
        "id": 1,
        "salon_id": 5,
        "user_id": 12,
        "rating": 5,
        "comment": "Great service! Highly recommend.",
        "title": "Amazing Experience",
        "status": "approved",
        "likes_count": 23,
        "is_verified_visit": true,
        "visit_date": "2026-02-01T10:00:00Z",
        "created_at": "2026-02-05T14:30:00Z",
        "updated_at": "2026-02-05T14:30:00Z",
        "user_name": "John Doe",
        "images": [
          { "id": 1, "image_url": "https://...", "display_order": 0 }
        ],
        "owner_response": {
          "id": 1,
          "response": "Thank you for your kind words!",
          "responder_name": "Salon Owner",
          "created_at": "2026-02-06T09:00:00Z"
        },
        "is_liked_by_user": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

---

### Get Review Statistics
`GET /api/reviews/salon/:salonId/stats`

Get aggregate review statistics for a salon.

**Response:**
```json
{
  "success": true,
  "message": "Review statistics fetched successfully",
  "data": {
    "salon_id": 5,
    "total_reviews": 120,
    "average_rating": "4.3",
    "verified_reviews": 85,
    "reviews_with_images": 32,
    "rating_distribution": {
      "five_star": { "count": 65, "percentage": "54.2" },
      "four_star": { "count": 30, "percentage": "25.0" },
      "three_star": { "count": 15, "percentage": "12.5" },
      "two_star": { "count": 7, "percentage": "5.8" },
      "one_star": { "count": 3, "percentage": "2.5" }
    },
    "recent_activity": {
      "last_30_days_reviews": 12,
      "last_30_days_average": "4.5"
    }
  }
}
```

---

### Get Review by ID
`GET /api/reviews/:id`

Fetch a single review with all details.

---

## Authenticated User Endpoints

All endpoints below require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Create Review
`POST /api/reviews`

Create a new review for a salon. Users can only review a salon once.

**Request Body:**
```json
{
  "salon_id": 5,
  "rating": 5,
  "comment": "Excellent service and friendly staff!",
  "title": "Best salon in town",
  "visit_date": "2026-02-01",
  "images": [
    "https://blob.storage.url/image1.jpg",
    "https://blob.storage.url/image2.jpg"
  ]
}
```

**Notes:**
- `rating` (required): 1-5 stars
- `salon_id` (required): ID of the salon being reviewed
- `comment`, `title`, `visit_date`, `images` are optional
- If user has redeemed a coupon at this salon, `is_verified_visit` will be `true`

---

### Update Review
`PUT /api/reviews/:id`

Update your own review.

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated comment",
  "title": "Updated title",
  "images": ["https://..."]
}
```

---

### Delete Review
`DELETE /api/reviews/:id`

Delete your own review. Admins can delete any review.

---

### Get My Reviews
`GET /api/reviews/user/me`

Get all reviews by the authenticated user.

**Query Parameters:**
| Parameter | Type | Default |
|-----------|------|---------|
| page | number | 1 |
| limit | number | 10 |

---

### Like/Unlike Review
`POST /api/reviews/:id/like`

Toggle like status for a review.

**Response:**
```json
{
  "success": true,
  "message": "Review liked",
  "data": {
    "liked": true,
    "likes_count": 24
  }
}
```

---

### Report Review
`POST /api/reviews/:id/report`

Report a review for moderation.

**Request Body:**
```json
{
  "reason": "inappropriate",
  "description": "This review contains offensive language"
}
```

**Valid Reasons:** `spam`, `inappropriate`, `fake`, `offensive`, `other`

---

## Owner Response Endpoints

### Add Response
`POST /api/reviews/:id/response`

Add owner response to a review (one per review).

**Request Body:**
```json
{
  "response": "Thank you for your feedback! We appreciate your business."
}
```

---

### Update Response
`PUT /api/reviews/:id/response`

Update your own response.

---

### Delete Response
`DELETE /api/reviews/:id/response`

Delete your own response. Admins can delete any response.

---

## Admin Endpoints

All admin endpoints require admin role in the JWT token.

### Get All Reviews
`GET /api/admin/reviews`

Get all reviews with filtering options.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by status: 'pending', 'approved', 'rejected', 'hidden' |
| salon_id | number | Filter by salon ID |
| user_id | number | Filter by user ID |
| sortBy | string | Sort field |
| sortOrder | string | 'asc' or 'desc' |

---

### Moderate Review
`PATCH /api/admin/reviews/:id/moderate`

Change review status.

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid Statuses:** `pending`, `approved`, `rejected`, `hidden`

---

### Get Reported Reviews
`GET /api/admin/reviews/reports`

Get all reported reviews pending moderation.

**Query Parameters:**
| Parameter | Type | Default |
|-----------|------|---------|
| status | string | 'pending' |
| page | number | 1 |
| limit | number | 20 |

---

### Handle Report
`PATCH /api/admin/reviews/reports/:reportId`

Mark a report as reviewed or dismissed.

**Request Body:**
```json
{
  "status": "reviewed"
}
```

**Valid Statuses:** `reviewed`, `dismissed`

---

### Delete Any Review
`DELETE /api/admin/reviews/:id`

Admin can delete any review.

---

## Database Schema

### salon_reviews
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| salon_id | INT | Foreign key to salons |
| user_id | INT | Foreign key to users |
| rating | INT | 1-5 stars |
| comment | TEXT | Review text |
| title | VARCHAR(200) | Review title |
| status | ENUM | pending, approved, rejected, hidden |
| likes_count | INT | Number of likes |
| is_verified_visit | BOOLEAN | User has verified coupon redemption |
| visit_date | TIMESTAMP | When user visited |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### review_images
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| review_id | INT | Foreign key to salon_reviews |
| image_url | TEXT | Image URL |
| display_order | INT | Order of display |

### review_likes
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| review_id | INT | Foreign key to salon_reviews |
| user_id | INT | Foreign key to users |
| created_at | TIMESTAMP | Like timestamp |

### review_reports
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| review_id | INT | Foreign key to salon_reviews |
| user_id | INT | Reporter user ID |
| reason | ENUM | Report reason |
| description | TEXT | Additional details |
| status | ENUM | pending, reviewed, dismissed |
| reviewed_by | INT | Admin who reviewed |
| reviewed_at | TIMESTAMP | Review timestamp |

### review_responses
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| review_id | INT | Foreign key (unique) |
| responder_id | INT | Owner user ID |
| response | TEXT | Response text |

---

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

**Common Error Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
