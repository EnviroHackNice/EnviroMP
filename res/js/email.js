
function generateEmail()
{
    alert();
    YourName = document.getElementById("YourName").value;
    MpName = document.getElementById("mpName").value;
    email = document.getElementById("mpEmail").value;
    YourAdress = document.getElementById("address").value;
    YourNumber = document.getElementById("phone").value;
    score = 0;
    EmailText = `Dear ${MpName},
    
According to EnviroMP.org, I noticed that you have a score of ${score} when it comes to voting on environmentally friendly policies.  
            
This is an issue that is very important to me so I was wondering why you voted the way you do.
    
I look forward to from hearing back from you.
    
Kind regards,
From ${YourName}
${YourNumber}
${YourAdress}`;
    document.getElementById('email').value = EmailText;
}

