import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { PongGame } from "@carohauta/pong-mini/react";
import "@carohauta/pong-mini/styles.css";

const App: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const shootingStarsRef = useRef<HTMLDivElement[]>([]);
  const animationRef = useRef<number>();
  const particlesDataRef = useRef<
    Array<{
      id: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
    }>
  >([]);
  const shootingStarsDataRef = useRef<
    Array<{
      id: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      opacity: number;
    }>
  >([]);

  const pongOptions = {
    responsive: true,
    shadow: false,
    maxWidth: Math.min(window.innerWidth * 0.9, 800),
  };

  useEffect(() => {
    setIsVisible(true);

    // Create floating particles data
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color:
        Math.random() > 0.7
          ? `hsl(${200 + Math.random() * 60}, 70%, 60%)` // Blue/cyan range
          : Math.random() > 0.4
            ? `hsl(${280 + Math.random() * 40}, 70%, 60%)` // Purple range
            : `hsl(${300 + Math.random() * 20}, 70%, 60%)`, // Pink range
    }));
    particlesDataRef.current = newParticles;
  }, []);

  useEffect(() => {
    const animateParticles = () => {
      particlesDataRef.current = particlesDataRef.current.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + window.innerWidth) % window.innerWidth,
        y: (particle.y + particle.vy + window.innerHeight) % window.innerHeight,
      }));

      // Update DOM directly for performance
      particlesDataRef.current.forEach((particle, index) => {
        const element = particlesRef.current[index];
        if (element) {
          element.style.left = `${particle.x}px`;
          element.style.top = `${particle.y}px`;
        }
      });
    };

    const animateShootingStars = () => {
      // Create new arrays to avoid index misalignment
      const newShootingStarsData: Array<{
        id: number;
        x: number;
        y: number;
        vx: number;
        vy: number;
        opacity: number;
      }> = [];
      const newShootingStarsRefs: HTMLDivElement[] = [];

      // Process each shooting star
      shootingStarsDataRef.current.forEach((star, index) => {
        const newX = star.x + star.vx;
        const newY = star.y + star.vy;
        const newOpacity = star.opacity - 0.008;

        // Check if shooting star should be removed
        if (
          newX > window.innerWidth + 50 ||
          newX < -50 ||
          newY > window.innerHeight + 50 ||
          newY < -50 ||
          newOpacity <= 0
        ) {
          // Remove DOM element
          const element = shootingStarsRef.current[index];
          if (element && element.parentNode) {
            element.parentNode.removeChild(element);
          }
        } else {
          // Update star data
          const updatedStar = {
            ...star,
            x: newX,
            y: newY,
            opacity: newOpacity,
          };

          // Update DOM element
          const element = shootingStarsRef.current[index];
          if (element) {
            element.style.left = `${updatedStar.x}px`;
            element.style.top = `${updatedStar.y}px`;
            element.style.opacity = `${updatedStar.opacity}`;
          }

          // Add to new arrays
          newShootingStarsData.push(updatedStar);
          newShootingStarsRefs.push(element);
        }
      });

      // Update refs with new arrays
      shootingStarsDataRef.current = newShootingStarsData;
      shootingStarsRef.current = newShootingStarsRefs;
    };

    const createShootingStar = () => {
      // Random chance to create a shooting star (1 in 200 chance each frame)
      if (Math.random() < 0.005) {
        // Random starting side (0 = left, 1 = top, 2 = right, 3 = bottom)
        const side = Math.floor(Math.random() * 4);
        let startX = 0;
        let startY = 0;
        let angle = 0;
        const speed = 3 + Math.random() * 5; // Speed between 3-8

        switch (side) {
          case 0: // From left
            startX = -20;
            startY = Math.random() * window.innerHeight;
            angle = (Math.random() * Math.PI) / 2 + Math.PI / 4; // 45 to 135 degrees
            break;
          case 1: // From top
            startX = Math.random() * window.innerWidth;
            startY = -20;
            angle = (Math.random() * Math.PI) / 2 + Math.PI / 2; // 90 to 180 degrees
            break;
          case 2: // From right
            startX = window.innerWidth + 20;
            startY = Math.random() * window.innerHeight;
            angle = (Math.random() * Math.PI) / 2 + Math.PI; // 180 to 270 degrees
            break;
          case 3: // From bottom
            startX = Math.random() * window.innerWidth;
            startY = window.innerHeight + 20;
            angle = (Math.random() * Math.PI) / 2 + (3 * Math.PI) / 2; // 270 to 360 degrees
            break;
        }

        const newShootingStar = {
          id: Date.now() + Math.random(),
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          opacity: 1,
        };

        // Create DOM element directly
        const element = document.createElement("div");
        element.className = "shooting-star";
        element.style.position = "absolute";
        element.style.left = `${newShootingStar.x}px`;
        element.style.top = `${newShootingStar.y}px`;
        element.style.opacity = `${newShootingStar.opacity}`;
        element.style.width = "4px";
        element.style.height = "4px";
        element.style.background = "#fff";
        element.style.borderRadius = "50%";
        element.style.boxShadow =
          "0 0 8px #fff, 0 0 16px #87ceeb, 0 0 24px #87ceeb";
        element.style.zIndex = "5";

        // Add to DOM
        const appElement = document.querySelector(".app");
        if (appElement) {
          appElement.appendChild(element);
        }

        // Add to refs and data
        shootingStarsDataRef.current.push(newShootingStar);
        shootingStarsRef.current.push(element);
      }
    };

    const animate = () => {
      animateParticles();
      animateShootingStars();
      createShootingStar();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="app">
      <div className="sun"></div>
      <div className="planet planet-1"></div>
      <div className="planet planet-2"></div>
      <div className="planet planet-3"></div>
      <div className="planet planet-4"></div>
      <div className="saturn">
        <div className="saturn-rings"></div>
        <div className="saturn-planet"></div>
      </div>

      {particlesDataRef.current.map((particle, index) => (
        <div
          key={particle.id}
          ref={el => {
            if (el) particlesRef.current[index] = el;
          }}
          className="particle"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
          }}
        />
      ))}

      <div className={`content ${isVisible ? "visible" : ""}`}>
        <PongGame className="pong-game-glow" options={pongOptions} />
      </div>
    </div>
  );
};

export default App;
