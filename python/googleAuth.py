import hashlib
import re
import random
import string


GRAVATAR_BASE_URL = "https://www.gravatar.com/avatar/"

def get_gravatar_url(email):
    # Generate a hash of the user's email address for Gravatar
    email_hash = hashlib.md5(email.lower().encode('utf-8')).hexdigest()
    gravatar_url = GRAVATAR_BASE_URL + email_hash
    return gravatar_url

def is_valid_email(email):
    pattern = r"^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$"
    if re.match(pattern, email):
        return True
    return False

def generate_password(length=10):
    # Define characters to use in the password
    characters = string.ascii_lowercase + string.digits

    # Ensure the password has a minimum length of 10 characters
    if length < 10:
        length = 10

    # Generate a random password
    password = ''.join(random.choice(characters) for _ in range(length - 2))

    # Add at least one digit and one uppercase letter
    password += random.choice(string.digits) + random.choice(string.ascii_uppercase)

    # Shuffle the characters to make it random
    password = ''.join(random.sample(password, len(password)))

    return password