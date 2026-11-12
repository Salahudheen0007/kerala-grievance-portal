
import os
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv(".env", override=True)

url = os.getenv("SUPABASE_URL", "").rstrip("/")
key = os.getenv("SUPABASE_KEY", "")

request = urllib.request.Request(
    f"{url}/rest/v1/grievances?select=reference_id&limit=1",
    headers={"apikey": key},
)

try:
    with urllib.request.urlopen(request, timeout=15) as response:
        print("HTTP status:", response.status)
        print("Supabase connection successful!")

except urllib.error.HTTPError as error:
    print("HTTP status:", error.code)
    print("Supabase returned an HTTP error.")
    print("Response:", error.read().decode("utf-8")[:500])

except Exception as error:
    print("Connection failed:", type(error).__name__)
    print(str(error))
