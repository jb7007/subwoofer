// static/js/animation/modal.js
import { openModal } from "../modal.js";

function buildModalInTimeline(modalOverlay, modalBox) {
  return gsap
    .timeline({ paused: true })
    .set(modalOverlay, { opacity: 0 })
    .to(modalOverlay, { opacity: 1, duration: 0.3, ease: "power1.out" }, 0)
    .fromTo(
      modalBox,
      { y: 100, opacity: 0, rotation: 10 },
      { y: 0, opacity: 1, rotation: 0, duration: 0.625, ease: "back.out(4)" },
      0.1
    );
}

let signupModalTL, loginModalTL, logModalTL;

export function signupAnimateModalIn() {
  const overlay = document.getElementById("signupModal");
  const box     = document.getElementById("signupModalBox");
  if (!overlay || !box) return;

  openModal(overlay);
  if (!signupModalTL) {
    signupModalTL = buildModalInTimeline(overlay, box);
  }
  signupModalTL.play();
}

export function loginAnimateModalIn() {
  const overlay = document.getElementById("loginModal");
  const box     = document.getElementById("loginModalBox");
  if (!overlay || !box) return;

  openModal(overlay);
  if (!loginModalTL) {
    loginModalTL = buildModalInTimeline(overlay, box);
  }
  loginModalTL.play();
}

export function logAnimateModalIn() {
  const overlay = document.getElementById("logModal");
  const box     = document.getElementById("practiceModalBox");
  if (!overlay || !box) return;

  openModal(overlay);
  if (!logModalTL) {
    logModalTL = buildModalInTimeline(overlay, box);
  }
  logModalTL.play();
}

function animateModalOut(modalBox, modalOverlay, timelineRef) {
  if (!modalBox || !modalOverlay || !timelineRef) {
    modalOverlay?.classList.remove("active");
    return;
  }
  gsap.to(modalBox, {
    y: 50,
    opacity: 0,
    rotation: -22.5,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => {
      gsap.to(modalOverlay, {
        opacity: 0,
        duration: 0.2,
        ease: "power1.in",
        onComplete: () => {
          modalOverlay.classList.remove("active");
          timelineRef.pause(0);
        }
      });
    }
  });
}

export function signupAnimateModalOut() {
  const overlay = document.getElementById("signupModal");
  const box     = document.getElementById("signupModalBox");
  animateModalOut(box, overlay, signupModalTL);
}

export function loginAnimateModalOut() {
  const overlay = document.getElementById("loginModal");
  const box     = document.getElementById("loginModalBox");
  animateModalOut(box, overlay, loginModalTL);
}

export function logAnimateModalOut() {
  const overlay = document.getElementById("logModal");
  const box     = document.getElementById("practiceModalBox");
  animateModalOut(box, overlay, logModalTL);
}
