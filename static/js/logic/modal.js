// modal.js
// handles showing and hiding modals (no animations here)

// opens a modal by adding the "active" class
export function openModal(modalElement) {
  // adds the .active class, which makes the modal visible
  modalElement.classList.add("active");
}

// closes a modal by removing "active" and clearing inputs
export function closeModal(modalElement) {
  // removes the .active class so the modal hides
  modalElement.classList.remove("active");

  // selects all inputs inside the modal and clears their values
  modalElement.querySelectorAll("input").forEach(input => {
    input.value = ""; // clear input field
  });

  // optionally could also clear textareas if you want
  modalElement.querySelectorAll("textarea").forEach(area => {
    area.value = ""; // clear textarea field
  });
}
