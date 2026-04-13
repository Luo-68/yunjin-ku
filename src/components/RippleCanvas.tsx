import { useEffect, useRef } from 'react';

interface RippleCanvasProps {
  className?: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  opacity: number;
}

export default function RippleCanvas({ className = '' }: RippleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripples = useRef<Ripple[]>([]);
  const animationFrame = useRef<number | undefined>(undefined);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler - track position
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current.x = e.clientX - rect.left;
      mousePos.current.y = e.clientY - rect.top;
    };

    // Mouse click handler - create ripple
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createRipple(x, y);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    // Create ripple
    const createRipple = (x: number, y: number) => {
      const ripple: Ripple = {
        x,
        y,
        radius: 0,
        maxRadius: Math.random() * 150 + 200,
        speed: Math.random() * 2 + 3,
        opacity: 0.8
      };
      ripples.current.push(ripple);

      // Limit ripple count
      if (ripples.current.length > 10) {
        ripples.current.shift();
      }
    };

    // Animation loop
    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      // Draw cursor glow
      const cursorGradient = ctx.createRadialGradient(
        mousePos.current.x,
        mousePos.current.y,
        0,
        mousePos.current.x,
        mousePos.current.y,
        100
      );
      cursorGradient.addColorStop(0, 'rgba(212, 175, 55, 0.15)');
      cursorGradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = cursorGradient;
      ctx.fillRect(0, 0, w, h);

      // Update and draw ripples
      ripples.current.forEach((ripple, index) => {
        ripple.radius += ripple.speed;
        ripple.opacity = 1 - ripple.radius / ripple.maxRadius;

        // Remove dead ripples
        if (ripple.radius >= ripple.maxRadius) {
          ripples.current.splice(index, 1);
          return;
        }

        // Draw ripple rings
        for (let i = 0; i < 3; i++) {
          const offset = i * 20;
          const adjustedRadius = ripple.radius - offset;
          
          if (adjustedRadius > 0) {
            const adjustedOpacity = ripple.opacity * (1 - i * 0.3);
            
            // Outer ring
            ctx.strokeStyle = `rgba(212, 175, 55, ${adjustedOpacity * 0.4})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, adjustedRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner glow
            const gradient = ctx.createRadialGradient(
              ripple.x,
              ripple.y,
              adjustedRadius - 10,
              ripple.x,
              ripple.y,
              adjustedRadius + 10
            );
            gradient.addColorStop(0, `rgba(212, 175, 55, 0)`);
            gradient.addColorStop(0.5, `rgba(212, 175, 55, ${adjustedOpacity * 0.2})`);
            gradient.addColorStop(1, `rgba(212, 175, 55, 0)`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, adjustedRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame.current !== undefined) {
        cancelAnimationFrame(animationFrame.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}