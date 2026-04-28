# API Documentation

Base URL: `http://localhost:5000`

Mount path: `/api`

Authentication: protected endpoints require header
- `Authorization: Bearer <token>`

Response format:
- Success: JSON object or array
- Error: `{ message: string }`

---

## 1. Authentication

### 1.1 Register
- Method: `POST`
- URL: `/api/auth/register`
- Public
- Payload (JSON):
  - `name` (string, required)
  - `email` (string, required)
  - `password` (string, required)
  - `role` (string, required) - `buyer` or `admin`
  - `phone` (string, optional)
  - `address` (string, optional)
  - `kelas` (string, optional)
  - `jurusan` (string, optional)
- Success response: `201`
  ```json
  {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "buyer",
    "phone": "...",
    "kelas": "...",
    "jurusan": "...",
    "photo": null,
    "token": "..."
  }
  ```

### 1.2 Sign In
- Method: `POST`
- URL: `/api/auth/signin`
- Public
- Payload (JSON):
  - `email` (string, required)
  - `password` (string, required)
- Success response: `200`
  ```json
  {
    "_id": "...",
    "name": "...",
    "role": "buyer",
    "email": "...",
    "phone": "...",
    "kelas": "...",
    "jurusan": "...",
    "photo": "...",
    "token": "..."
  }
  ```

### 1.3 Reset Password
- Method: `POST`
- URL: `/api/auth/reset-password`
- Public
- Payload (JSON):
  - `email` (string, required)
  - `newPassword` (string, required)
- Success response: `200`
  ```json
  { "message": "Password berhasil direset" }
  ```

---

## 2. User Management

### 2.1 Get My Profile
- Method: `GET`
- URL: `/api/users/me`
- Auth: bearer token
- Success response: `200`
  ```json
  {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "buyer",
    "phone": "...",
    "address": "...",
    "kelas": "...",
    "jurusan": "...",
    "photo": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
  ```

### 2.2 Update My Profile
- Method: `PATCH`
- URL: `/api/users/me`
- Auth: bearer token
- Payload (JSON):
  - `name` (string, optional)
  - `phone` (string, optional)
  - `address` (string, optional)
  - `kelas` (string, optional)
  - `jurusan` (string, optional)
- Success response: updated user object

### 2.3 Update Profile Photo
- Method: `PATCH`
- URL: `/api/users/me/photo`
- Auth: bearer token
- Payload: `multipart/form-data`
  - `photo` (file, required)
- Success response: updated user object with `photo` URL

### 2.4 Update Password
- Method: `PATCH`
- URL: `/api/users/me/password`
- Auth: bearer token
- Payload (JSON):
  - `oldPassword` (string, required)
  - `newPassword` (string, required)
- Success response: `200`
  ```json
  { "message": "Password updated successfully" }
  ```

### 2.5 Get All Users (Admin)
- Method: `GET`
- URL: `/api/users`
- Auth: bearer token
- Role: `admin`
- Success response: `200` array of users

### 2.6 Get User By ID (Admin)
- Method: `GET`
- URL: `/api/users/:id`
- Auth: bearer token
- Role: `admin`
- Success response: `200` user object

### 2.7 Delete User (Admin)
- Method: `DELETE`
- URL: `/api/users/:id`
- Auth: bearer token
- Role: `admin`
- Success response: `200`
  ```json
  { "message": "User deleted successfully" }
  ```

---

## 3. Product Management

### 3.1 Get Products
- Method: `GET`
- URL: `/api/products`
- Public
- Query params:
  - `category` (string, optional)
  - `search` (string, optional)
- Success response: `200` array of products

### 3.2 Get Product Detail
- Method: `GET`
- URL: `/api/products/:id`
- Public
- Success response: `200` product object

### 3.3 Create Product (Admin)
- Method: `POST`
- URL: `/api/products`
- Auth: bearer token
- Role: `admin`
- Payload: `multipart/form-data`
  - `thumbnail` (file, required)
  - other fields as JSON form values:
    - `name` (string, required)
    - `description` (string, optional)
    - `price` (number, required)
    - `stock` (number, required)
    - `category` (string, optional)
    - `active` (boolean, optional)
- Success response: `201` created product object

### 3.4 Update Product (Admin)
- Method: `PATCH`
- URL: `/api/products/:id`
- Auth: bearer token
- Role: `admin`
- Payload: `multipart/form-data`
  - `thumbnail` (file, optional)
  - other fields as JSON form values: `name`, `description`, `price`, `stock`, `category`, `active`
- Success response: `200` updated product object

### 3.5 Delete Product (Admin)
- Method: `DELETE`
- URL: `/api/products/:id`
- Auth: bearer token
- Role: `admin`
- Success response: `200`
  ```json
  { "message": "Product deleted successfully" }
  ```

### 3.6 Get My Products (Admin)
- Method: `GET`
- URL: `/api/products/my/products`
- Auth: bearer token
- Role: `admin`
- Success response: `200` array of products created by the admin user

### 3.7 Toggle Product Status (Admin)
- Method: `PATCH`
- URL: `/api/products/:id/toggle`
- Auth: bearer token
- Role: `admin`
- Success response: `200` updated product object with flipped `active` state

---

## 4. Category Management

> All category routes are protected and require `admin` role.

### 4.1 Get Categories
- Method: `GET`
- URL: `/api/categories`
- Success response: `200` array of category objects

### 4.2 Get Category By ID
- Method: `GET`
- URL: `/api/categories/:id`
- Success response: `200` category object

### 4.3 Create Category
- Method: `POST`
- URL: `/api/categories`
- Payload (JSON):
  - `name` (string, required)
  - `icon` (string, optional)
  - `active` (boolean, optional)
  - `products` (array of product IDs, optional)
- Success response: `201` created category object

### 4.4 Update Category
- Method: `PATCH`
- URL: `/api/categories/:id`
- Payload (JSON):
  - `name` (string, optional)
  - `icon` (string, optional)
  - `active` (boolean, optional)
  - `products` (array of product IDs, optional)
- Success response: `200` updated category object

### 4.5 Delete Category
- Method: `DELETE`
- URL: `/api/categories/:id`
- Success response: `200`
  ```json
  { "message": "Category deleted" }
  ```

---

## 5. Transactions

### 5.1 Create Transaction (Buyer)
- Method: `POST`
- URL: `/api/transactions`
- Auth: bearer token
- Role: `buyer`
- Payload (JSON):
  - `payment_method` (string, optional, default `midtrans`)
  - `selected_product_ids` (array of product IDs, optional)
- Success response: `201`
  ```json
  {
    "message": "Transaction created",
    "transaction_id": "TRX-...",
    "token": "...",
    "payment_url": "...",
    "total_amount": 100000,
    "payment_method": "midtrans"
  }
  ```

### 5.2 Get My Transactions (Buyer)
- Method: `GET`
- URL: `/api/transactions/my`
- Auth: bearer token
- Role: `buyer`
- Success response: `200` array of transaction objects

### 5.3 Get My Transaction By ID (Buyer)
- Method: `GET`
- URL: `/api/transactions/my/:id`
- Auth: bearer token
- Role: `buyer`
- Success response: `200` transaction object

### 5.4 Cancel Transaction (Buyer)
- Method: `PATCH`
- URL: `/api/transactions/my/:id/cancel`
- Auth: bearer token
- Role: `buyer`
- Success response: `200`
  ```json
  { "message": "Pesanan berhasil dibatalkan" }
  ```

### 5.5 Get All Transactions (Admin)
- Method: `GET`
- URL: `/api/transactions`
- Auth: bearer token
- Role: `admin`
- Success response: `200` array of transaction objects

### 5.6 Update Transaction Status (Admin)
- Method: `PATCH`
- URL: `/api/transactions/:id/status`
- Auth: bearer token
- Role: `admin`
- Payload (JSON):
  - `status` (string, required) - one of `pending`, `paid`, `failed`, `expired`
- Success response: `200` updated transaction object

---

## 6. Cart

> All cart routes require authentication.

### 6.1 Get Cart
- Method: `GET`
- URL: `/api/cart`
- Success response: `200`
  ```json
  { "items": [ ... ] }
  ```

### 6.2 Add To Cart
- Method: `POST`
- URL: `/api/cart`
- Payload (JSON):
  - `product_id` (string, required)
  - `quantity` (number, optional, default `1`)
- Success response: `200` updated cart object

### 6.3 Update Cart Item
- Method: `PATCH`
- URL: `/api/cart`
- Payload (JSON):
  - `product_id` (string, required)
  - `quantity` (number, required)
- Success response: `200` updated cart object

### 6.4 Remove Item From Cart
- Method: `DELETE`
- URL: `/api/cart/:product_id`
- Success response: `200`
  ```json
  { "message": "Item removed", "cart": { ... } }
  ```

### 6.5 Clear Cart
- Method: `DELETE`
- URL: `/api/cart`
- Success response: `200`
  ```json
  { "message": "Cart cleared" }
  ```

---

## 7. Favorites

> All favorite routes require `buyer` role.

### 7.1 Get Favorites
- Method: `GET`
- URL: `/api/favorites`
- Success response: `200` array of favorite objects

### 7.2 Toggle Favorite
- Method: `POST`
- URL: `/api/favorites`
- Payload (JSON):
  - `product_id` (string, required)
- Success response: `201` or `200`
  - Added:
    ```json
    { "message": "Added to favorites", "isFavorite": true }
    ```
  - Removed:
    ```json
    { "message": "Removed from favorites", "isFavorite": false }
    ```

### 7.3 Check Favorite
- Method: `GET`
- URL: `/api/favorites/check/:product_id`
- Success response: `200`
  ```json
  { "isFavorite": true }
  ```

---

## 8. Reviews

### 8.1 Get Product Reviews
- Method: `GET`
- URL: `/api/reviews/:product_id`
- Public
- Success response: `200` array of reviews

### 8.2 Create Review (Buyer)
- Method: `POST`
- URL: `/api/reviews`
- Auth: bearer token
- Role: `buyer`
- Payload (JSON):
  - `product_id` (string, required)
  - `rating` (number, required)
  - `comment` (string, optional)
- Success response: `201` created review object

### 8.3 Update Review (Buyer)
- Method: `PATCH`
- URL: `/api/reviews/:id`
- Auth: bearer token
- Role: `buyer`
- Payload (JSON):
  - `rating` (number, optional)
  - `comment` (string, optional)
- Success response: `200` updated review object

### 8.4 Delete Review (Buyer)
- Method: `DELETE`
- URL: `/api/reviews/:id`
- Auth: bearer token
- Role: `buyer`
- Success response: `200`
  ```json
  { "message": "Review deleted" }
  ```

### 8.5 Get All Reviews (Admin)
- Method: `GET`
- URL: `/api/admin/reviews`
- Auth: bearer token
- Role: `admin`
- Success response: `200` array of review objects

---

## 9. File Upload

### 9.1 Upload File
- Method: `POST`
- URL: `/api/files/upload`
- Payload: `multipart/form-data`
  - `file` (file, required)
- Success response: `201` file object
  ```json
  {
    "_id": "...",
    "name": "...",
    "url": "...",
    "cloudinaryId": "...",
    "createdAt": "..."
  }
  ```

---

## 10. Admin Dashboard

> All admin dashboard routes require `admin` role.

### 10.1 Dashboard Summary
- Method: `GET`
- URL: `/api/admin/dashboard`
- Success response: `200`
  ```json
  {
    "stats": {
      "revenue": 0,
      "orders": 0,
      "users": 0,
      "products": 0
    },
    "recent_orders": [ ... ],
    "order_status": {
      "diproses": 0,
      "dikirim": 0,
      "selesai": 0,
      "dibatalkan": 0
    },
    "top_products": [ ... ]
  }
  ```

### 10.2 Get All Users
- Method: `GET`
- URL: `/api/admin/users`
- Success response: `200` array of users

### 10.3 Delete User
- Method: `DELETE`
- URL: `/api/admin/users/:id`
- Success response: `200`
  ```json
  { "message": "User deleted successfully" }
  ```

### 10.4 Get All Products
- Method: `GET`
- URL: `/api/admin/products`
- Success response: `200` array of products

### 10.5 Delete Product
- Method: `DELETE`
- URL: `/api/admin/products/:id`
- Success response: `200`
  ```json
  { "message": "Product deleted successfully" }
  ```

### 10.6 Get All Transactions
- Method: `GET`
- URL: `/api/admin/transactions`
- Success response: `200` array of transactions

### 10.7 Get All Reviews
- Method: `GET`
- URL: `/api/admin/reviews`
- Success response: `200` array of reviews

---

## Notes
- File uploads use `multipart/form-data`.
- Protected endpoints require a valid JWT token.
- Admin-only endpoints are restricted by the `restrictTo("admin")` middleware.
- Buyer-only endpoints require role `buyer`.
- Error responses generally return a `message` field.
