const LEV_TOLERANCE = 2; // levenshtein distance tolerance for fuzzy search
const MIN_QUERY_LENGTH = 2;

let elmMpList = document.querySelector(".mp-list");
let elmMpInput = document.querySelector(".mp-input");

let mapMpElm = {};

let mapMpnName = {};

let dummyGetMp = {"diane_abbot":{"name":"Diane Abbott","party":"Dance Party","constituency":"Hackney North and Stoke Newington","image":"https://members-api.parliament.uk/api/Members/172/Thumbnail","score":62.78333333333334,"rank":2,"policies":[{"name":"Stop climate change","score":76.8,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Diane_Abbott&mpc=Hackney_North_and_Stoke_Newington&house=commons&dmp=1030"},{"name":"In favour of HS2","score":50,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Diane_Abbott&mpc=Hackney_North_and_Stoke_Newington&house=commons&dmp=6753"},{"name":"In favour of further regulation of shale gas extraction (fracking)","score":62.5,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Diane_Abbott&mpc=Hackney_North_and_Stoke_Newington&house=commons&dmp=6741"},{"name":"In favour of increasing air passenger duty tax","score":31.9,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Diane_Abbott&mpc=Hackney_North_and_Stoke_Newington&house=commons&dmp=6699"},{"name":"Against on shore wind turbines","score":72.2,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Diane_Abbott&mpc=Hackney_North_and_Stoke_Newington&house=commons&dmp=6756"},{"name":"In favour of further incentives for low carbon energy generation","score":83.3,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Diane_Abbott&mpc=Hackney_North_and_Stoke_Newington&house=commons&dmp=6704"}]},"debbi_abrahams":{"name":"Debbie Abrahams","constituency":"Oldham East and Saddleworth","image":"https://photos.dodspeople.com/photos/80556.jpg","score":59.73333333333334,"rank":"A","policies":[{"name":"Stop climate change","score":81.3,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Debbie_Abrahams&mpc=Oldham_East_and_Saddleworth&house=commons&dmp=1030"},{"name":"In favour of HS2","score":75,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Debbie_Abrahams&mpc=Oldham_East_and_Saddleworth&house=commons&dmp=6753"},{"name":"In favour of further regulation of shale gas extraction (fracking)","score":37.5,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Debbie_Abrahams&mpc=Oldham_East_and_Saddleworth&house=commons&dmp=6741"},{"name":"In favour of increasing air passenger duty tax","score":21.3,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Debbie_Abrahams&mpc=Oldham_East_and_Saddleworth&house=commons&dmp=6699"},{"name":"Against on shore wind turbines","score":68.3,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Debbie_Abrahams&mpc=Oldham_East_and_Saddleworth&house=commons&dmp=6756"},{"name":"In favour of further incentives for low carbon energy generation","score":75,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Debbie_Abrahams&mpc=Oldham_East_and_Saddleworth&house=commons&dmp=6704"}]},"adam_afriyie":{"name":"Adam Afriyie","constituency":"Windsor","image":"https://members-api.parliament.uk/api/Members/1586/Thumbnail","email":"adam.afriyie.mp@parliament.uk","score":50.01666666666666,"rank":"B","policies":[{"name":"Stop climate change","score":28.7,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Adam_Afriyie&mpc=Windsor&house=commons&dmp=1030"},{"name":"In favour of HS2","score":62.5,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Adam_Afriyie&mpc=Windsor&house=commons&dmp=6753"},{"name":"In favour of further regulation of shale gas extraction (fracking)","score":50,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Adam_Afriyie&mpc=Windsor&house=commons&dmp=6741"},{"name":"In favour of increasing air passenger duty tax","score":89.4,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Adam_Afriyie&mpc=Windsor&house=commons&dmp=6699"},{"name":"Against on shore wind turbines","score":27.799999999999997,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Adam_Afriyie&mpc=Windsor&house=commons&dmp=6756"},{"name":"In favour of further incentives for low carbon energy generation","score":41.7,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Adam_Afriyie&mpc=Windsor&house=commons&dmp=6704"}]},"bim_afolami":{"name":"Bim Afolami","constituency":"Hitchin and Harpenden","image":"https://members-api.parliament.uk/api/Members/4639/Thumbnail","email":"bim.afolami.mp@parliament.uk","score":50,"rank":"D","policies":[{"name":"Stop climate change","score":0,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Bim_Afolami&mpc=Hitchin_and_Harpenden&house=commons&dmp=1030"},{"name":"In favour of HS2","score":100,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Bim_Afolami&mpc=Hitchin_and_Harpenden&house=commons&dmp=6753"},{"name":"In favour of further regulation of shale gas extraction (fracking)","score":100,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Bim_Afolami&mpc=Hitchin_and_Harpenden&house=commons&dmp=6741"},{"name":"In favour of increasing air passenger duty tax","score":100,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Bim_Afolami&mpc=Hitchin_and_Harpenden&house=commons&dmp=6699"},{"name":"Against on shore wind turbines","score":0,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Bim_Afolami&mpc=Hitchin_and_Harpenden&house=commons&dmp=6756"},{"name":"In favour of further incentives for low carbon energy generation","score":0,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Bim_Afolami&mpc=Hitchin_and_Harpenden&house=commons&dmp=6704"}]},"nigel_adams":{"name":"Nigel Adams","constituency":"Selby and Ainsty","image":"https://members-api.parliament.uk/api/Members/4057/Thumbnail","email":"nigel.adams.mp@parliament.uk","score":43.699999999999996,"rank":"E","policies":[{"name":"Stop climate change","score":28.9,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Nigel_Adams&mpc=Selby_and_Ainsty&house=commons&dmp=1030"},{"name":"In favour of HS2","score":50,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Nigel_Adams&mpc=Selby_and_Ainsty&house=commons&dmp=6753"},{"name":"In favour of further regulation of shale gas extraction (fracking)","score":50,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Nigel_Adams&mpc=Selby_and_Ainsty&house=commons&dmp=6741"},{"name":"In favour of increasing air passenger duty tax","score":100,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Nigel_Adams&mpc=Selby_and_Ainsty&house=commons&dmp=6699"},{"name":"Against on shore wind turbines","score":0,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Nigel_Adams&mpc=Selby_and_Ainsty&house=commons&dmp=6756"},{"name":"In favour of further incentives for low carbon energy generation","score":33.3,"url":"https://www.publicwhip.org.uk/mp.php?mpn=Nigel_Adams&mpc=Selby_and_Ainsty&house=commons&dmp=6704"}]}};
let dummyGetMps = {"diane_abbot": "Diane Abbott", "debbi_abrahams": "Debbie Abrahams", "adam_afriyie": "Adam Afriyie", "bim_afolami": "Bim Afolami", "nigel_adams": "Nigel Adams"};

let searchTimeoutId = null;

function addMpElm(mpn, data){
    let htmlBreakdown = "";

    data["policies"].forEach(function(policy){
        try {
            htmlBreakdown += `<div class="mp-breakdown-item"><a class="mp-breakdown-policy" target="_blank" href="${policy.url}">${policy.name}</a><span class="mp-breakdown-score">${policy.score.toFixed(2)}</span></div>`;
        } catch {}
    });

    // wrap htmlBreakdown
    htmlBreakdown = '<div class="mp-breakdown">' + htmlBreakdown + '</div>';


    let htmlMetaBox = "";
    htmlMetaBox += `<div class="mp-meta-box">`;

    htmlMetaBox += `<span class="mp-rank">#`;
    try{
        if((data.rank + '').length > 0){
            htmlMetaBox += `${data.rank}`;
        } else {
            htmlMetaBox += "N/A";
        }
    } catch {};
    htmlMetaBox += `</span>`;

    if ('image' in data) {
        htmlMetaBox += `<img src="${data.image}">`;
    }

    htmlMetaBox += `<div class="mp-meta">`;
    htmlMetaBox += `<h3 class="mp-name">${data.name}</h3>`;
    if ('party' in data) {
        htmlMetaBox += `<h5 class="mp-party">${data.party}</h5>`;
    }
    if ('constituency' in data) {
        htmlMetaBox += `<h5 class="mp-constituency">${data.constituency}</h5>`;
    }

    if(`email` in data)
    {
        
        htmlMetaBox += `<a href ="./email?mp=${data.name}&score=${data.score}&email=${data.email}" ><h5 class="mp-email">${data.email}</h5></a>`
    }
    htmlMetaBox += `</div>`;

    htmlMetaBox += `<span class="mp-score">`;
    /*htmlMetaBox += `<form action="./templates/pages/email.html" method="post">
    <button type="submit" name="MpName" value="${data.name}" class="btn-link">Email 📧</button>
    </form>`
    */

    try {
        if(data.score > 0) {
            htmlMetaBox += data.score.toFixed(2);
        } else {
            htmlMetaBox += "N/A";
        }
    } catch {}
    htmlMetaBox += `</span>`;
    htmlMetaBox += `</div>`;

    let html = htmlMetaBox + htmlBreakdown;
    

    let elmListItem = document.createElement("div");
    elmListItem.classList.add("mp-list-item");
    // elmListItem.classList.add("expanded");
    elmListItem.innerHTML = html;
    elmListItem.style.display = "none";

    // on click mp-meta box ...
    elmListItem.querySelector(".mp-meta-box").addEventListener("click", function() {
        toggleExpand(mpn);
    });


    mapMpElm[mpn] = elmListItem;
    elmMpList.appendChild(elmListItem);
}

function toggleExpand(mpn) {
    if (mpn in mapMpElm) {
        let expanded = mapMpElm[mpn].classList.contains("expanded");
        if(expanded) {
            mapMpElm[mpn].classList.remove("expanded");
        } else {
            mapMpElm[mpn].classList.add("expanded");
        }
    } else {
        console.log(mpn + " not loaded");
    }
}

function levDist(a, b){
    // https://gist.github.com/andrei-m/982927
    if(a.length == 0) return b.length; 
    if(b.length == 0) return a.length; 
  
    var matrix = [];
  
    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
      matrix[i] = [i];
    }
  
    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
      matrix[0][j] = j;
    }
  
    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
      for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                  Math.min(matrix[i][j-1] + 1, // insertion
                                           matrix[i-1][j] + 1)); // deletion
        }
      }
    }
  
    return matrix[b.length][a.length];
}


function reqMps(){
    if(Object.keys(mapMpnName).length <= 0){
        mapMpnName = dummyGetMps;
    }
}

function reqMp(mpn){
    return dummyGetMp[mpn];
}

function searchMpns(query){
    let ret = [];
    Object.keys(mapMpnName).forEach(function(k){
        let name = mapMpnName[k];
        let d = levDist(name.substr(0,query.length).toLowerCase(), query.toLowerCase());

        if (d <= LEV_TOLERANCE){
            ret.push(k);
        }
    });
    return ret;
}

function showMpns(mpns){
    reqMps();

    let all_mpns = Object.keys(mapMpnName);
    all_mpns.forEach(function(mpn){
        if(!(mpn in mapMpElm)){
            // req data from backend
            addMpElm(mpn, reqMp(mpn));
        }

        let elm = mapMpElm[mpn];
        if (mpns.includes(mpn)){
            elm.style.display = "block";
        } else {
            elm.style.display = "none";
        }
    });
}

function hideAllDomMps(){
    reqMps();

    let all_mpns = Object.keys(mapMpnName);
    all_mpns.forEach(function(mpn){
        if(mpn in mapMpElm){
            mapMpElm[mpn].style.display = "none";
        }
    });
}

function search(query) {
    console.log("Searching: " + query);

    reqMps();

    if(query.length > MIN_QUERY_LENGTH){
        let mpns = searchMpns(query);
        showMpns(mpns);
    }
    else {
        hideAllDomMps();
    }
}

function start(){
    elmMpInput.addEventListener("keyup", function() {
        if(searchTimeoutId !== null){
            clearTimeout(searchTimeoutId);
        }

        searchTimeoutId = setTimeout(function() {
            search(elmMpInput.value);
        }, 200);
    });
}

start();