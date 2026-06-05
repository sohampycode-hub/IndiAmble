import os
import re
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import google.generativeai as genai
import jwt
import bcrypt
import datetime
import traceback  # Place this near the top of your app.py file with your imports

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/wanderindia")
client = MongoClient(MONGO_URI)
db = client.get_database()
# Configure the Google Gemini model engine
# Configure the Google Gemini model engine
api_key_token = os.getenv("GEMINI_API_KEY")
if not api_key_token:
    print("⚠️ WARNING: GEMINI_API_KEY is missing from your .env file!")
else:
    print("✅ Success: GEMINI_API_KEY loaded successfully.")

genai.configure(api_key=api_key_token)
# -------------------------------------------------------------------------
# DIRECTORY ROUTE ENDPOINTS
# -------------------------------------------------------------------------

@app.route('/api/states', methods=['GET'])
def get_states_catalog():
    """Returns a structural layout tree of all states and their regions."""
    try:
        states = list(db.states.find({}))
        # MongoDB default object IDs cannot convert to JSON automatically, so modify them to strings
        for s in states:
            s['_id'] = str(s['_id'])
        return jsonify(states), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/regions/<region_id>', methods=['GET'])
def get_region_profile(region_id):
    """
    Fetches a single rich region profile document matched via its strict numerical ID.
    This bypasses case-sensitive string slug matching entirely.
    """
    try:
        # Convert the incoming URL string parameter (e.g., "1001") into a clean integer/string token
        # Our seeder stored region_id as a string token format: f"reg_{region_block['region_id']}"
        target_id = f"reg_{region_id}" if not region_id.startswith("reg_") else region_id
        
        region = db.regions.find_one({"region_id": target_id})
        if not region:
            # Fallback check: try matching raw numerical integer if token prefix varies
            raw_id = int(region_id.replace("reg_", "")) if "reg_" in region_id else int(region_id)
            region = db.regions.find_one({"region_id": raw_id})
            
        if not region:
            return jsonify({"message": f"Region ID {region_id} not found in database Compass collections."}), 404
            
        region['_id'] = str(region['_id'])
        return jsonify(region), 200
    except Exception as e:
        print(f"Backend Fetch Error: {str(e)}")
        return jsonify({"message": str(e)}), 500

# -------------------------------------------------------------------------
# SEARCH ENGINE ROUTE (DYNAMIC FILTERS QUERY ALIGNMENT MATRICES)
# -------------------------------------------------------------------------

@app.route('/api/search', methods=['GET'])
def query_search_engine():
    """
    Queries your local MongoDB Compass regions collection safely based on user filters.
    Includes robust fallbacks for un-filtered states and exact ampersand handling.
    """
    try:
        keyword = request.args.get('q', '').strip()
        travel_type = request.args.get('travel_type', '').strip()
        budget = request.args.get('budget', '').strip()
        duration = request.args.get('duration', '').strip()

        # Initialize an empty search criteria dictionary
        search_criteria = {}

        # 1. Handle Keyword Matches Safely using case-insensitive regex
        if keyword:
            regex_query = re.compile(re.escape(keyword), re.IGNORECASE)
            search_criteria["$or"] = [
                {"name": regex_query},
                {"state": regex_query},
                {"description": regex_query}
            ]

        # 2. Match Travel Companion Type
        if travel_type:
            search_criteria["trip_type"] = travel_type.lower()

        # 3. Match Budget Category
        if budget:
            budget_alignment_map = {
                "low-budget": "low-budget",
                "mid-range": "mid-budget",
                "premium": "premium-budget"
            }
            target_mapped_category = budget_alignment_map.get(budget, budget.lower())
            search_criteria["budget_category"] = target_mapped_category

        # 4. Match Duration Window
        if duration:
            search_criteria["duration_category"] = duration

        # Query the local MongoDB Compass 'regions' collection
        results = list(db.regions.find(search_criteria))
        
        # Convert BSON ObjectIds to strings so they are JSON serializable
        for item in results:
            item['_id'] = str(item['_id'])
            
        return jsonify(results), 200
        
    except Exception as e:
        print(f"Search API Error Logs: {str(e)}")
        return jsonify({"message": str(e)}), 500

# ------------------------------------------------------------------
# USER AUTHENTICATION ROUTE ENDPOINTS
# ------------------------------------------------------------------

@app.route('/api/auth/signup', methods=['POST'])
def handle_user_signup():
    """
    Registers a fresh user account inside MongoDB Compass collections,
    ensuring password safety via cryptographic salting and hashing.
    """
    try:
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name or not email or not password:
            return jsonify({"message": "Please fill out all required name, email, and password registration blocks."}), 400

        # Check if user profile already exists within database storage
        existing_user = db.users.find_one({"email": email})
        if existing_user:
            return jsonify({"message": "An account with this email address already exists. Proceed to Login."}), 400

        # Securely hash user credentials
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Insert document metadata bundle safely
        new_user = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.datetime.utcnow()
        }
        db.users.insert_one(new_user)
        
        return jsonify({"message": "Account created successfully! Redirecting to login portal..."}), 201

    except Exception as e:
        print("Registration Engine Fault Log:", str(e))
        return jsonify({"message": f"Server failed to complete signup framework actions: {str(e)}"}), 500


@app.route('/api/auth/login', methods=['POST'])
def handle_user_login():
    """
    Verifies user login credentials and returns an encrypted JWT session signature block.
    """
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"message": "Email and password inputs are strictly required to authorize session."}), 400

        # Look up profile match inside database Compass collections
        user = db.users.find_one({"email": email})
        if not user:
            return jsonify({"message": "Invalid authentication credentials supplied. Double-check email or password."}), 401

        # Evaluate passwords securely via bcrypt comparisons
        if bcrypt.checkpw(password.encode('utf-8'), user["password"]):
            # Generate session authorization token valid for 24 Hours
            token_payload = {
                "user_id": str(user["_id"]),
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }
            # Using a fallback secret signature key if not defined within system environment parameters
            jwt_secret = os.getenv("JWT_SECRET", "wanderindia_hackathon_super_secret_string_2026")
            session_token = jwt.encode(token_payload, jwt_secret, algorithm="HS256")

            return jsonify({
                "token": session_token,
                "userName": user["name"],
                "message": f"Welcome back to WanderIndia, {user['name']}!"
            }), 200
        else:
            return jsonify({"message": "Invalid authentication credentials supplied. Double-check email or password."}), 401

    except Exception as e:
        print("Login Engine Authorization Fault Log:", str(e))
        return jsonify({"message": f"Server failed to complete session verification layout sequences: {str(e)}"}), 500

# ------------------------------------------------------------------
# USER FAVORITES ENDPOINTS
# ------------------------------------------------------------------

@app.route('/api/user/favorites', methods=['GET'])
def get_user_favorites():
    """
    Fetches the specific list of region documents that the active user has favorited.
    Correctly reads parameters from request.args instead of an un-supported JSON body.
    """
    try:
        # Clear out URL parameters safely
        email = request.args.get("email", "").strip().lower()
        if not email:
            return jsonify([]), 200

        # Look up user document profile matching email criteria
        user_record = db.users.find_one({"email": email})
        if not user_record:
            return jsonify([]), 200

        # Extract the saved list of region IDs
        fav_ids = user_record.get("favorites", [])
        
        # Format list to search strings vs numbers interchangeably 
        query_ids = []
        for fid in fav_ids:
            query_ids.append(str(fid))
            try:
                query_ids.append(int(fid))
            except ValueError:
                pass

        # Pull matching full region summaries from our main catalog collection
        matched_regions = list(db.regions.find({"region_id": {"$in": query_ids}}))
        
        for r in matched_regions:
            r['_id'] = str(r['_id'])
            
        return jsonify(matched_regions), 200
    except Exception as e:
        print("Favorites fetching anomaly:", str(e))
        return jsonify([]), 200


@app.route('/api/user/favorites/toggle', methods=['POST'])
def toggle_user_favorite():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        region_id = data.get("region_id", "")

        if not email or not region_id:
            return jsonify({"message": "Missing context parameters."}), 400

        user_record = db.users.find_one({"email": email})
        if not user_record:
            return jsonify({"message": "User not found."}), 404

        current_favs = user_record.get("favorites", [])
        
        # Convert to string and try integer fallback to cover all bases
        region_id_str = str(region_id)
        
        # Try to find if either version exists in the current favorites
        target_id_to_use = region_id_str
        if region_id_str not in current_favs:
            try:
                region_id_int = int(region_id)
                if region_id_int in current_favs:
                    target_id_to_use = region_id_int
            except ValueError:
                pass

        # If already favorited, remove it; otherwise, add it
        if target_id_to_use in current_favs or region_id_str in current_favs:
            db.users.update_one({"email": email}, {"$pull": {"favorites": target_id_to_use}})
            db.users.update_one({"email": email}, {"$pull": {"favorites": region_id_str}})
            status = "removed"
        else:
            # Add it as a string standard
            db.users.update_one({"email": email}, {"$addToSet": {"favorites": region_id_str}})
            status = "added"

        return jsonify({"status": status, "message": f"Region successfully {status}!"}), 200
    except Exception as e:
        print("Toggle collection error log:", str(e))
        return jsonify({"message": str(e)}), 500

@app.route('/api/ai/chat', methods=['POST'])
def process_ai_travel_agent_recommendation():
    """
    Communicates with the Google Gemini engine to provide contextual, human-like
    itineraries and travel answers calibrated to Indian regions.
    """
    try:
        data = request.get_json() or {}
        user_message = data.get("message", "")

        if not user_message:
            return jsonify({"reply": "I am ready! Tell me about your companion group, budget preferences, or regions you want to explore."}), 400

        # Define clear behavioral instructions for the Gemini persona
        system_persona_guide = (
    "You are IndiAmble's professional, friendly, local expert AI Travel Guide Agent.\n"
    "Your personality is warm, enthusiastic, and highly knowledgeable about Indian geography.\n"
    "CRITICAL DIRECTIVES:\n"
    "1. When recommending itineraries or spots, prioritize the exact regions in our catalog...\n"
    "4. Do not mention that you are an AI model. Act as a real tour coordinator for IndiAmble."
)

        # UPDATED SPECIFICATION: Using 'gemini-1.5-flash' which is the current ultra-stable hackathon model
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash',
            system_instruction=system_persona_guide
        )
        
        # Request generation smoothly
        response = model.generate_content(user_message)
        ai_reply_text = response.text

        return jsonify({
            "reply": ai_reply_text
        }), 200

    except Exception as e:
        # This logs the deep error trace directly into your command prompt / terminal window
        print("\n❌ --- GEMINI CRASH LOG START --- ❌")
        print(f"Error Type: {str(e)}")
        traceback.print_exc()
        print("❌ --- GEMINI CRASH LOG END --- ❌\n")
        
        return jsonify({
            "reply": f"AI Engine Connection Latency: {str(e)}. Please check your backend terminal for the crash trace."
        }), 200

    except Exception as e:
        print("Gemini connectivity exception dropped trace error logs:", str(e))
        return jsonify({"reply": "My travel intelligence logs are currently adjusting system calibrations. Let me summarize standard regional paths shortly!"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)