import React, { useEffect, useRef } from 'react';

const ScrollingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      color: string;
    }> = [];

    // Create floating particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.3 + 0.1,
        color: Math.random() > 0.5 ? '34, 197, 94' : '16, 185, 129', // emerald variations
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update particle position
        particle.y -= particle.speed;
        particle.x += Math.sin(particle.y * 0.01) * 0.5;

        // Reset particle when it goes off screen
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }

        // Update opacity for subtle pulsing
        particle.opacity += (Math.random() - 0.5) * 0.01;
        particle.opacity = Math.max(0.1, Math.min(0.7, particle.opacity));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity})`;
        ctx.fill();

        // Add subtle glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity * 0.1})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
};

export default ScrollingParticles;