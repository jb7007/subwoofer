document.addEventListener("DOMContentLoaded", () => {
    // MODAL BUTTONS
    const logOpenBtn = document.getElementById("openLogModal");
    const logCloseBtn = document.getElementById("practiceCloseModal");

    const logModal = document.getElementById("logModal");

    logOpenBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const logForm = document.getElementById("practiceModalBox");
    logForm.reset();
    
    logModal.classList.add("active");
  });

  logCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // TEMPORARY, will replace w gsap animation handling
    logModal.classList.remove("active");

    logModal.querySelectorAll('input').forEach(input => input.value = '');
  });

  window.addEventListener("click", (e) => {
    if (e.target === logModal) {
      e.preventDefault();
      e.stopPropagation();
            
      logModal.classList.remove("active");

      logModal.querySelectorAll('input').forEach(input => input.value = '');
    }
  });

  // modal sign-up/login logic w fetch()
  const logForm = document.getElementById("practiceModalBox");

  logForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const date = document.getElementById("logDate").value;
  const duration = document.getElementById("logDuration").value;
  const instrument = document.getElementById("instrument").value;

  // optional fields (sets to null if doesnt exist)
  const pieceId = document.getElementById("piece")?.value || null; // actual piece user practiced
  const notes = document.getElementById("logNotes")?.value || null;

  const logData = { 
    date, 
    duration, 
    instrument, 
    piece_id: pieceId ? parseInt(pieceId) : null, // if a piece is registered, it'll be set as it's id, otherwise null
    notes: notes ? notes : null };

  try {
    // log in a json string object
    const logResponse = await fetch("api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });

    const logJson = await logResponse.json(); // parse once

    if (logResponse.ok) {
      if (logJson.redirect) {
        window.location.href = logJson.redirect;
      } else {
        console.log("Log success:", logJson.message);
      }
    } else {
      alert(logJson.message || "Log failed.");
    }
  } catch (err) {
    console.error("Log error:", err);
    alert("Network error or server issue.");
  }
});

});