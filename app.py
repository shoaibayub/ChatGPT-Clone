# Import necessary libraries and modules for the Flask application
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, abort
from authlib.integrations.flask_client import OAuth  # OAuth integration for authentication
from flask_pymongo import PyMongo  # MongoDB integration for database access
from datetime import datetime  # Date and time handling
from python import googleAuth  # Custom module for Google OAuth
import openai  # Interaction with the OpenAI GPT-3 model
import bcrypt  # Password hashing for security

# Create a Flask application
app = Flask(__name__)

# Set the OpenAI API key (replace with your actual key)
openai.api_key = "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"

# Configure Flask application settings
app.config["SECRET_KEY"] = "mysecretkey"  # Secret key for session management
app.config["MONGO_URI"] = "mongodb+srv://Nasar_Ali:Password@nasarali.sjrfgg4.mongodb.net/chatgpt"  # MongoDB URI
app.config["SERVER_NAME"] = "localhost:5000"  # Server name

# Initialize PyMongo for database access
mongo = PyMongo(app)

# Initialize OAuth for authentication
oauth = OAuth(app)

# Define the route for the home page
@app.route("/")
def home():
    # Set the session URL to "/"
    session["url"] = "/"
    # Render the home.html template
    return render_template("home.html")

# Define the route for the developers page
@app.route("/developers")
def developer():
    # Set the session URL to "/developers"
    session["url"] = "/developers"
    # Render the developers.html template
    return render_template("developers.html")

# Define the route for the chatbot page
@app.route("/chatbot", methods=["GET", "POST"])
def chatbot():
    # Check if the user is not in session (not authenticated)
    if "user" not in session:
        # Clear the session URL and redirect to the sign-in page
        session['url'] = ""
        session["url"] = "/chatbot"
        return redirect(url_for("signin"))
    else:
        # If the request method is POST (submitting a question to the chatbot)
        if request.method == "POST":
            try:
                # Get the question from the JSON request data
                question = request.json.get("question")
                # Get the user's email from the session
                email = session['user']

                # Check if the question has already been answered and stored in the database
                chat = mongo.db.chats.find_one({"question": question})
                if chat:
                    # If found, retrieve the answer from the database
                    data = {"answer": f"{chat['answer']}"}
                else:
                    # If not found, interact with the OpenAI GPT-3 model to generate a response
                    response = openai.ChatCompletion.create(
                        model="gpt-3.5-turbo",
                        messages=[{"role": "user", "content": question}],
                        temperature=0.2,
                        max_tokens=1000,
                    )
                    # Extract the answer from the model's response
                    answer = response["choices"][0]["message"]["content"]
                    # Create a dictionary with the answer
                    data = {"answer": answer}
                    # Store the question and answer in the database
                    mongo.db.chats.insert_one({"email": email, "question": question, "answer": answer})
                # Return the answer as JSON
                return jsonify(data)
            except Exception as e:
                # Handle any exceptions and return an error message
                return jsonify({"error": str(e)})
        # If the request method is GET (loading the chatbot page)
        return render_template("chatbot.html")

# Define the route to get the user's profile image
@app.route("/image", methods=["GET", "POST"])
def getImage():
    # Get the user's email from the session
    email = session['user']
    # Find the user in the database
    user = mongo.db.Users.find_one({"email": email})
    # Get the user's profile image URL
    image = user.get("image")
    # Return the image URL as JSON
    return jsonify({"image": image})

# Define the route for user registration (sign-up)
@app.route("/signup", methods=["GET","POST"])
def signup():
    if "user" in session:
        url=session['url']
        # session.pop('url',None)
        return redirect(url)
    else:
        if request.method=="POST":
            name = request.form["name"]
            email = request.form["email"]
            password = request.form["password"]
        
            if len(password)<8:
                return jsonify({"error":"Your password must be at least 8 characters long","type":"passowrd"})
            
            has_upper=any(char.isupper() for char in password)
            has_digit=any(char.isdigit() for char in password)

            if not has_upper:
                return jsonify({"error":"Your password must contain at least one uppercase letter","type":"password"})
            if not has_digit:
                return jsonify({"error":"Please add at least one digit to your password","type":"password"})
            
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            hashed_password=hashed_password.decode('utf-8')
            profile_img = googleAuth.get_gravatar_url(email)
            user=mongo.db.Users.find_one({"email":email})

            if googleAuth.is_valid_email(email):
                if user is None:
                    data={
                        "name":name,
                        "email":email,
                        "password":hashed_password,
                        "date":datetime.now(),
                        "image":profile_img
                    }
                    session['user']=email
                    mongo.db.Users.insert_one(data)
                    url=session['url']
                    session.pop('url',None)
                    return redirect(url)
                else:
                    message = "The user with this email is already exist"
                    print(message)
                    return jsonify({"error": message, "type": "email"})
            else:
                message = "Please enter a valid email address"
                print(message)
                return jsonify({"error": message, "type": "email"})

        return render_template("register.html")




@app.route("/signin",methods=["GET","POST"])
def signin():

    if request.method=="POST":
        email = request.form['emails']
        password = request.form['passwords']
        print(email,password)
        if len(password)<8:
            return jsonify({"error":"Your password must be at least 8 characters long","type":"passowrd"})
            # print("Password error")
        
        hash_password=password.encode('utf-8')
        user=mongo.db.Users.find_one({"email":email})
        # if user and bcrypt.checkpw(hash_password,user["password"].encode('utf-8')):
        if user and password==user['password']:
            session['user']=email
            url=session['url']
            session.pop('url',None)
            return redirect(url)
        else:
            return jsonify({"error":"Invalid Credentials","type":"password"})
            # print("Invalid")
    return render_template("register.html")



@app.route("/google/")
def google_login():
    
    GOOGLE_CLIENT_ID = (
            "714481949723-ignip4rmh655865m8mrss4ifg8fnh634.apps.googleusercontent.com"
        )
    GOOGLE_secrete_ID = "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"
    CONF_URL = "https://accounts.google.com/.well-known/openid-configuration"

    oauth.register(
            name="google",
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_secrete_ID,
            client_kwargs={
                "scope": "profile email" 
            },
            server_metadata_url=CONF_URL,
            base_url="https://www.googleapis.com/oauth2/v1/certs",
            # access_token_method="POST",
        )
    if "user" in session:
        abort(404)
    redirect_uri = url_for("google_auth", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@app.route("/google/auth/")
def google_auth():
    token = oauth.google.authorize_access_token()
    user = oauth.google.parse_id_token(token, None)
    
    email=user['email']
    name=user['name']
    password=googleAuth.generate_password(10)
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    hashed_password=hashed_password.decode('utf-8')
    profile_img = user['picture']
    print(profile_img)
    User=mongo.db.Users.find_one({"email":email})
    if User is None:
        data={
            "name":name,
            "email":email,
            "password":hashed_password,
            "date":datetime.now(),
            "image":profile_img
        }
        mongo.db.Users.insert_one(data)
        url=session['url']
        session.pop('url',None)
        return redirect(url)
    else:
        session['user']=email
        url=session['url']
        session.pop('url',None)
        return redirect(url)
    


@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/feedback")
def feedback():
    return render_template("feedback.html")

@app.route("/logout")
def logout():
    session.pop('user',None)
    url=session['url']
    session.pop('url',None)
    return redirect(url)

if __name__ == "__main__":
    app.run(debug=True)