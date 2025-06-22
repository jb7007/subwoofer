// homepage.js
// runs the entrance animation for the landing page using gsap and split-type

window.addEventListener("load", () => {
  // use split-type to separate text into animatable chunks
  let split1 = new SplitType("#promoTitle1", { type: "words" });
  let split2 = new SplitType("#promoTitle2", { type: "words" });
  let split3 = new SplitType("#promoTxt1", { type: "lines" });
  let split4 = new SplitType("#promoTxt2", { type: "lines" });

  // build a timeline for smooth sequencing
  const tl = gsap.timeline({ defaults: { duration: 1, ease: "power2.out" } });

  // fade in the top nav/header block
  tl.from(".page-header", { opacity: 0, y: -30 });

  // slide in the site title
  tl.from(".page-header h1", { y: -20, opacity: 0 }, "-=0.2");

  // animate nav links (excluding the button) one-by-one
  tl.from(".page-header nav a:not(.pt-button)", {
    y: 20,
    opacity: 0,
    stagger: 0.15
  }, "-=0.2");

  // animate the sign-up button with a bounce
  tl.fromTo(".pt-button", 
    { y: 20, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "back.out(2)",
      onComplete: () => {
        // remove any inline transform/opacity styles after animating
        gsap.set(".pt-button", { clearProps: "all" });
      }
    },
    "-=0.625"
  );

  // dramatic hero-title zoom + drop
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
    }
  )
  .to(".hero-title", {
    y: 0,
    scale: 1,
    duration: 0.6,
    ease: "power2.out",
    clearProps: "transform"
  });

  // subtle subtitle slide-in
  tl.from(".hero-subtitle", {
    x: -20,
    opacity: 0,
    duration: 0.6,
    ease: "back.out(3)"
  }, "-=0.5");

  // slide in each word of the promo headers
  tl.from([split1.words, split2.words], {
    x: 100,
    opacity: 0,
    stagger: 0.05,
    duration: 0.5,
    ease: "back.out(2)"
  }, "-=0.3");

  // rise up and fade in each line of promo text
  tl.from([split3.lines, split4.lines], {
    y: 100,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    ease: "back.out(1.5)"
  }, "-=0.3");

  // gently fade in the treble/bass clef images
  tl.from(["#img1", "#img2"], {
    y: -20,
    opacity: 0,
    ease: "power.out(1)"
  }, "-=0.4");
});
