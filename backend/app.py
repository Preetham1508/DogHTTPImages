from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
app.config['SECRET_KEY'] = 'my_secret'

# MongoDB setup
client = MongoClient("mongodb+srv://preethamreddy4850:Qwerty%40143@cluster0.xqwaea0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["moengage_db"]
lists_collection = db["response_lists"]
users_collection = db.users

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            print(token)
        else:
            return jsonify({'message': 'Token is missing or malformed!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 401
        except jwt.InvalidTokenError as e:
            print("JWT Error:", str(e))
            return jsonify({'message': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# Signup route
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    if users_collection.find_one({'email': email}):
        return jsonify({'message': 'Email already exists'}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    user = {
        'name': name,
        'email': email,
        'password': hashed_password,
        'created_at': datetime.utcnow()
    }
    result = users_collection.insert_one(user)

    token = jwt.encode({
        'user_id': str(result.inserted_id),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token, 'user_id': str(result.inserted_id)}), 201

# Login route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = users_collection.find_one({'email': email})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token, 'user_id': str(user['_id'])})

# Protected route
@app.route('/api/protected', methods=['GET'])
@token_required
def protected(current_user):
    return jsonify({'message': f'Hello {current_user["name"]}, this is protected!'})

# Save a list
@app.route('/api/saveList', methods=['POST'])
@token_required
def save_list(current_user):
    data = request.json
    name = data.get('name')
    codes = data.get('codes')
    imageUrls = data.get('imageUrls')

    if not name or not codes or not imageUrls:
        return jsonify({"error": "Missing required fields"}), 400

    new_list = {
        "name": name,
        "codes": codes,
        "imageUrls": imageUrls,
        "createdAt": datetime.utcnow(),
        "user_id": str(current_user['_id'])  # Add user_id to the list
    }

    result = lists_collection.insert_one(new_list)
    return jsonify({"message": "List saved", "id": str(result.inserted_id)}), 201

# Get all lists for the current user
@app.route('/api/getLists', methods=['GET'])
@token_required
def get_lists(current_user):
    lists = lists_collection.find({"user_id": str(current_user['_id'])}).sort("createdAt", -1)
    result = []
    for lst in lists:
        lst["_id"] = str(lst["_id"])
        result.append(lst)
    return jsonify(result)

# Delete a list (only if it belongs to the current user)
@app.route('/api/deleteList/<list_id>', methods=['DELETE'])
@token_required
def delete_list(current_user, list_id):
    try:
        result = lists_collection.delete_one({
            "_id": ObjectId(list_id),
            "user_id": str(current_user['_id'])  # Only delete if the list belongs to the user
        })
        if result.deleted_count == 1:
            return jsonify({"message": "List deleted successfully"})
        return jsonify({"error": "List not found or not authorized"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Update a list (only if it belongs to the current user)
@app.route('/api/updateList/<list_id>', methods=['PUT'])
@token_required
def update_list(current_user, list_id):
    data = request.json
    try:
        if 'codes' in data and 'imageUrls' in data:
            if len(data['codes']) == 0 or len(data['imageUrls']) == 0:
                return jsonify({"error": "Cannot have empty codes or imageUrls"}), 400

        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name']
        if 'codes' in data and 'imageUrls' in data:
            update_data['codes'] = data['codes']
            update_data['imageUrls'] = data['imageUrls']

        if update_data:
            result = lists_collection.update_one(
                {
                    "_id": ObjectId(list_id),
                    "user_id": str(current_user['_id'])  # Only update if the list belongs to the user
                },
                {"$set": update_data}
            )
            if result.modified_count == 1:
                return jsonify({"message": "List updated successfully"})

        return jsonify({"message": "No changes detected"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)