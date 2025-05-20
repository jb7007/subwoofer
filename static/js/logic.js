document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("signUp");
  const closeBtn = document.getElementById("closeModal");
  const modal = document.getElementById("signupModal");

  openBtn.addEventListener("click", (e) => {
    e.preventDefault(); // stops the link from jumping
    modal.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  // Close modal if user clicks outside it
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
});
