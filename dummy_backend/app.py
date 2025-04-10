# dummy_main.py
import asyncio
import random
import datetime
import json
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Header, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- Configuration ---
DUMMY_AUTH_TOKEN = "dummy-auth-token-12345"
VALID_USERNAME = "testuser"
VALID_PASSWORD = "password" # Keep it simple for the dummy
SIMULATE_ERRORS_CHANCE = 0.1 # 10% chance of simulated 500 error on some routes

# --- Pydantic Models ---
class UserLogin(BaseModel):
    username: str
    password: str

class Hop(BaseModel):
    hop: int
    ip: str       # Can represent IP or MAC address for MAC trace
    name: str     # Device name or description
    type: str     # e.g., 'router', 'firewall', 'switch', 'L2 Switch', 'L3 Router'

# MacHop model is removed as we now use Hop for MAC traces too

class RouteHistoryEntry(BaseModel):
    id: int
    source: str
    destination: str
    route: str # JSON string representation of List[Hop]
    timestamp: datetime.datetime
    device_additional_info: Optional[str] = None # JSON string if present
    user: Optional[Dict[str, Any]] = None # For all_routes

# --- FastAPI App ---
app = FastAPI(title="Dummy RouteTrace Backend")

# --- CORS Middleware ---
# Allow requests from your React frontend development server
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods
    allow_headers=["*"], # Allow all headers
)

# --- Dummy Data Store (In-Memory) ---
# We don't actually save, but use this structure for generating history
dummy_route_counter = 0
dummy_history_store: List[RouteHistoryEntry] = []

# --- Dependency for Token Verification ---
async def verify_dummy_token(token: Optional[str] = Header(None)):
    """Simulates token verification."""
    # In a real app, you'd decode and validate a JWT or check a session
    if token == DUMMY_AUTH_TOKEN:
        # Return dummy user info (could be username, id, etc.)
        return {"username": VALID_USERNAME, "id": 1}
    else:
        print(f"Auth failed: received token '{token}', expected '{DUMMY_AUTH_TOKEN}'")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# --- Endpoints ---

@app.post("/verify-device-auth", summary="Authenticate User")
async def login_for_access_token(form_data: UserLogin):
    """Handles user login and returns a dummy token."""
    print(f"Login attempt: User '{form_data.username}'")
    await asyncio.sleep(0.5) # Simulate auth check delay
    if form_data.username == VALID_USERNAME and form_data.password == VALID_PASSWORD:
        print(f"Login successful for '{form_data.username}'")
        return DUMMY_AUTH_TOKEN # Return the token directly as a string
    else:
        print(f"Login failed for '{form_data.username}'")
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/get-default-gateway", summary="Get Default Gateway for IP", response_model=str)
async def get_default_gateway(ip: str = Query(...)):
    """Simulates finding the default gateway."""
    print(f"Requesting DG for IP: {ip}")
    await asyncio.sleep(0.3 + random.uniform(0, 0.2)) # Simulate lookup delay
    # Simple dummy logic: change last octet based on input
    parts = ip.split('.')
    if len(parts) == 4:
        try:
            last_octet = int(parts[3])
            # Ensure gateway is different from IP but typically .1 or .254
            gw_last_octet = 1 if last_octet > 1 else 254
            gateway_ip = f"{parts[0]}.{parts[1]}.{parts[2]}.{gw_last_octet}"
            print(f"Returning dummy DG: {gateway_ip}")
            return gateway_ip
        except ValueError:
            pass # Fallback if last part isn't a number

    # Fallback gateway
    fallback_gw = "10.0.0.1"
    print(f"Returning fallback dummy DG: {fallback_gw}")
    return fallback_gw


@app.get("/get-mac-trace", summary="Get MAC Trace", response_model=List[Hop]) # Changed response_model
async def get_mac_trace(ip: str = Query(...), dg: str = Query(...)):
    """Simulates a MAC/Layer2/Layer3 trace between an IP and its gateway."""
    print(f"Requesting MAC trace: {ip} <-> {dg}")
    await asyncio.sleep(0.6 + random.uniform(0, 0.4)) # Simulate trace delay

    if random.random() < SIMULATE_ERRORS_CHANCE:
        print("(!) Simulating MAC trace error")
        raise HTTPException(status_code=500, detail="Simulated backend error during MAC trace")

    # Generate some dummy hops using the Hop model
    hops = []
    num_hops = random.randint(1, 3) # Usually few L2/L3 hops between host and DG
    for i in range(1, num_hops + 1):
        # Simulate MAC address for 'ip' field
        mac_or_ip = ":".join([f"{random.randint(0, 255):02X}" for _ in range(6)]) if i < num_hops else dg # Last hop is often the DG IP
        device_type = random.choice(["L2 Switch", "L3 Router", "Firewall"])
        device_name = f"{device_type}-{chr(65+i)}{random.randint(1,5)}"
        hop_type = device_type # Use device type as hop type

        hops.append(Hop(hop=i, ip=mac_or_ip, name=device_name, type=hop_type))

    print(f"Returning {len(hops)} dummy MAC hops (using Hop model)")
    return hops


@app.get("/get-route-trace", summary="Get Main Route Trace", response_model=List[Hop])
async def get_route_trace(
    source_ip: str = Query(...),
    destination_ip: str = Query(...),
    source_dg: Optional[str] = Query(None),
    destination_dg: Optional[str] = Query(None),
    # Add other optional params from frontend service if needed
    vrf: Optional[str] = Query(None),
    destination_vrf: Optional[str] = Query(None),
    # We depend on the token but don't strictly need the user data here
    current_user: dict = Depends(verify_dummy_token)
):
    """Simulates the main network path trace (like traceroute)."""
    print(f"Requesting Route trace: {source_ip} -> {destination_ip} (via DGs: {source_dg} -> {destination_dg}) User: {current_user['username']}")
    await asyncio.sleep(1.0 + random.uniform(0, 0.8)) # Simulate longer trace delay

    global dummy_route_counter
    global dummy_history_store

    if random.random() < SIMULATE_ERRORS_CHANCE:
        print("(!) Simulating Route trace error")
        raise HTTPException(status_code=500, detail="Simulated backend error during Route trace")

    # Generate dummy route hops
    hops_data = []
    num_hops = random.randint(4, 12)
    current_subnet = random.randint(1, 254)
    for i in range(1, num_hops + 1):
        hop_ip = f"10.{current_subnet}.{random.randint(0,5)}.{random.randint(2, 254)}"
        hop_type = random.choice(['router', 'firewall', 'router', 'switch', 'router']) # More routers likely
        hop_name = f"{hop_type}-{chr(65+i)}{random.randint(1,10)}.net"
        if i == num_hops: # Last hop is destination
             hop_ip = destination_ip
             hop_name = f"destination-host-{random.randint(100,999)}"
             hop_type = "endpoint"
        elif i == 1: # First hop often DG
            hop_ip = source_dg if source_dg else f"10.{current_subnet}.0.1"
            hop_name = "source-dg-router"
            hop_type = "router" # Assume DG is a router

        hops_data.append(Hop(hop=i, ip=hop_ip, name=hop_name, type=hop_type))
        if random.random() < 0.3: # Sometimes change subnet mid-trace
             current_subnet = random.randint(1, 254)

    print(f"Generated {len(hops_data)} dummy route hops.")

    # --- Simulate Saving to History (add to in-memory list) ---
    # In a real app, this happens in the database logic called by the endpoint
    try:
        dummy_route_counter += 1
        # Convert each Hop object to a dictionary before dumping to JSON
        route_json_str = json.dumps([hop.model_dump() for hop in hops_data])
        device_info_json_str = json.dumps({"vrf": vrf, "source_dg": source_dg, "destination_ip_resolved_name": f"dest-{random.randint(1,100)}.example.com"})
        history_entry = RouteHistoryEntry(
            id=dummy_route_counter,
            source=source_ip,
            destination=destination_ip,
            route=route_json_str,
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            device_additional_info=device_info_json_str,
            user={"username": current_user["username"]} # Include user for potential use later
        )
        # Keep only the last N history entries if needed
        dummy_history_store.append(history_entry)
        if len(dummy_history_store) > 50:
             dummy_history_store.pop(0)
        print(f"Simulated saving route ID {dummy_route_counter} to history for user {current_user['username']}.")
    except Exception as e:
        print(f"Error during simulated history saving: {e}")
        # Don't fail the request, just log the error for the dummy


    # Return the generated hops
    return hops_data

@app.post("/get-user-routes", summary="Get User's Route History", response_model=List[RouteHistoryEntry])
async def get_user_routes(current_user: dict = Depends(verify_dummy_token)):
    """Returns the simulated saved route history for the logged-in user."""
    print(f"Requesting route history for user: {current_user['username']}")
    await asyncio.sleep(0.2) # Simulate DB query delay

    # Filter dummy store by username (case-insensitive for example)
    user_history = [
        entry for entry in dummy_history_store
        if entry.user and entry.user.get("username", "").lower() == current_user["username"].lower()
    ]
    # Sort by timestamp descending
    user_history.sort(key=lambda x: x.timestamp, reverse=True)

    print(f"Returning {len(user_history)} history entries for user {current_user['username']}")
    return user_history

@app.post("/get-all-routes", summary="Get All Route History (Admin)", response_model=List[RouteHistoryEntry])
async def get_all_routes(current_user: dict = Depends(verify_dummy_token)):
    """Returns all simulated saved route history."""
    # Add admin role check here in a real app
    print(f"Requesting ALL route history (requested by {current_user['username']})")
    await asyncio.sleep(0.3) # Simulate potentially larger query delay

    # Just return the whole dummy store, sorted
    all_history = sorted(dummy_history_store, key=lambda x: x.timestamp, reverse=True)

    print(f"Returning {len(all_history)} total history entries.")
    return all_history


# --- Root Endpoint (Optional) ---
@app.get("/")
async def read_root():
    return {"message": "Dummy RouteTrace Backend is running!"}

# --- Main Execution (for running with `python dummy_main.py`) ---
if __name__ == "__main__":
    import uvicorn
    print("Starting dummy backend server on http://localhost:8000")
    # Use reload=True for development convenience if uvicorn is installed globally
    # uvicorn.run("dummy_main:app", host="0.0.0.0", port=8000, reload=True)
    uvicorn.run(app, host="0.0.0.0", port=8000)