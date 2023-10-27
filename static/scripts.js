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
	function handleFormSubmission(event, endpoint) {
		event.preventDefault();

		// Automatically retrieve all input values from the form
		const formData = new FormData(event.target);

		fetch(endpoint, {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			if (!data.success) {
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
			event.target.parentNode.innerHTML = data.message;
		})
		.catch((error) => {
			console.error('Error:', error);
			toast.error('There was an error sending your message. Please try again.', {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
		});
	}
	function copyTextToClipboard(text) {
		var textArea = document.createElement("textarea");
		textArea.value = text;

		// Avoid scrolling to bottom
		textArea.style.top = "0";
		textArea.style.left = "0";
		textArea.style.position = "fixed";

		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';
			console.log('Fallback: Copying text command was ' + msg);
		} catch (err) {
			console.error('Fallback: Oops, unable to copy', err);
		}

		document.body.removeChild(textArea);
	}
	function copyShareInfoToClipboard(event) {
		event.preventDefault();
		copyTextToClipboard("https://moratorium.ai");
		document.getElementById("copy_text").innerHTML = "Copied!"
		setTimeout(() => {
			document.getElementById("copy_text").innerHTML = "Copy"
		}, 2000);
	}

	document.getElementById('subscription_form_footer').addEventListener('submit', email_subscribe);
	document.getElementById('share_button_copy').addEventListener('click', copyShareInfoToClipboard);
	
    document.getElementById("contact_form").addEventListener("submit", function(event) {
        handleFormSubmission(event, 'https://forms.moratorium.ai/?submit_form');
    });

    document.getElementById("join_form").addEventListener("submit", function(event) {
        handleFormSubmission(event, 'https://forms.moratorium.ai/?submit_form');
    });
});