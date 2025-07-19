#!/usr/bin/env python3
import requests
import datetime

def ping_backend():
    # Server URLs - replace with your actual URLs
    python_server_url = "https://make-it-rag-1.onrender.com/ping"
    nodejs_server_url = "https://your-nodejs-server.onrender.com/ping"  # Replace with your actual Node.js server URL
    
    servers = [
        {"name": "Python AI Server", "url": python_server_url},
        {"name": "Node.js API Server", "url": nodejs_server_url}
    ]
    
    for server in servers:
        try:
            print(f"{datetime.datetime.now()}: Pinging {server['name']} at {server['url']}")
            response = requests.get(server['url'], timeout=30)
            print(f"Response: {response.status_code}")
            
            if response.status_code == 200:
                print(f"✅ {server['name']} is alive")
                # Try to print response data if it's JSON
                try:
                    data = response.json()
                    if "message" in data:
                        print(f"   Message: {data['message']}")
                except:
                    pass
            else:
                print(f"⚠️ {server['name']} returned unexpected status code: {response.status_code}")
                
        except Exception as e:
            print(f"❌ {server['name']} error: {e}")
        
        print()  # Add spacing between servers

if __name__ == "__main__":
    ping_backend()  # Just ping once, then exit 