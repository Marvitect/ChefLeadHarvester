# Chef Lead Harvester

This Node.js script fetches chef lead information using the Yelp API and outputs the data to a CSV file.

## Prerequisites
- Node.js installed on your system
- A valid Yelp API key

## Features
- Fetches restaurant data from the Yelp API.
- Extracts and formats chef lead information.
- Iterates using pagination to collect up to 500 leads.
- Saves the collected leads in CSV format.

## Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Replace `YOUR_YELP_API_KEY` in `leadHarvester.js` with your actual Yelp API key.

## Running the Script
Execute the following command in the terminal:

```bash
node leadHarvester.js