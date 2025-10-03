// A helper function to communicate with the MikroTik REST API
// Ensure you have enabled the 'www-ssl' service on your MikroTik router
// and created a user with appropriate permissions.

interface MikrotikUser {
    name: string;
    pass: string;
    limitUptime: string;
    comment: string;
}

export async function createMikrotikUser(user: MikrotikUser): Promise<void> {
    const MIKROTIK_HOST = Deno.env.get('MIKROTIK_HOST');
    const MIKROTIK_API_USER = Deno.env.get('MIKROTIK_API_USER');
    const MIKROTIK_API_PASSWORD = Deno.env.get('MIKROTIK_API_PASSWORD');

    if (!MIKROTIK_HOST || !MIKROTIK_API_USER || !MIKROTIK_API_PASSWORD) {
        throw new Error("MikroTik environment variables for REST API are not set");
    }

    const url = `https://${MIKROTIK_HOST}/rest/ip/hotspot/user`;

    // The body for the REST API request
    const body = {
        "name": user.name,
        "password": user.pass,
        "limit-uptime": user.limitUptime,
        "comment": user.comment,
    };

    const response = await fetch(url, {
        method: 'PUT', // In MikroTik REST API, PUT is used for 'add'
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${MIKROTIK_API_USER}:${MIKROTIK_API_PASSWORD}`),
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create MikroTik user: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log(`Successfully created MikroTik user: ${user.name}`);
}