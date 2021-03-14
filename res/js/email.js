
var score = 0;
window.onload = function()
{
    var url_string = window.location.href;
    var url = new URL(url_string);
    document.getElementById("mpName").value = url.searchParams.get("mp");
    
    mpEmail = url.searchParams.get("email");
    score = url.searchParams.get("score");
    document.getElementById("mpEmail").innerHTML = mpEmail;
    
}
function generateEmail()
{
    YourName = document.getElementById("YourName").value;
    MpName = document.getElementById("mpName").value;
    email = document.getElementById("mpEmail").value;
    YourAdress = document.getElementById("address").value;
    YourNumber = document.getElementById("phone").value;
    EmailText = `Dear ${MpName},
    
According to EnviroMP.org, I noticed that you have a score of ${score} when it comes to voting on environmentally friendly policies.  
            
This is an issue that is very important to me so I was wondering why you voted the way you do.
    
I look forward to from hearing back from you.
    
Kind regards,
From ${YourName}
${YourNumber}
${YourAdress}`;
    document.getElementById('emailText').value = EmailText;
}

