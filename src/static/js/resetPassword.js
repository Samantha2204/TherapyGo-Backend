
let formatIsCorrect = false;
passwordCheck = () => {
  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;
  const messageSpan = document.getElementById("message");
  const submitbutton = document.getElementById("submitbutton");
  const p = document.getElementById("demo");   
  const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/;
  submitbutton.setAttribute("disabled","disabled");

    if (password.length < 6) {
      messageSpan.innerHTML = " password should be at least 6 characters";
      messageSpan.style.color = "red";
      formatIsCorrect = false;
    } else if ((!passwordFormat.test(password))) {
      messageSpan.innerHTML = "Password must include 1 uppercase letter and 1 number."
      messageSpan.style.color = "red";
      formatIsCorrect = false;
    } else {     
      formatIsCorrect = true;
      messageSpan.innerHTML = "";      
    }
}

password2Check = () => {
  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;
  const messageSpan = document.getElementById("message");
  const submitbutton = document.getElementById("submitbutton");
    if (formatIsCorrect && (password == password2)) {
      messageSpan.innerHTML = "Matching!";
      messageSpan.style.color = "green";
      submitbutton.removeAttribute("disabled");    
    } else {
      messageSpan.innerHTML = "Two passwords must match and meet password requirement!";
      messageSpan.style.color = "red";
      submitbutton.setAttribute("disabled","disabled");
    }
}