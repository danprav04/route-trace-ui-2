import apiClient from './api';

// Corresponds to get_default_gateway(ip: str)
const getDefaultGateway = async (ip) => {
    try {
        // Adjust endpoint if needed, e.g. '/network/default-gateway'
        // Pass IP as a query parameter named 'ip'
        const response = await apiClient.get('/get-default-gateway', { params: { ip } });
        // Assuming the backend returns the gateway IP directly or in a specific field
        // Example: return response.data.gateway;
        return response.data; // Modify based on actual backend response structure
    } catch (error) {
        console.error(`Failed to get default gateway for ${ip}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || `Failed to get DG for ${ip}`);
    }
};

// Corresponds to get_mac_trace(ip: str, dg: str)
const getMacTrace = async (ip, dg) => {
     try {
        // Adjust endpoint if needed
        // Pass ip and dg as query parameters
        const response = await apiClient.get('/get-mac-trace', { params: { ip, dg } });
        // Assuming backend returns the MAC trace data (e.g., list of hops)
        return response.data; // Modify based on actual backend response structure
    } catch (error) {
        console.error(`Failed to get MAC trace for ${ip} -> ${dg}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || `Failed to get MAC trace`);
    }
};

// Corresponds to get_route_trace (or potentially get_tufin_route - clarify which one to use)
// Using get_route_trace based on code snippets provided
const getRouteTrace = async (source_ip, destination_ip, source_dg = null, destination_dg = null, source_dg_name = null, destination_dg_name = null, vrf = null, destination_vrf = null) => {
    try {
        const params = {
            source_ip,
            destination_ip,
            // Add other params only if they have values
            ...(source_dg && { source_dg }),
            ...(destination_dg && { destination_dg }),
            ...(source_dg_name && { source_dg_name }),
            ...(destination_dg_name && { destination_dg_name }),
            ...(vrf && { vrf }),
            ...(destination_vrf && { destination_vrf }),
        };
        const response = await apiClient.get('/get-route-trace', { params });
         // Backend saves automatically, frontend just gets the result.
         // Assuming backend returns the full route trace data (e.g., list of hops)
        return response.data; // Modify based on actual backend response structure
    } catch (error) {
        console.error(`Failed to get route trace:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || `Failed to get route trace`);
    }
};


// Corresponds to get_user_routes() - uses POST in backend? Check method. Assuming POST for now.
const getUserRoutes = async () => {
    try {
        // Backend uses POST for get-user-routes, ensure token is sent via interceptor
        const response = await apiClient.post('/get-user-routes');
        // Assuming backend returns a list of routes
        // Response format likely: [{id, source, destination, route, timestamp, ...}, ...]
        return response.data; // Modify based on actual backend response structure
    } catch (error) {
        console.error(`Failed to get user routes:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || `Failed to get user routes`);
    }
};

// Corresponds to get_all_routes() - uses POST in backend? Check method. Assuming POST.
const getAllRoutes = async () => {
    try {
        // Backend uses POST for get-all-routes
        const response = await apiClient.post('/get-all-routes');
        // Assuming backend returns a list of all routes
        return response.data; // Modify based on actual backend response structure
    } catch (error) {
        console.error(`Failed to get all routes:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || `Failed to get all routes`);
    }
};


const routeService = {
    getDefaultGateway,
    getMacTrace,
    getRouteTrace,
    getUserRoutes,
    getAllRoutes,
};

export default routeService;