const modal = document.getElementById("destinationsModal");
const openModalBtn = document.getElementById("btn-recommend");

openModalBtn.onclick = function() {
  modal.style.display = "block";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

Vue.component('modal-html', async function(resolve, reject){
    console.log("fetching component");
    const placeURL = 'https://safetravel.world/choose-region/'
    res = await fetch(placeURL);
    html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
        const linkCss = doc.getElementById('elementor-post-803-css');
    document.getElementsByTagName('head')[0].appendChild(linkCss);
    innerHTML = doc.getElementById('main').innerHTML;
    resolve({template: innerHTML});
})

var app = new Vue({
    el: '#app',
    data: {

    },
    methods: {
        closeModal: function() {
            modal.style.display = "none";
        }
    }
  })

const closeModalBtn = document.getElementById("closeModal");
closeModalBtn.onclick = function() {
    
}