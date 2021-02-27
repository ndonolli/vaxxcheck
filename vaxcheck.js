let coords = {};
const url = 'https://www.walgreens.com/hcschedulersvc/svc/v1/immunizationLocations/availability';

const formatDate = d => {
  let month = '' + (d.getMonth() + 1);
  let day = '' + (d.getDate() + 1);
  let year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

const buildBody = () => ({
  serviceId: "99",
  position: {
      latitude: coords.latitude,
      longitude: coords.longitude
  },
  appointmentAvailability: {
      startDateTime: formatDate(new Date())
  },
  radius: 25
});

const buildOpts = body => ({
  headers: {
    'content-type': 'application/json; charset=UTF-8'
  },
  method: 'POST',
  body: JSON.stringify(body)
});

const toggleSuccess = isSuccess => {
  const success = document.getElementById('success-msg');
  const body = document.body;
  if (isSuccess) {
    success.classList.remove('hidden');
    body.classList = 'success';
  } else {
    success.classList.add('hidden');
    body.classList = 'checking';
  }
}

const availabilityCheck = response => {
  if (response.appointmentsAvailable) {
    console.log('found availability!');
    let n = new Notification('A vaccine appointment is available!');
    n.onclick = function(event) {
      event.preventDefault(); // prevent the browser from focusing the Notification's tab
      window.open('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening', '_blank');
    }
    toggleSuccess(true);
  } else {
    console.log('no availability found');
    toggleSuccess(false);
  }
}

const request = () => {
  let body = buildBody();
  let opts = buildOpts(body);
  fetch(url, opts)
    .then(data => data.json())
    .then(availabilityCheck);
}

const checkLoop = () => {
  const button = document.getElementById('check');
  button.innerHTML = "Checking every minute..."
  button.classList.remove('button');
  request();
  setInterval(request, 60000);
}

let firstMsg = "I'll send a notification like this if an opening pops up!";

const submit = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    coords = pos.coords;
    if (!("Notification" in window)) {
      alert("This browser does not support notifications :(");
    }
  
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      new Notification(firstMsg);
      checkLoop();
    }
  
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          new Notification(firstMsg);
          checkLoop();
        }
      });
    }
  }, err => alert(err.message));
  
}