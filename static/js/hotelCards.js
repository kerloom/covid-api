// const BASE_URL = "http://localhost:5000/";
const BASE_URL = "https://api.safetravel.world";

async function getFlightCard() {
    var countrySpan = document.getElementsByClassName('mewtwo-flights-destination-country__name')[0]
    var placeSpan = document.getElementsByClassName('mewtwo-flights-destination-country__pseudo')[0]
    var place = placeSpan.innerText.split('/')[0];
    var countryArray = countrySpan.innerText.split(',');
    var country = countryArray[countryArray.length -1];
    var placeQuery = place + ',' + country;

    const placeURL = encodeURI(`${BASE_URL}/api/v1/riesgo?lugar=${placeQuery}`)
    
    padre = document.querySelector("#main > div > div > div > section.elementor-element.elementor-element-6ac97bb.elementor-section-height-min-height.elementor-section-full_width.elementor-section-height-default.elementor-section-items-middle.elementor-section.elementor-top-section > div.elementor-container.elementor-column-gap-default > div > div > div > div > div.elementor-element.elementor-element-4cf0e52.elementor-widget.elementor-widget-text-editor")

    res = await fetch(placeURL);
    htmlString = await res.text();

    containers = document.getElementsByClassName("safety-index-container");
    if(containers.length > 0) {
        containers[0].remove();
    }

    var cardDiv = document.createElement('div');
    cardDiv.className = "safety-index-container"
    cardDiv.innerHTML = htmlString.trim();
    padre.appendChild(cardDiv);
    
    var flightForm = document.forms['flights-form-5cb3fab1e8378060368033cb45a116b8'];
    var flightSearchBtn = document.createElement('button');
    flightSearchBtn.innerText = "Go to Flights";
    flightSearchBtn.className = "button"
    flightSearchBtn.style.fontSize = "1.3em"
    flightSearchBtn.addEventListener('click', function(e) {
        flightForm.submit();
    });

    cardDiv.appendChild(flightSearchBtn);

}

async function getHotelCard() {
    var place;
    var countrySpan = document.getElementsByClassName('mewtwo-hotels-city-location__name')[0]
    var placeSpan = document.getElementsByClassName('mewtwo-hotels-city-location__pseudo')[0]

    var countryArray = countrySpan.innerText.split(',');
    var country = countryArray[countryArray.length -1];

    if (countryArray.length === 2) {
        place = placeSpan.innerText.trim();
    } else if (countryArray.length === 3) {
        place = countryArray[countryArray.length -2];
    } else {
        console.error("Unexpected Input Error, could not get place")
    }

    var placeQuery = place + ',' + country;

    const placeURL = encodeURI(`${BASE_URL}/api/v1/riesgo?lugar=${placeQuery}`)
    
    padre = document.querySelector("#main > div > div > div > section.elementor-element.elementor-element-6ac97bb.elementor-section-height-min-height.elementor-section-full_width.elementor-section-height-default.elementor-section-items-middle.elementor-section.elementor-top-section > div.elementor-container.elementor-column-gap-default > div > div > div > div > div.elementor-element.elementor-element-4cf0e52.elementor-widget.elementor-widget-text-editor")

    res = await fetch(placeURL);
    htmlString = await res.text();

    containers = document.getElementsByClassName("safety-index-container");
    if(containers.length > 0) {
        containers[0].remove();
    }

    var cardDiv = document.createElement('div');
    cardDiv.className = "safety-index-container"
    cardDiv.innerHTML = htmlString.trim();
    padre.appendChild(cardDiv);
    
    var hotelForm = document.forms['hotels-form-5cb3fab1e8378060368033cb45a116b8'];
    var hotelSearchBtn = document.createElement('button');
    hotelSearchBtn.innerText = "Go to Hotels";
    hotelSearchBtn.className = "button"
    hotelSearchBtn.style.fontSize = "1.3em"
    hotelSearchBtn.addEventListener('click', function(e) {
        hotelForm.submit();
    });

    cardDiv.appendChild(hotelSearchBtn);

}

function setCardCSS() {
    const cssURL = `${BASE_URL}/static/css/style.css`

    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', cssURL);
    document.getElementsByTagName('head')[0].appendChild(link);
}

function customizeDOM(){
    setCardCSS();

    var flightSearchButton = document.querySelector("#flights-form-5cb3fab1e8378060368033cb45a116b8 > div.mewtwo-flights-submit_button.mewtwo-flights-submit_button--new > button");
    var hotelSearchButton = document.querySelector("#hotels-form-5cb3fab1e8378060368033cb45a116b8 > div.mewtwo-hotels-submit_button.mewtwo-hotels-submit_button--new > button");
    var flightSearchParent = flightSearchButton.parentElement;
    var hotelSearchParent = hotelSearchButton.parentElement;

    var newFlightSearchButton = document.createElement('button');
    newFlightSearchButton.innerText = "Safe Search";
    newFlightSearchButton.className = "button";
    newFlightSearchButton.addEventListener('click', function(e) {
        e.preventDefault();
        getFlightCard();
    });
    var hotelSearchButton = document.querySelector("#hotels-form-5cb3fab1e8378060368033cb45a116b8 > div.mewtwo-hotels-submit_button.mewtwo-hotels-submit_button--new > button");

    var newHotelSearchButton = document.createElement('button');
    newHotelSearchButton.innerText = "Safe Search!";
    newHotelSearchButton.className = "button";
    newHotelSearchButton.addEventListener('click', function(e) {
        e.preventDefault();
        getHotelCard();
    });

    flightSearchParent.removeChild(flightSearchButton);
    flightSearchParent.appendChild(newFlightSearchButton);

    hotelSearchParent.removeChild(hotelSearchButton);
    hotelSearchParent.appendChild(newHotelSearchButton);

    var travelPayoutsLogoFlights = document.querySelector("#main > div > div > div > section > div.elementor-container.elementor-column-gap-default > div > div > div > div > div.elementor-element.elementor-element-4cf0e52.elementor-widget.elementor-widget-text-editor > div > div > p > div > div.mewtwo-widget.mewtwo-widget--5cb3fab1e8378060368033cb45a116b8 > section.mewtwo-flights.mewtwo-flights--virgin.mewtwo-tabs-container > div > section > div");
    travelPayoutsLogoFlights.remove();
    var travelPayoutsLogoHotels = document.querySelector("#main > div > div > div > section > div.elementor-container.elementor-column-gap-default > div > div > div > div > div.elementor-element.elementor-element-4cf0e52.elementor-widget.elementor-widget-text-editor > div.elementor-widget-container > div > p > div > div.mewtwo-widget.mewtwo-widget--5cb3fab1e8378060368033cb45a116b8 > section.mewtwo-hotels.mewtwo-hotels--virgin.mewtwo-tabs-container > div > section > div");
    travelPayoutsLogoHotels.remove();

}

window.addEventListener("load", function(){
    customizeDOM();
});