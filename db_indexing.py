import pymongo

# Establish a connection to your MongoDB server
client = pymongo.MongoClient("mongodb+srv://Nasar_Ali:Password@nasarali.sjrfgg4.mongodb.net")  # Replace with your MongoDB server URL
db = client["chatgpt"]  # Replace with your database name
db.chats.create_index([("email",pymongo.ASCENDING)])