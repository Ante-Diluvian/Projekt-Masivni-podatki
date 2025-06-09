import requests
import os

FLASK_URL = "http://localhost:5000"

def test_flask_register_login():
    print("Sending POST /register...")
    register_data = {"username": "CICD-test"}
    script_dir = os.path.dirname(os.path.abspath(__file__))
    zip_path = os.path.join(script_dir, "images.zip")
    register_files = {"file": open(zip_path, "rb")}


    r1 = requests.post(f"{FLASK_URL}/register", data=register_data, files=register_files)
    register_files["file"].close()

    assert r1.status_code == 200, f"Register failed with status {r1.status_code}"
    json_response = r1.json()
    assert json_response.get("success") == True, f"Register returned unexpected response: {json_response}"

    print("Register successful!")

    print("Sending POST /login...")
    image_data = {"username": "CICD-test"}
    image_path = os.path.join(script_dir, "testimage.jpg")
    login_files = {"image": open(image_path, "rb")}
    r2 = requests.post(f"{FLASK_URL}/login", data=image_data, files=login_files)
    login_files["file"].close()

    assert r2.status_code == 200, f"Login failed with status {r2.status_code}"
    json_response = r1.json()
    assert json_response.get("success") == True, f"Login returned unexpected response: {json_response}"

    print("Login successful!")

if __name__ == "__main__":
    try:
        test_flask_register_login()
        print("Test PASSED")
    except Exception as e:
        print("Test FAILED:", e)
        exit(1)
