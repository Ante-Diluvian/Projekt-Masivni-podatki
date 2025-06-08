import requests
import os

FLASK_URL = "http://localhost:5000"

def test_flask_register_login():
    print("Sending POST /register...")
    register_data = {"username": "CICD-test"}
    register_files = {"file": open("image.zip", "rb")}

    r1 = requests.post(f"{FLASK_URL}/register", data=register_data, files=register_files)
    register_files["file"].close()

    assert r1.status_code == 200, f"Register failed with status {r1.status_code}"
    assert r1.json() == True, f"Register returned unexpected response: {r1.json()}"

    print("Register successful!")

    print("Sending POST /login...")
    login_files = {"file": open("testimage.png", "rb")}
    r2 = requests.post(f"{FLASK_URL}/login", files=login_files)
    login_files["file"].close()

    assert r2.status_code == 200, f"Login failed with status {r2.status_code}"
    assert r2.json() == True, f"Login returned unexpected response: {r2.json()}"

    print("Login successful!")

if __name__ == "__main__":
    try:
        test_flask_register_login()
        print("Test PASSED")
    except Exception as e:
        print("Test FAILED:", e)
        exit(1)
