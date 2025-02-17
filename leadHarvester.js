// leadHarvester.js is a Node.js script that uses the Yelp API to find chef leads in a specific location.
const axios = require("axios");
const fs = require("fs");


// Configuration & Constants

// Replace 'YOUR_YELP_API_KEY' with your actual Yelp API Key.
const API_KEY = "IWRoHxAjRNDT8HbcNi3aHxcgRQDn8iV6ZhG3WxYrlslW-kzy5jLgIf2_jN64-Bo7IsaVIlNP-l0HAg3SV4dA1qUOdBNShvFsZO94PVgZNF0o1jNpCVOn3OWPEnOyZ3Yx";
// Yelp API base URL for business search.
const BASE_URL = "https://api.yelp.com/v3/businesses/search";
// HTTP headers including the API Key for authentication.
const HEADERS = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
};


// This function fetches restaurant data from the Yelp API for a given location.
// It accepts parameters: location (string), offset (number for pagination), and limit (number of results per request).
async function getRestaurants(location, offset = 0, limit = 50) {
    try {
        // Make a GET request to the Yelp API with specified parameters.
        const response = await axios.get(BASE_URL, {
            headers: HEADERS,
            params: {
                term: "restaurant", // Searching for restaurants as a proxy for chef-related businesses.
                location: location,
                limit: limit,
                offset: offset
            }
        });

        // Returns the array of business objects.
        return response.data.businesses;
    } catch (error) {
        // Log any errors and return an empty array if the request fails.
        console.error(`Error fetching data: ${error.message}`);
        return [];
    }
}

// This function extracts the relevant lead information from a business object.
// It returns an object containing the chef's name, phone, address, and Yelp URL.
function extractLeadInfo(business) {
    return {
        name: business.name,
        phone: business.phone || "Not available",
        // The address is joined into a single string.
        address: business.location.display_address.join(", "),
        yelp_url: business.url
    };
}


// This function collects chef leads by repeatedly calling getRestaurants().
// It uses pagination (offset) to gather multiple pages of results until a maximum number of leads is reached.
async function harvestLeads(location, maxLeads = 500) {
    let leads = [];  // Array to store lead objects.
    let offset = 0;  // Starting offset for pagination.
    const limit = 50; // Maximum number of results per API call (as per Yelp API constraints).

    // Continue fetching until we have collected the desired number of leads.
    while (leads.length < maxLeads) {
        console.log(`Fetching leads from offset: ${offset}`);
        // Fetch a page of businesses from the API.
        const businesses = await getRestaurants(location, offset, limit);
        // If no businesses are returned, break out of the loop.
        if (!businesses.length) break;

        // Extract lead info from each business and add it to our leads array.
        businesses.forEach(business => leads.push(extractLeadInfo(business)));

        // Increment offset to fetch the next set of results.
        offset += limit;
        // Wait for 1 second to respect API rate limits.
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return leads;
}

// This function writes the collected leads to a CSV file.
// It formats the data as a CSV string and saves it to the specified filename.
function saveLeadsToFile(leads, filename = "chef_leads.csv") {
    // Start with a header row for the CSV.
    let csvContent = "Name,Phone,Address,Yelp_URL\n";
    // Append each lead's information as a new row.
    leads.forEach(lead => {
        csvContent += `"${lead.name}","${lead.phone}","${lead.address}","${lead.yelp_url}"\n`;
    });
    // Write the CSV string to a file using the fs module.
    fs.writeFileSync(filename, csvContent, "utf-8");
    console.log(`Leads saved to ${filename}`);
}

// This function ties together all other functions to execute the lead harvesting process.
async function main() {
    // Define the location to search for restaurants. You can change this as needed.
    const location = "New York, NY";
    console.log(`Starting lead harvesting for ${location}`);

    // Call harvestLeads to fetch the desired number of leads.
    const leads = await harvestLeads(location, 500);
    // Save the leads to a CSV file.
    saveLeadsToFile(leads);
    console.log(`Total leads collected: ${leads.length}`);
}

// Run the main function to start the script.
main();