// === HOMEPAGE ANIMATION ===
window.addEventListener("load", () => {
  gsap.registerPlugin(ScrollTrigger);

  let split1 = new SplitType("#promoTitle1", {
    type: "words"
  }), split2 = new SplitType("#promoTitle2", {
    type: "words"
  }), split3 = new SplitType("#promoTxt1", {
    type: "lines"
  }), split4 = new SplitType("#promoTxt2", {
    type: "lines"
  });

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

});

// === MODAL ANIMATION ===
// modal boxes
const signupModalBox = document.getElementById("signupModalBox");
const loginModalBox = document.getElementById("loginModalBox");

// modal overlays (dim bg)
const signupModal = document.getElementById("signupModal");
const loginModal = document.getElementById("loginModal");

// timeline for animations
const signupModalTL = gsap.timeline({ paused: true });
const loginModalTL = gsap.timeline({ paused: true });

signupModalTL
  .set(signupModal, { opacity: 0 })
  .to(signupModal, { opacity: 1, duration: 0.3, ease: "power1.out" }, 0)
  .fromTo(
    signupModalBox, { 
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

loginModalTL
  .set(loginModal, { opacity: 0 })
  .to(loginModal, { opacity: 1, duration: 0.3, ease: "power1.out" }, 0)
  .fromTo(
    loginModalBox, { 
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

function signupAnimateModalIn() {
  signupModalTL.play();
}

function loginAnimateModalIn() {
  loginModalTL.play();
}

// Animate out
function signupAnimateModalOut() {
  gsap.to(signupModalBox, {
    y: 50,
    opacity: 0,
    duration: 0.3,
    rotation: -22.5,
    ease: "power2.in",
    onComplete: () => {
      gsap.to(signupModal, {
        opacity: 0,
        duration: 0.2,
        ease: "power1.in",
        onComplete: () => {
          signupModal.classList.remove("active");
          signupModalTL.pause(0); // rewind for next time
        }
      });
    }
  });

}

function loginAnimateModalOut() {
  gsap.to(loginModalBox, {
    y: 50,
    opacity: 0,
    duration: 0.3,
    rotation: -22.5,
    ease: "power2.in",
    onComplete: () => {
      gsap.to(loginModal, {
        opacity: 0,
        duration: 0.2,
        ease: "power1.in",
        onComplete: () => {
          loginModal.classList.remove("active");
          loginModalTL.pause(0); // rewind for next time
        }
      });
    }
  });
}