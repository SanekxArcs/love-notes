import confetti from "canvas-confetti";

export function triggerConfetti() {
  // Use emojis directly as confetti
  const emojis = ['😘', '❤️', '💕', '💖', '💓', '💞'];
  const scalar = 2;
  const emojishape = confetti.shapeFromText({ text: "😘", scalar });
  
  confetti({
    particleCount: 50,
    scalar: 2,
    angle: 90,
    spread: 40,
    origin: { y: 1 },
    shapes: [emojishape],
  });
  
  // Add emoji particles separately for better visibility
  emojis.forEach((emoji, index) => {
    setTimeout(() => {
      const scalar = 2;
      const emojishape = confetti.shapeFromText({ text: emoji, scalar });
      confetti({
        particleCount: 50,
        scalar: 1,
        angle: 0 + index * 30,
        spread: 40,
        origin: { y: 1 },
        shapes: [emojishape],
      });
    }, index * 150);
  });
}
