const modalBox = document.getElementById("modalBox");
const modal = document.getElementById("signupModal");

const modalTL = gsap.timeline({ paused: true });

modalTL
  .set(modal, { opacity: 0, display: "flex" })
  .to(modal, { opacity: 1, duration: 0.3, ease: "power1.out" }, 0)
  .fromTo(
    modalBox, { 
        y: 50, 
        opacity: 0 
    }, { 
        y: -10, 
        opacity: 1, 
        duration: 0.4, 
        ease: "power2.out" 
    }, { 
        y: 5, 
        duration: 0.4, 
        ease: "power2.out" 
    }, { 
        y: 0, 
        duration: 0.4, ease: "power2.out" }, 
        0.1
  );

function animateModalIn() {
  modalTL.play();
}

// Animate out
function animateModalOut() {
  gsap.to(modalBox, {
    y: 50,
    opacity: 0,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => {
      gsap.to(modal, {
        opacity: 0,
        duration: 0.2,
        ease: "power1.in",
        onComplete: () => {
          gsap.set(modal, { display: "none" });
          modalTL.pause(0); // rewind for next time
        }
      });
    }
  });
}