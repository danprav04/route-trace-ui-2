# dummy_main.py
import asyncio
import random
import datetime
import json
from typing import List, Optional, Dict, Any, Union

from fastapi import FastAPI, HTTPException, Header, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --- Configuration ---
DUMMY_AUTH_TOKEN = "dummy-auth-token-12345"
VALID_USERNAME = "testuser"
VALID_PASSWORD = "password" # Keep it simple for the dummy
SIMULATE_ERRORS_CHANCE = 0.05 # Reduced error chance

# --- Pydantic Models ---
class UserLogin(BaseModel):
    username: str
    password: str

# NEW Combined Hop Model for API responses
class DetailedHop(BaseModel):
    hop: int
    ip: str                   # IP Address (Router/Endpoint) or MAC Address (Switch)
    type: str                 # e.g., 'router', 'firewall', 'L2 Switch', 'L3 Switch', 'endpoint'
    hostname: Optional[str] = None # Device name (often from RouteTrace)

    # RouteTraceHop specific fields (optional)
    destination_network: Optional[str] = None
    vrf: Optional[str] = None
    destination_dg_ip: Optional[str] = None # Maybe just 'next_hop_dg'? Clarify purpose
    mpls_label: Optional[str] = None
    passed_firewall: Optional[bool] = None # True if passed through a firewall before this hop?

    # MacTraceHop specific fields (optional)
    # Use 'id_' or map to a different name if 'id' is problematic (e.g. in JS)
    # Renaming to 'device_id' for clarity in JSON
    device_id: Optional[str] = Field(None, alias="id_") # Use alias if original Python uses id_
    destination_mac: Optional[str] = None
    next_hop_interface: Optional[str] = None

    # Common/Derived fields
    nexthop_int_ip: Optional[str] = None # Can come from both types

    # Ensure model_dump uses aliases if needed when sending response
    class Config:
        populate_by_name = True # Allow using 'id_' in Python but serialize as 'device_id' if alias is set

class RouteHistoryEntry(BaseModel):
    id: int
    source: str
    destination: str
    route: str # JSON string representation of List[DetailedHop]
    timestamp: datetime.datetime
    device_additional_info: Optional[str] = None # JSON string if present
    user: Optional[Dict[str, Any]] = None # For all_routes


# --- FastAPI App ---
app = FastAPI(title="Dummy RouteTrace Backend V2 (Detailed Hops)")

# --- CORS Middleware ---
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
dummy_route_counter = 0
dummy_history_store: List[RouteHistoryEntry] = []

# --- Dependency for Token Verification ---
async def verify_dummy_token(token: Optional[str] = Header(None)):
    """Simulates token verification."""
    if token == DUMMY_AUTH_TOKEN:
        return {"username": VALID_USERNAME, "id": 1}
    else:
        print(f"Auth failed: received token '{token}', expected '{DUMMY_AUTH_TOKEN}'")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# --- Helper Functions for Dummy Data ---
def generate_mac():
    return ":".join([f"{random.randint(0, 255):02X}" for _ in range(6)])

def generate_ip(prefix="10"):
    return f"{prefix}.{random.randint(0, 254)}.{random.randint(0, 254)}.{random.randint(1, 254)}"

# --- Endpoints ---

@app.post("/verify-device-auth", summary="Authenticate User")
async def login_for_access_token(form_data: UserLogin):
    """Handles user login and returns a dummy token."""
    print(f"Login attempt: User '{form_data.username}'")
    await asyncio.sleep(0.3) # Simulate auth check delay
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
    await asyncio.sleep(0.2 + random.uniform(0, 0.1)) # Simulate lookup delay
    parts = ip.split('.')
    if len(parts) == 4:
        try:
            last_octet = int(parts[3])
            gw_last_octet = 1 if last_octet > 1 else 254
            gateway_ip = f"{parts[0]}.{parts[1]}.{parts[2]}.{gw_last_octet}"
            print(f"Returning dummy DG: {gateway_ip}")
            return gateway_ip
        except ValueError:
            pass
    fallback_gw = "10.0.0.1"
    print(f"Returning fallback dummy DG: {fallback_gw}")
    return fallback_gw


@app.get("/get-mac-trace", summary="Get MAC Trace", response_model=List[DetailedHop])
async def get_mac_trace(ip: str = Query(...), dg: str = Query(...)):
    """Simulates a MAC/Layer2/Layer3 trace between an IP and its gateway."""
    print(f"Requesting MAC trace: {ip} <-> {dg}")
    await asyncio.sleep(0.4 + random.uniform(0, 0.2)) # Simulate trace delay

    if random.random() < SIMULATE_ERRORS_CHANCE:
        print("(!) Simulating MAC trace error")
        raise HTTPException(status_code=500, detail="Simulated backend error during MAC trace")

    hops = []
    num_hops = random.randint(1, 3) # Usually few L2/L3 hops between host and DG

    # Start hop often represents the source device NIC or first switch port
    hops.append(DetailedHop(
        hop=1,
        ip=ip, # Start with the source IP
        type=random.choice(["L3 Switch Port", "NIC"]),
        hostname=f"source-dev-{random.randint(1,100)}",
        destination_mac=generate_mac(), # MAC of the next hop device
        next_hop_interface=f"Gi0/{random.randint(0,2)}",
        nexthop_int_ip=generate_ip("192.168"), # IP of the switch/router interface connected
        device_id=f"DEV{random.randint(1000, 9999)}"
    ))

    for i in range(2, num_hops + 1):
        is_last_hop = (i == num_hops)
        device_type = random.choice(["L2 Switch", "L3 Switch", "Firewall"]) if not is_last_hop else "L3 Router" # Assume DG is L3 Router
        hop_ip = generate_mac() if device_type == "L2 Switch" else generate_ip() # L2 uses MAC, L3 uses IP
        next_hop_ip = dg if is_last_hop else generate_ip()

        hops.append(DetailedHop(
            hop=i,
            ip=hop_ip,
            type=device_type,
            hostname=f"{device_type.replace(' ', '-')}-{chr(65+i)}{random.randint(1,5)}" if not is_last_hop else "default-gateway-router",
            destination_mac=generate_mac(),
            next_hop_interface=f"Gi{random.randint(1,4)}/{random.randint(0,47)}",
            nexthop_int_ip=next_hop_ip,
            device_id=f"DEV{random.randint(1000, 9999)}",
            # Only add if it's a routing device
            vrf=f"VRF-{chr(65+random.randint(0,2))}" if "L3" in device_type or "Router" in device_type else None
        ))

    # Final hop representing the gateway itself
    hops.append(DetailedHop(
        hop=num_hops + 1,
        ip=dg,
        type="L3 Router Interface",
        hostname="default-gateway-router",
        nexthop_int_ip=None, # End of this segment
        next_hop_interface=None,
        destination_mac=None,
        device_id=f"DEV{random.randint(1000, 9999)}",
         vrf=f"VRF-{chr(65+random.randint(0,2))}"
    ))


    print(f"Returning {len(hops)} dummy MAC hops (DetailedHop model)")
    return hops


@app.get("/get-route-trace", summary="Get Main Route Trace", response_model=List[DetailedHop])
async def get_route_trace(
    source_ip: str = Query(...),
    destination_ip: str = Query(...),
    source_dg: Optional[str] = Query(None),
    destination_dg: Optional[str] = Query(None),
    vrf: Optional[str] = Query(None), # Input VRF context if any
    # destination_vrf: Optional[str] = Query(None), # Not in Python model, but could be added
    current_user: dict = Depends(verify_dummy_token)
):
    """Simulates the main network path trace (like traceroute)."""
    print(f"Requesting Route trace: {source_ip} -> {destination_ip} (via DGs: {source_dg} -> {destination_dg}) User: {current_user['username']}")
    await asyncio.sleep(0.8 + random.uniform(0, 0.5)) # Simulate trace delay

    global dummy_route_counter
    global dummy_history_store

    if random.random() < SIMULATE_ERRORS_CHANCE:
        print("(!) Simulating Route trace error")
        raise HTTPException(status_code=500, detail="Simulated backend error during Route trace")

    hops_data = []
    num_hops = random.randint(5, 15)
    current_subnet_prefix = f"10.{random.randint(1, 254)}"
    passed_fw = False

    for i in range(1, num_hops + 1):
        is_last_hop = (i == num_hops)
        hop_type = random.choice(['router', 'firewall', 'router', 'router']) # More routers likely
        if is_last_hop:
            hop_ip = destination_ip
            hop_type = "endpoint"
            hostname = f"dest-host-{random.randint(100,999)}.domain.local"
        elif i == 1:
            hop_ip = source_dg if source_dg else f"{current_subnet_prefix}.0.1"
            hop_type = "router"
            hostname = f"dg-router-{chr(65+random.randint(0,3))}.core.net"
        else:
             # Ensure IP increments realistically or changes subnet
             if random.random() < 0.2:
                 current_subnet_prefix = f"10.{random.randint(1, 254)}"
             hop_ip = f"{current_subnet_prefix}.{random.randint(1,5)}.{random.randint(2, 254)}"
             hostname = f"{hop_type}-{chr(65+i)}{random.randint(1,10)}.infra.net"

        # Determine next hop IP
        if is_last_hop:
            nexthop_int_ip = None
        else:
            # Peek at next hop's potential IP for realism
            next_prefix = current_subnet_prefix if random.random() < 0.8 else f"10.{random.randint(1, 254)}"
            nexthop_int_ip = f"{next_prefix}.{random.randint(1,5)}.{random.randint(2, 254)}"


        hop_details = DetailedHop(
            hop=i,
            ip=hop_ip,
            type=hop_type,
            hostname=hostname,
            destination_network=f"{destination_ip}/32" if not is_last_hop else None, # Network being routed towards
            vrf=vrf if i < 3 else f"VRF-{chr(65+random.randint(0,4))}" if random.random() > 0.3 else None, # Simulate VRF changes
            mpls_label=str(random.randint(10000, 50000)) if random.random() > 0.6 else None, # Simulate MPLS
            passed_firewall=passed_fw,
            nexthop_int_ip=nexthop_int_ip,
            # These are less common in L3 trace, but could exist if it's a L3 switch acting as router
            # destination_mac=generate_mac() if hop_type == 'L3 Switch' else None,
            # next_hop_interface=f"Vlan{random.randint(10,50)}" if hop_type == 'L3 Switch' else f"Eth{random.randint(0,1)}/0",
            device_id=f"NODE{random.randint(10000, 99999)}" if not is_last_hop else "ENDPOINT_DEVICE"
        )

        if hop_type == 'firewall':
            passed_fw = True # Mark that subsequent hops passed this firewall

        hops_data.append(hop_details)


    print(f"Generated {len(hops_data)} dummy route hops (DetailedHop model).")

    # --- Simulate Saving to History ---
    try:
        dummy_route_counter += 1
        # Use model_dump to ensure aliases are handled if defined
        route_json_str = json.dumps([hop.model_dump(by_alias=True) for hop in hops_data])
        device_info_json_str = json.dumps({
            "input_vrf": vrf,
            "source_dg_used": source_dg,
            "destination_dg_used": destination_dg,
            "trace_engine": "Dummy V2"
        })
        history_entry = RouteHistoryEntry(
            id=dummy_route_counter,
            source=source_ip,
            destination=destination_ip,
            route=route_json_str,
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            device_additional_info=device_info_json_str,
            user={"username": current_user["username"]}
        )
        dummy_history_store.append(history_entry)
        if len(dummy_history_store) > 50:
             dummy_history_store.pop(0)
        print(f"Simulated saving route ID {dummy_route_counter} to history for user {current_user['username']}.")
    except Exception as e:
        print(f"Error during simulated history saving: {e}")

    # Return the generated hops
    return hops_data

@app.post("/get-user-routes", summary="Get User's Route History", response_model=List[RouteHistoryEntry])
async def get_user_routes(current_user: dict = Depends(verify_dummy_token)):
    """Returns the simulated saved route history for the logged-in user."""
    print(f"Requesting route history for user: {current_user['username']}")
    await asyncio.sleep(0.2)
    user_history = [
        entry for entry in dummy_history_store
        if entry.user and entry.user.get("username", "").lower() == current_user["username"].lower()
    ]
    user_history.sort(key=lambda x: x.timestamp, reverse=True)
    print(f"Returning {len(user_history)} history entries for user {current_user['username']}")
    return user_history

@app.post("/get-all-routes", summary="Get All Route History (Admin)", response_model=List[RouteHistoryEntry])
async def get_all_routes(current_user: dict = Depends(verify_dummy_token)):
    """Returns all simulated saved route history."""
    print(f"Requesting ALL route history (requested by {current_user['username']})")
    await asyncio.sleep(0.3)
    all_history = sorted(dummy_history_store, key=lambda x: x.timestamp, reverse=True)
    print(f"Returning {len(all_history)} total history entries.")
    return all_history


# --- Root Endpoint (Optional) ---
@app.get("/")
async def read_root():
    return {"message": "Dummy RouteTrace Backend V2 (Detailed Hops) is running!"}

# --- Main Execution ---
if __name__ == "__main__":
    import uvicorn
    print("Starting dummy backend server V2 on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)