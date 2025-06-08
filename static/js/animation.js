// === HOMEPAGE ANIMATION ===
window.addEventListener("load", () => {
  gsap.registerPlugin(ScrollTrigger);

  // defaults means that all elements will follow these guidelines unless otherwise specified
  const tl = gsap.timeline({ defaults: { duration: 1, ease: "power2.out" } });

  // Fade/slide in header block
  tl.from(".page-header", { opacity: 0, y: -30 });

  // Logo/title
  tl.from(".page-header h1", { y: -20, opacity: 0 }, "-=0.5");

  // Animate nav links EXCLUDING the button
  tl.from(".page-header nav a:not(.pt-button)", {
    y: 20,
    opacity: 0,
    stagger: 0.15
  }, "-=0.3");

  // Animate the button solo
  tl.fromTo(".pt-button",
  { y: 20, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    duration: 0.4,
    ease: "back.out(2)",
    onComplete: () => {
      gsap.set(".pt-button", { clearProps: "all" }); // 🔪 nukes transform + opacity + more
    }
  }, "-=0.625");

  tl.fromTo(".hero-title",
  {
    y: -100,
    scale: 1.75,
    opacity: 0,
    transformOrigin: "center center"
  },
  {
    y: 175,
    opacity: 1,
    duration: 0.7,
    ease: "back.out(1.5)"
  })
  .to(".hero-title", {
    y: 0,
    scale: 1,
    duration: 0.6,
    ease: "power2.out",
    clearProps: "transform" // VERY IMPORTANT: clears the scale so layout normalizes
  }, "+=0.2"); // small pause before shrinking

  tl.from(".hero-subtitle", { x: -20, opacity: 0, duration: 0.6, ease: "back.out(3)"}, "-=0.5");

  let split1 = new SplitType("#promoTitle1", {
    type: "words"
  }), split2 = new SplitType("#promoTitle2", {
    type: "words"
  }), split3 = new SplitType("#promoTxt1", {
    type: "lines"
  }), split4 = new SplitType("#promoTxt2", {
    type: "lines"
  });

  tl.from([split1.words, split2.words], {
    x: 100,
    opacity: 0,
    stagger: 0.05,
    duration: 0.5,
    ease: "back.out(2)"
  }, "-=0.3");

  tl.from([split3.lines, split4.lines], {
    y: 100, 
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    ease: "back.out(1.5)"
  }, "-=0.3");

  tl.from(["#img1", "#img2"], {
    y: -20,
    opacity: 0,
    ease: "power.out(1)",
  }, "-=0.4");

  gsap.to(".parallax-bg", {
  backgroundPositionY: "-800px", // scrolls up
  ease: "none",
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: true
  }
});

});

// === MODAL ANIMATION ===
const modalBox = document.getElementById("modalBox");
const modal = document.getElementById("signupModal");

const modalTL = gsap.timeline({ paused: true });

modalTL
  .set(modal, { opacity: 0, display: "flex" })
  .to(modal, { opacity: 1, duration: 0.3, ease: "power1.out" }, 0)
  .fromTo(
    modalBox, { 
        y: 100, 
        opacity: 0,
        rotation: 10
    }, { 
        y: 0, 
        opacity: 1,
        duration: 0.625,
        rotation: 0, 
        ease: "back.out(4)" 
      }, 0.1
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
    rotation: -22.5,
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