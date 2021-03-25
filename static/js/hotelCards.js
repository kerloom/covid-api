// const BASE_URL = "http://localhost:5000/";
const BASE_URL = "https://api.safetravel.world";
const FLIGHTS_COUNTRY_CLASS = 'mewtwo-flights-destination-country__name';
const FLIGHTS_PLACE_CLASS = 'mewtwo-flights-destination-country__pseudo';
const HOTELS_COUNTRY_CLASS = 'mewtwo-hotels-city-location__name';
const HOTELS_PLACE_CLASS = 'mewtwo-hotels-city-location__pseudo';
var TRAVEL_ID;
var FLIGHTS_FORM_ID;
var HOTELS_FORM_ID;
var FLIGHTS_BTN_QUERY_SELECTOR;
var HOTELS_BTN_QUERY_SELECTOR;
var FLIGHTS_LOGO_QUERY_SELECTOR;
var HOTELS_LOGO_QUERY_SELECTOR;

var lang = window.location.pathname.split("/")[1];
lang = lang.length === 2 ? lang : 'en';
console.log(lang);
console.log(TRAVEL_ID);

async function getFlightCard() {
    var countrySpan = document.getElementsByClassName(FLIGHTS_COUNTRY_CLASS)[0]
    var placeSpan = document.getElementsByClassName(FLIGHTS_PLACE_CLASS)[0]
    var place = placeSpan.innerText.split('/')[0];
    var countryArray = countrySpan.innerText.split(',');
    var country = countryArray[countryArray.length -1];
    var placeQuery = place + ',' + country;

    const placeURL = encodeURI(`${BASE_URL}/api/v1/riesgo?lugar=${placeQuery}&lang=${lang}`);
    
    padre = document.getElementsByClassName('elementor-element elementor-element-6be373b elementor-widget elementor-widget-text-editor')[0]
    if(!padre) {
        padre = document.getElementsByClassName('elementor-element elementor-widget elementor-widget-text-editor')[0]
    }

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
    
    var flightForm = document.forms[FLIGHTS_FORM_ID];
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
    var countrySpan = document.getElementsByClassName(HOTELS_COUNTRY_CLASS)[0]
    var placeSpan = document.getElementsByClassName(HOTELS_PLACE_CLASS)[0]

    var countryArray = countrySpan.innerText.split(',');
    var country = countryArray[countryArray.length -1];

    let state = null;
    if (countryArray.length === 2) {
        place = placeSpan.innerText.trim();
    } else if (countryArray.length === 3) {
        if(!!country.match(/United.*States/)) {
            place = placeSpan.innerText.trim();
            state = countryArray[countryArray.length - 2].trim();
        } else {
            place = countryArray[countryArray.length - 2];
        }
    } else {
        console.error("Unexpected Input Error, could not get place")
    }

    var placeQuery = state ? place + ',' + state + ',' + country : place + ',' + country;

    const placeURL = encodeURI(`${BASE_URL}/api/v1/riesgo?lugar=${placeQuery}&lang=${lang}`);
    
    padre = document.getElementsByClassName('elementor-element elementor-element-6be373b elementor-widget elementor-widget-text-editor')[0]
    if(!padre) {
        padre = document.getElementsByClassName('elementor-element elementor-widget elementor-widget-text-editor')[0]
    }

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
    
    var hotelForm = document.forms[HOTELS_FORM_ID];
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
    TRAVEL_ID = document.body.getAttribute('data-inited_widgets');
    FLIGHTS_FORM_ID = `flights-form-${TRAVEL_ID}`;
    HOTELS_FORM_ID = `hotels-form-${TRAVEL_ID}`;
    FLIGHTS_BTN_QUERY_SELECTOR = `#flights-form-${TRAVEL_ID} > div.mewtwo-flights-submit_button.mewtwo-flights-submit_button--new > button`;
    HOTELS_BTN_QUERY_SELECTOR = `#hotels-form-${TRAVEL_ID} > div.mewtwo-hotels-submit_button.mewtwo-hotels-submit_button--new > button`;
    FLIGHTS_LOGO_QUERY_SELECTOR = `#main > div > div > div > section.elementor-section.elementor-top-section.elementor-element.elementor-element-6ac97bb.elementor-section-height-min-height.elementor-section-full_width.elementor-section-height-default.elementor-section-items-middle > div.elementor-container.elementor-column-gap-default > div > div > div > div > div.elementor-element.elementor-element-4cf0e52.elementor-widget.elementor-widget-text-editor > div.elementor-widget-container > div > div > div.mewtwo-widget.mewtwo-widget--${TRAVEL_ID} > section.mewtwo-flights.mewtwo-flights--virgin.mewtwo-tabs-container > div > section > div`
    HOTELS_LOGO_QUERY_SELECTOR = `#main > div > div > div > section.elementor-section.elementor-top-section.elementor-element.elementor-element-6ac97bb.elementor-section-height-min-height.elementor-section-full_width.elementor-section-height-default.elementor-section-items-middle > div.elementor-container.elementor-column-gap-default > div > div > div > div > div.elementor-element.elementor-element-4cf0e52.elementor-widget.elementor-widget-text-editor > div.elementor-widget-container > div > div > div.mewtwo-widget.mewtwo-widget--${TRAVEL_ID} > section.mewtwo-hotels.mewtwo-hotels--virgin.mewtwo-tabs-container > div > section > div`

    setCardCSS();

    var flightSearchButton = document.querySelector(FLIGHTS_BTN_QUERY_SELECTOR);
    var hotelSearchButton = document.querySelector(HOTELS_BTN_QUERY_SELECTOR);
    var flightSearchParent = flightSearchButton.parentElement;
    var hotelSearchParent = hotelSearchButton.parentElement;

    var newFlightSearchButton = document.createElement('button');
    newFlightSearchButton.innerText = "Safe Search";
    newFlightSearchButton.className = "button";
    newFlightSearchButton.addEventListener('click', function(e) {
        e.preventDefault();
        getFlightCard();
    });

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

    // var travelPayoutLogos = document.getElementsByClassName('tp_powered_by');
    // travelPayoutLogos.forEach((logo) => logo.remove());
    var travelPayoutsLogoFlights = document.querySelector(FLIGHTS_LOGO_QUERY_SELECTOR);
    travelPayoutsLogoFlights.remove();
    var travelPayoutsLogoHotels = document.querySelector(HOTELS_LOGO_QUERY_SELECTOR)
    travelPayoutsLogoHotels.remove();

}

window.addEventListener("load", function(){
    customizeDOM();
});