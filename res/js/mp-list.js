const LEV_TOLERANCE = 2; // levenshtein distance tolerance for fuzzy search
const MIN_QUERY_LENGTH = 2;

let elmMpList = document.querySelector(".mp-list");

let mapMpElm = {};

let mapMpnName = {};

let searchTimeoutId = null;

function addMpElm(mpn, data, policy_only=false){
    let htmlBreakdown = "";

    if(!policy_only) {
        if ('policies' in data) {
            try {
                data["policies"].forEach(function (policy) {
                    try {
                        htmlBreakdown += `<div class="mp-breakdown-item"><a class="mp-breakdown-policy" target="_blank" href="${policy.url}">${policy.name}</a><span class="mp-breakdown-score">${policy.score.toFixed(2)}</span></div>`;
                    } catch {
                    }
                });
            } catch {
            }

            // wrap htmlBreakdown
            htmlBreakdown = '<div class="mp-breakdown">' + htmlBreakdown + '</div>';
        }
    }


    let htmlMetaBox = "";
    htmlMetaBox += `<div class="mp-meta-box">`;

    if(!policy_only) {
        htmlMetaBox += `<span class="mp-rank">#`;
        try {
            if ((data.rank + '').length > 0) {
                htmlMetaBox += `${data.rank}`;
            } else {
                htmlMetaBox += "N/A";
            }
        } catch {
        }
        htmlMetaBox += `</span>`;
    }

    if ('image' in data) {
        htmlMetaBox += `<img src="${data.image}">`;
    }

    htmlMetaBox += `<div class="mp-meta">`;
    htmlMetaBox += `<h3 class="mp-name">${data.name}</h3>`;
    if ('party' in data) {
        htmlMetaBox += `<h5 class="mp-party">${data.party}`;
    }
    if ('constituency' in data) {
        htmlMetaBox += ` | ${data.constituency}</h5>`;
    }
    else
    {
        htmlMetaBox += `</h5>`
    }
    if(`email` in data)
    {
        
        htmlMetaBox += `<a href ="/email?mp=${data.name}&score=${data.score}&email=${data.email}" ><h5 class="mp-email">${data.email}</h5></a>`
    }
    htmlMetaBox += `</div>`;

    htmlMetaBox += `<span class="mp-score">`;
    if(!policy_only) {
        try {
            if (data.total_score > 0) {
                htmlMetaBox += data.total_score.toFixed(2);
            } else {
                htmlMetaBox += "N/A";
            }
        } catch {
        }
    }else{
        try {
            if (data.score > 0) {
                htmlMetaBox += data.score.toFixed(2);
            } else {
                htmlMetaBox += "N/A";
            }
        } catch {
        }
    }
    htmlMetaBox += `</span>`;
    htmlMetaBox += `</div>`;

    let html = htmlMetaBox + htmlBreakdown;
    

    let elmListItem = document.createElement("div");
    elmListItem.classList.add("mp-list-item");
    elmListItem.setAttribute("id", mpn);
    // elmListItem.classList.add("expanded");
    elmListItem.innerHTML = html;
    if(!policy_only) {
        elmListItem.style.display = "none";
    }else{
        elmListItem.style.display = "block";
    }

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

//
// function reqMps(){
//     if(Object.keys(mapMpnName).length <= 0){
//         mapMpnName = dummyGetMps;
//     }
// }
//
// function reqMp(mpn){
//     return dummyGetMp[mpn];
// }

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
    console.log(mpns);
    // reqMps();

    // let all_mpns = Object.keys(mapMpnName);
    // all_mpns.forEach(function(mpn){
    //     if (mpns.includes(mpn)) {
    //         if (!(mpn in mapMpElm)) {
    //             // req data from backend
    //
    //             fetch('/api/get_mp/' + mpn)
    //                 .then((response) => {
    //                     return response.json()
    //                 })
    //                 .then((data) => {
    //                     addMpElm(mpn, data);
    //
    //                     let elm = mapMpElm[mpn];
    //                     if (mpns.includes(mpn)) {
    //                         elm.style.display = "block";
    //                     } else {
    //                         elm.style.display = "none";
    //                     }
    //                 })
    //                 .catch((err) => {
    //                 });
    //         }
    //     }
    // });

    hideAllDomMps();
    mpns.forEach(function(mpn){
        if (!(mpn in mapMpElm)) {
                // req data from backend

                fetch('/api/get_mp/' + mpn)
                    .then((response) => {
                        return response.json()
                    })
                    .then((data) => {
                        addMpElm(mpn, data);

                        let elm = mapMpElm[mpn];
                        // if (mpns.includes(mpn)) {
                            elm.style.display = "block";
                        // } else {
                        //     elm.style.display = "none";
                        // }
                    });
            }
        // else {
        //         let elm = mapMpElm[mpn];
        //         if (mpns.includes(mpn)) {
        //             elm.style.display = "block";
        //         } else {
        //             elm.style.display = "none";
        //         }
        //     }
    });

    // go through all in DOM and hide
    document.querySelectorAll(".mp-list .mp-list-item").forEach(function(elm){
        if (mpns.includes(elm.id)){
            elm.style.display = "block";
        } else {
            elm.style.display = "none";
        }
    });

}

function hideAllDomMps(){
    // reqMps();

    let all_mpns = Object.keys(mapMpnName);
    all_mpns.forEach(function(mpn){
        if(mpn in mapMpElm){
            mapMpElm[mpn].style.display = "none";
        }
    });
}

function innerSearch(query){
    if(query.length > MIN_QUERY_LENGTH){
        let mpns = searchMpns(query);
        showMpns(mpns);
    }
    else {
        hideAllDomMps();
    }
}

function search(query) {
    console.log("Searching: " + query);

    // reqMps();

    if(Object.keys(mapMpnName).length <= 0) {
        fetch('/api/get_mps')
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                mapMpnName = data;
                innerSearch(query);
            })
            .catch((err) => {
            });
    } else {
        innerSearch(query);
    }
}