// const BASE_URL = "http://localhost:5000/";
const BASE_URL = "https://api.safetravel.world";

async function getCard(lugar, button) {
    const placeURL = `${BASE_URL}/api/v1/riesgo?lugar=${lugar}`
    
    padre = document.querySelector("#main > div > div > div > section.elementor-element.elementor-element-6ac97bb.elementor-section-height-min-height.elementor-section-full_width.elementor-section-height-default.elementor-section-items-middle.elementor-section.elementor-top-section > div.elementor-container.elementor-column-gap-default > div > div > div > div")

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
    
    var flightForm = document.forms['flights-form-77cef673a05f5702ee664a5dcf33db8a'];
    var flightSearchBtn = document.createElement('button');
    flightSearchBtn.innerText = "Go to Flights";
    flightSearchBtn.className = "button"
    flightSearchBtn.addEventListener('click', function(e) {
        flightForm.submit();
    });

    cardDiv.appendChild(flightSearchBtn);

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

    var originalSearchButton = document.querySelector("#flights-form-77cef673a05f5702ee664a5dcf33db8a > div.mewtwo-flights-submit_button.mewtwo-flights-submit_button--new > button");
    var searchParent = originalSearchButton.parentElement;
    var searchBar = document.getElementsByName('destination_name')[0]

    var newSearchButton = document.createElement('button');
    newSearchButton.innerText = "Safe Search";
    newSearchButton.className = "button";
    newSearchButton.addEventListener('click', function(e) {
        e.preventDefault();
        getCard(searchBar.value);
    });

    searchParent.removeChild(originalSearchButton);
    searchParent.appendChild(newSearchButton);

}

window.addEventListener("load", function(){
    customizeDOM();
});