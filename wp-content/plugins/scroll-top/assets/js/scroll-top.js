				// Scroll to Top Button
				var scrollToTopBtn = document.getElementById("scrollToTopBtn");

				window.onscroll = function() {
					scrollFunction();
				};
	
				function scrollFunction() {
					if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
						scrollToTopBtn.style.display = "block";
					} else {
						scrollToTopBtn.style.display = "none";
					}
				}
	
				function topFunction() {
					document.body.scrollTop = 0;
					document.documentElement.scrollTop = 0;
				}
	
				// What's App Button
				var whatsAppBtn = document.getElementById("whatsAppBtn");

				whatsAppBtn.addEventListener("click", function() {
					var phoneNumber = "01684618959"; // Replace with your WhatsApp number
					var message = "Hello! I have a question.";
					var url = "https://wa.me/" + phoneNumber + "?text=" + encodeURIComponent(message);
					window.open(url, "_blank");
				});
