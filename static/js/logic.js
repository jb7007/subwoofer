document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("signUp");
  const closeBtn = document.getElementById("closeModal");
  const modal = document.getElementById("signupModal");

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("active");
    animateModalIn(); // ← Call animation
  });

  closeBtn.addEventListener("click", () => {
    animateModalOut(); // ← Call animation
    modal.classList.remove("active")
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      animateModalOut();
      modal.classList.remove("active")
    }
  });
});
