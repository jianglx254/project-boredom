// 🚨 PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzSEJKlrbjpdQcsZvqK9FNe7yd5ab5KQ9a9tIi-z0UJlkLa6Ybe2CMpHEz82x3gYyMjYA/exec"; 

async function fetchProductivityData() {
    try {
        // 1. Fetch data from your Google Sheet API
        const response = await fetch(APPS_SCRIPT_URL);
        const data = await response.json();
        
        // 2. Find the last entry (the latest data you entered)
        const dailyLogs = data.daily_data; 
        const latestLog = dailyLogs[dailyLogs.length - 1]; 
        
        // 3. Extract the Deep Work Hours value. 
        // NOTE: This key must exactly match the header in your Google Sheet!
        const deepWorkHours = latestLog['Deep Work Hours']; 
        
        // 4. Update the HTML element on the dashboard
        const deepWorkElement = document.getElementById('deepWorkValue');
        
        // Ensure the value is a number before using toFixed
        if (typeof deepWorkHours === 'number') {
            deepWorkElement.textContent = `${deepWorkHours.toFixed(1)} hrs`;
        } else {
             deepWorkElement.textContent = `${deepWorkHours} hrs`;
        }
        
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        document.getElementById('deepWorkValue').textContent = "Connection Error";
    }
}

// Start the data fetch when the dashboard loads
fetchProductivityData();
