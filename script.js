// Function to create and append the dropdown dynamically
async function createDropdown(item) {
    // Create the dropdown container
    let dropdownContainer = document.createElement("div");
    dropdownContainer.classList.add("dropdown");

    // Create the dropdown button
    let dropdownButton = document.createElement("button");
    dropdownButton.classList.add("dropbtn");
    dropdownButton.textContent = "Select Time";

    // Create the dropdown content
    let dropdownContent = document.createElement("div");
    dropdownContent.classList.add("dropdown-content");

    // Create and append the links based on the date/time data from the API
    let weatherData = await getWeather(item.latitude, item.longitude);
    let { time, temperature_2m, apparent_temperature, wind_speed_10m, cloud_cover, relative_humidity_2m, weather_code } = weatherData.hourly;

    for (let i = 0; i < time.length; i++) {
        let link = document.createElement("a");
        link.href = "#";
        link.textContent = formatDate(time[i]);

        // Add a click event listener to each link
        link.addEventListener("click", function () {
            // Update the display with data for the selected time
            updateDisplay(time[i], temperature_2m[i], apparent_temperature[i], wind_speed_10m[i], cloud_cover[i], relative_humidity_2m[i], weather_code[i], item);
        });

        dropdownContent.appendChild(link);
    }

    // Initially hide the dropdown content
    dropdownContent.style.display = "none";

    // Toggle the visibility of the dropdown content when the button is clicked
    dropdownButton.addEventListener("click", function () {
        if (dropdownContent.style.display === "none") {
            dropdownContent.style.display = "block";
        } else {
            dropdownContent.style.display = "none";
        }
    });

    // Append button and content to the dropdown container
    dropdownContainer.appendChild(dropdownButton);
    dropdownContainer.appendChild(dropdownContent);

    // Append the dropdown container to the toggle element
    toggle.appendChild(dropdownContainer);
}

// Function to update the display with data for the selected time
// Store the initial display information in a variable
let initialDisplayInfo = `
    <div class="center lookGood bold">
        <h1></h1>
        <h2></h2>
    </div>
`;

// Function to update the display with data for the selected time
// Function to update the display with data for the selected time
function updateDisplay(time, temperature, apparentTemperature, windSpeed, cloudCover, humidity, weatherCode, item) {
    // Clear previous data
    display.innerHTML = '';
    document.querySelector(".dropdown-content").style.display = "none";

    // Append the new data
    display.innerHTML += `
        <div class="center lookGood bold">
            <h1>${item.name}</h1>
            <h2>${item.admin1}, ${item.country}</h2>
        </div>

    
        <div class="data">
            <div class="flex jcsa">
                ${createDatum("Time: ", formatDate(time))}
            </div>
            <div class="flex jcsa">
                ${createDatum("Temperature: ", formatTemperature(temperature))}
                ${createDatum("Apparent Temperature: ", formatTemperature(apparentTemperature))}
            </div>
            <div class="flex jcsa">
                ${createDatum("Cloud Cover: ", cloudCover + "%")}
                ${createDatum("Relative Humidity: ", humidity + "%")}
                ${createDatum("Wind Speed: ", windSpeed + " km/h")}
            </div>
            <div class="flex jcsa">
                ${createDatum("Weather Code: ", weatherCode)}
            </div>
        </div>
    `;
}




/**
 * https://open-meteo.com/en/docs
 * 
 * async searchLocation
 * @param {string} query - Location provided by user
 * Should return an array of locations, fetched from the Geocoding API
 */
const currentDate = new Date();
const currentHour = currentDate.getHours()
//Calling the geocoding api
async function searchLocation(query) {
    let res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=en&format=json`)
    let data = await res.json()
    // console.log("searchLocation", data.results[0])
    return data.results
}

    
/**
 * async getWeather
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * returns weather data
 */

//Calling the function, you must add the data that you want to recieve at the end of the url
async function getWeather(lat, lng) {
    // https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m
    let res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,apparent_temperature,wind_speed_10m,cloud_cover,relative_humidity_2m,weather_code`)
    let data = await res.json()
    return data

}

async function getDailyWeather(lat, lng) {
    // https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m
    let res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min`)
    let data = await res.json()
    return data
}
//Setting up the html links
let resultEl = document.querySelector("#search-results")
let input = document.querySelector("#input-elements input")
let button = document.querySelector("#input-elements button")
let display = document.querySelector("#display-data")
let toggle = document.querySelector("#toggle-time")


input.addEventListener("input", async function() {
    let results = await searchLocation(input.value)
    if (!results) return
    let html = ""
    for(let x=0; x<results.length; x++) {
        if (x > 5) break
        let item = results[x]
        html += renderSearchResult(x, item)
        
        // setTimeout(callback, milliseconds)
        setTimeout(function(){
            renderWeatherData(x, item)
        })
    }
    resultEl.innerHTML = html
})





function renderSearchResult(x, item) {
    return `
        <div class="result">
            <button id="result-${x}">${item.name}, ${item.admin1}, ${item.country}</button>
        </div>
    `
}

function renderWeatherData(x, item) {    
    document.querySelector(`#result-${x}`).addEventListener('click', async function(){
        // // render your temperature button here?
        resultEl.innerHTML = ``
        display.innerHTML = ``
        toggle.innerHTML = ``
        display.innerHTML = `
        <div class="center lookGood bold">
            <h1>${item.name}</h1>
            <h2>${item.admin1}, ${item.country}</h2>
        </div>
        `
        // What happens when the user clicks select?
        let lat = item.latitude
        let lng = item.longitude
        // call getWeather
        let weatherData = await getWeather(lat, lng)
        let dailyWeatherData = await getDailyWeather(lat, lng)

        // this is called object destructuring. there is also array destructuring.
        let { 
            temperature_2m: temperature, 
            time, 
            apparent_temperature: apparentTemperature, 
            wind_speed_10m: windSpeed,
            cloud_cover: cloudCover,
            relative_humidity_2m: Humidity,
            weather_code: weatherCode
        } = weatherData.hourly

        let {
            temperature_2m_max: maxTemp,
            temperature_2m_min: minTemp
        } = dailyWeatherData.daily


        display.innerHTML += `
        <div class="data">
            <div class="flex jcsa">
                ${createDatum("Time: ", formatDate(time[currentHour]))}
            </div>
            <div class="flex jcsa">
                ${createDatum("Temperature: ", (formatTemperature(temperature[currentHour])))}
                ${createDatum("Apparent Temperature: ", formatTemperature(apparentTemperature[currentHour]))}

            </div>
            <div class="flex jcsa">
                ${createDatum("Maximum Temperature: ", formatTemperature(maxTemp[0]))}
                ${createDatum("Minimum Temperature: ", formatTemperature(minTemp[0]))}

            </div>
            <div class="flex jcsa">
                ${createDatum("Cloud Cover: ", cloudCover[currentHour] + "%")}
                ${createDatum("Relative Humdity: ", Humidity[currentHour] + "%")}
                ${createDatum("Wind Speed: ", windSpeed[currentHour] + " km/h")}
            </div>
            <div class="flex jcsa">
                ${createDatum("Weather Code: ", weatherCode[currentHour])}
            </div>


        </div>
        `
        await createDropdown(item);






    })
}

function createDatum(label, datum) {
    return `
    <div class="weather-datum lookGood">
        <div>
            ${label}
            ${datum}
        </div>
    </div>
    `
}

/**
 * formatDate
 * @param {string} dateString
 * returns a string like this = "May 21, 1999 - 15:31"
 */
function formatDate(dateString) {
    let date = new Date(dateString)
    let hour = date.getHours()

    let minute = date.getMinutes()
    let month = date.getMonth()
    let year = date.getFullYear()
    let monthNum = ["January", "Februrary", "March", "April", "May", "June", "July", "August", "September", "October", "Novemmber", "December"]
    let day = date.getDate()
    let period = "am"
    if(hour>=12) {
        period = "pm"
    }
    if(hour >= 13) {
        hour -= 12
    }
    if(hour === 0){
        hour = 12
    }
    let res = `${monthNum[month]} ${day}, ${year} - ${hour}:${minute}0 ${period} `
    return res

}
function formatTemperature(temperature) {
    let Fahrenheit = (temperature * 9/5) + 32
    return Math.round(Fahrenheit)
}

