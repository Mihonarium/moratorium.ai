window.addEventListener('load', function() {
    function email_subscribe(event) {
		event.preventDefault();
	  // Get the email value
	  const email = document.getElementById('email_subscribe').value;

	  // Check if the email is not empty (additional validation can be added)
	  if (email) {
		// Create a FormData object
		const formData = new FormData();
		formData.append('email', email);
		formData.append('form', 'moratorium.ai footer subscription');

		// Use the Fetch API to send the POST request
		fetch('https://forms.moratorium.ai/?subscribe', {
		  method: 'POST',
		  body: formData
		})
		.then(response => response.json())
		.then(data => {
		  console.log(data);
		  if(!data.success) {
			toast.error(data.message, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
				});
				return;
		  }
		  document.getElementsByClassName("footer__copyright")[0].innerHTML = '<p>' + data.message + '</p>';
		})
		.catch((error) => {
		  console.error('Error:', error);
			toast.error('There was an error with your subscription. Please try again.', {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
		});
	  } else {
		toast.error('Please enter a valid email address', {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
	  }
	}

	document.getElementById('subscription_form_footer').addEventListener('submit', email_subscribe);
});