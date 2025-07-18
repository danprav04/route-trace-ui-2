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

# Combined Hop Model for API responses (remains the same)
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
    device_id: Optional[str] = Field(None, alias="id_") # Use alias if original Python uses id_
    destination_mac: Optional[str] = None
    next_hop_interface: Optional[str] = None
    # Common/Derived fields
    nexthop_int_ip: Optional[str] = None # Can come from both types
    class Config:
        populate_by_name = True # Allow using 'id_' in Python but serialize as 'device_id' if alias is set

# UPDATED History Entry Model
class RouteHistoryEntry(BaseModel):
    id: int
    source: str # Primary source identifier (IP or Gateway IP)
    destination: str # Primary destination identifier (IP or Gateway IP)
    trace_type: str # 'combined', 'direct', 'mac'
    timestamp: datetime.datetime
    user: Optional[Dict[str, Any]] = None # For all_routes

    # Trace Results (as JSON strings)
    main_route_trace: Optional[str] = None # JSON List[DetailedHop] for IP path
    source_mac_trace: Optional[str] = None # JSON List[DetailedHop] for Source L2 path or single MAC trace
    destination_mac_trace: Optional[str] = None # JSON List[DetailedHop] for Dest L2 path

    # Contextual Info (as JSON strings)
    input_details: Optional[str] = None # JSON Dict of the inputs used for this trace (e.g., {"source_ip": "...", "vrf": "..."})


# --- FastAPI App ---
app = FastAPI(title="Dummy RouteTrace Backend V3 (Universal History)")

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

def serialize_hops(hops: Optional[List[DetailedHop]]) -> Optional[str]:
    """Safely serialize list of DetailedHop models to JSON string."""
    if not hops:
        return None
    try:
        # Use model_dump for Pydantic v2, ensuring aliases are used
        return json.dumps([hop.model_dump(by_alias=True) for hop in hops])
    except Exception as e:
        print(f"Error serializing hops: {e}")
        return None

def serialize_dict(data: Optional[Dict]) -> Optional[str]:
    """Safely serialize dict to JSON string."""
    if not data:
        return None
    try:
        return json.dumps(data)
    except Exception as e:
        print(f"Error serializing dict: {e}")
        return None

def save_to_history(
    trace_type: str,
    source_id: str,
    destination_id: str,
    input_details: Dict,
    user: Dict,
    main_hops: Optional[List[DetailedHop]] = None,
    source_mac_hops: Optional[List[DetailedHop]] = None,
    dest_mac_hops: Optional[List[DetailedHop]] = None
):
    """Saves a trace result to the dummy history store."""
    global dummy_route_counter
    global dummy_history_store
    try:
        dummy_route_counter += 1
        history_entry = RouteHistoryEntry(
            id=dummy_route_counter,
            source=source_id,
            destination=destination_id,
            trace_type=trace_type,
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            user={"username": user["username"]}, # Store basic user info
            main_route_trace=serialize_hops(main_hops),
            source_mac_trace=serialize_hops(source_mac_hops),
            destination_mac_trace=serialize_hops(dest_mac_hops),
            input_details=serialize_dict(input_details)
        )
        dummy_history_store.append(history_entry)
        if len(dummy_history_store) > 100: # Increase history size slightly
            dummy_history_store.pop(0)
        print(f"Simulated saving {trace_type} trace ID {dummy_route_counter} to history for user {user['username']}.")
    except Exception as e:
        print(f"Error during simulated history saving: {e}")


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
    """Simulates finding the default gateway for an *endpoint* IP."""
    print(f"Requesting DG for Endpoint IP: {ip}")
    await asyncio.sleep(0.2 + random.uniform(0, 0.1)) # Simulate lookup delay
    parts = ip.split('.')
    if len(parts) == 4:
        try:
            last_octet = int(parts[3])
            gw_last_octet = 1 if last_octet != 1 else 254
            gateway_ip = f"{parts[0]}.{parts[1]}.{parts[2]}.{gw_last_octet}"
            print(f"Returning dummy DG: {gateway_ip}")
            return gateway_ip
        except ValueError:
            pass
    fallback_gw = "10.0.0.1"
    print(f"Returning fallback dummy DG: {fallback_gw}")
    return fallback_gw


@app.get("/get-mac-trace", summary="Get MAC Trace", response_model=List[DetailedHop])
async def get_mac_trace(
    ip: str = Query(...),
    dg: str = Query(...),
    current_user: dict = Depends(verify_dummy_token) # Verify user token
):
    """Simulates a MAC trace between an endpoint IP and its gateway."""
    print(f"Requesting MAC trace: {ip} <-> {dg} (User: {current_user['username']})")
    await asyncio.sleep(0.4 + random.uniform(0, 0.2)) # Simulate trace delay

    if random.random() < SIMULATE_ERRORS_CHANCE:
        print("(!) Simulating MAC trace error")
        raise HTTPException(status_code=500, detail="Simulated backend error during MAC trace")

    hops = []
    num_hops = random.randint(1, 3) # Usually few L2/L3 hops between host and DG

    # Generate detailed hops specific to MAC trace context
    hops.append(DetailedHop(
        hop=1, ip=ip, type="endpoint",
        hostname=f"source-endpoint-{random.randint(1,100)}", mac=generate_mac(),
        next_hop_interface=f"eth0", nexthop_int_ip=generate_ip("192.168"), # IP of next hop switch/router port
        device_id=f"ENDPOINT_NIC"
    ))
    for i in range(2, num_hops + 1):
        device_type = random.choice(["L2 Switch", "L3 Switch"])
        hop_identifier = generate_mac() if device_type == "L2 Switch" else generate_ip("192.168")
        hops.append(DetailedHop(
            hop=i, ip=hop_identifier, type=device_type, mac=generate_mac() if device_type != "L2 Switch" else None, # MAC is primary ID for L2 Switch
            hostname=f"{device_type.replace(' ', '-')}-{chr(65+i)}{random.randint(1,5)}",
            next_hop_interface=f"Gi{random.randint(1,4)}/{random.randint(0,47)}",
            nexthop_int_ip=dg if i == num_hops else generate_ip("192.168"),
            device_id=f"SWITCH_{random.randint(1000, 9999)}",
            vrf=f"VRF-{chr(65+random.randint(0,2))}" if "L3" in device_type else None
        ))
    hops.append(DetailedHop(
        hop=num_hops + 1, ip=dg, type="L3 Router Interface", mac=generate_mac(),
        hostname="default-gateway-router", nexthop_int_ip=None,
        next_hop_interface=f"Vlan{random.randint(10,99)}",
        device_id=f"ROUTER_{random.randint(100, 999)}",
        vrf=f"VRF-{chr(65+random.randint(0,2))}"
    ))
    print(f"Returning {len(hops)} dummy MAC hops (DetailedHop model)")

    # Save to History
    input_data = {"endpoint_ip": ip, "gateway_ip": dg}
    save_to_history(
        trace_type="mac", source_id=ip, destination_id=dg,
        input_details=input_data, user=current_user,
        source_mac_hops=hops # Store result in source_mac_trace field for simplicity
    )

    return hops


@app.get("/get-route-trace", summary="Get Route Trace (Handles Direct/Combined)", response_model=List[DetailedHop])
async def get_route_trace(
    source_ip: str = Query(...),            # For Combined: Original Source IP. For Direct: Source Gateway IP.
    destination_ip: str = Query(...),       # For Combined: Original Dest IP. For Direct: Dest Gateway IP.
    source_dg: Optional[str] = Query(None),     # For Combined: Source GW. For Direct: Source GW.
    destination_dg: Optional[str] = Query(None), # For Combined: Dest GW. For Direct: Dest GW.
    vrf: Optional[str] = Query(None),            # VRF context (Required for Direct Trace by frontend validation)
    current_user: dict = Depends(verify_dummy_token) # Verify user token
):
    """
    Simulates the IP network path trace and saves Combined/Direct results to history.
    Requires MAC traces to be called separately for Combined trace history enrichment.
    """
    # Determine trace type based on inputs matching
    is_direct_trace_by_gateways = (source_ip == source_dg) and (destination_ip == destination_dg) and vrf

    trace_type = "direct" if is_direct_trace_by_gateways else "combined"
    input_data = { # Store all inputs provided
        "source_ip": source_ip, "destination_ip": destination_ip,
        "source_dg": source_dg, "destination_dg": destination_dg,
        "vrf": vrf
    }

    print(f"Requesting Route trace:")
    if is_direct_trace_by_gateways:
        print(f"  Type:           Direct Trace (Gateways)")
        print(f"  Source Gateway: {source_dg}")
        print(f"  Dest Gateway:   {destination_dg}")
        print(f"  VRF Context:    {vrf}")
        history_source_id = source_dg # Primary ID for direct is gateway
        history_dest_id = destination_dg
    else:
        print(f"  Type:           Combined Trace (IP Path Only)") # This endpoint now only does IP path
        print(f"  Source IP:      {source_ip}")
        print(f"  Destination IP: {destination_ip}")
        print(f"  Source DG:      {source_dg if source_dg else 'Not Provided'}") # Context for path
        print(f"  Dest DG:        {destination_dg if destination_dg else 'Not Provided'}") # Context for path
        print(f"  VRF Context:    {vrf if vrf else 'Global'}")
        history_source_id = source_ip # Primary ID for combined is endpoint IP
        history_dest_id = destination_ip
    print(f"  User:           {current_user['username']}")

    # --- Validation --- (Backend reinforces frontend)
    if is_direct_trace_by_gateways and not vrf:
         print("(!) Direct Trace requested but VRF is missing!")
         raise HTTPException(status_code=422, detail=[{"loc": ["query", "vrf"], "msg": "Field required for Direct Trace", "type": "value_error"}])
    # Combined trace requires endpoints and gateways for context
    if not is_direct_trace_by_gateways and (not source_ip or not destination_ip or not source_dg or not destination_dg):
         print("(!) Combined Trace (IP Path) requested but missing required IPs/DGs!")
         raise HTTPException(status_code=422, detail=[{"loc": ["query"], "msg": "Missing required fields for Combined Trace IP Path", "type": "value_error"}])

    await asyncio.sleep(0.8 + random.uniform(0, 0.5)) # Simulate trace delay

    if random.random() < SIMULATE_ERRORS_CHANCE:
        print("(!) Simulating Route trace error")
        raise HTTPException(status_code=500, detail="Simulated backend error during Route trace")

    hops_data = []
    num_hops = random.randint(5, 15)
    current_subnet_prefix = f"10.{random.randint(1, 254)}"
    passed_fw = False
    current_vrf = vrf # Start with the provided VRF context

    # Determine the effective start and end points for the IP trace simulation
    start_hop_ip = source_dg # Trace starts from the source gateway
    final_dest_ip = destination_dg # Trace ends *at* the destination gateway

    for i in range(1, num_hops + 1):
        is_first_hop = (i == 1)
        is_last_hop = (i == num_hops)
        hop_type = random.choice(['router', 'firewall', 'router', 'router'])

        # Determine IP for the hop
        if is_last_hop:
            hop_ip = final_dest_ip # Last hop is always the target destination gateway
            hop_type = "router"
            hostname = f"dest-gw-router-{random.randint(1,5)}.core.net"
        elif is_first_hop:
            hop_ip = start_hop_ip # First hop is always the provided starting source gateway
            hop_type = "router"
            hostname = f"start-gw-router-{chr(65+random.randint(0,3))}.core.net"
        else:
             if random.random() < 0.2: current_subnet_prefix = f"10.{random.randint(1, 254)}"
             hop_ip = f"{current_subnet_prefix}.{random.randint(1,5)}.{random.randint(2, 254)}"
             hostname = f"{hop_type}-{chr(65+i)}{random.randint(1,10)}.infra.net"

        # Determine next hop IP (used for display/context)
        if is_last_hop:
            nexthop_int_ip = None # End of trace
        elif i == num_hops - 1:
             nexthop_int_ip = final_dest_ip # Next hop is the final destination gateway
        else:
            next_prefix = current_subnet_prefix if random.random() < 0.8 else f"10.{random.randint(1, 254)}"
            nexthop_int_ip = f"{next_prefix}.{random.randint(1,5)}.{random.randint(2, 254)}"

        # Simulate VRF usage - stick to provided VRF if direct trace
        if not is_direct_trace_by_gateways: # Only simulate changes if combined trace
            if i > 2 and random.random() < 0.15:
                 current_vrf = f"VRF-{chr(65+random.randint(0,4))}" if random.random() > 0.3 else None
            elif i == 1 and not current_vrf: # Assign a default VRF if none provided initially
                 current_vrf = "VRF-DEFAULT" if random.random() > 0.5 else None

        hop_details = DetailedHop(
            hop=i, ip=hop_ip, type=hop_type, hostname=hostname, mac=generate_mac(),
            destination_network=f"{destination_ip}/32" if not is_last_hop else None, # Always point towards original dest *endpoint* IP for context
            vrf=current_vrf, # Use the current simulated VRF (respects input VRF for direct)
            mpls_label=str(random.randint(10000, 50000)) if random.random() > 0.6 else None,
            passed_firewall=passed_fw, nexthop_int_ip=nexthop_int_ip,
            device_id=f"NODE_{random.randint(10000, 99999)}",
            # destination_dg_ip=destination_dg # Don't need this as trace ends at dest DG
        )
        if hop_type == 'firewall': passed_fw = True
        hops_data.append(hop_details)

    print(f"Generated {len(hops_data)} dummy route hops (DetailedHop model).")

    # --- Save to History ---
    # Note: For Combined traces, this only saves the IP path. MAC paths must be saved via get_mac_trace calls.
    # This approach simplifies this endpoint but requires the frontend to potentially update
    # a history entry later if it performs MAC traces related to a Combined trace.
    # Alternatively, the frontend could perform all 3 calls (IP, MAC src, MAC dst) and then make
    # a *new* backend call like `/save-combined-trace` to store all results at once.
    # For this dummy implementation, we save the IP path here.
    save_to_history(
        trace_type=trace_type, source_id=history_source_id, destination_id=history_dest_id,
        input_details=input_data, user=current_user, main_hops=hops_data
    )

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
    return {"message": "Dummy RouteTrace Backend V3 (Universal History) is running!"}

# --- Main Execution ---
if __name__ == "__main__":
    import uvicorn
    print("Starting dummy backend server V3 on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
