import React, { useEffect, useState } from 'react';
import './Container.css'; // Import CSS for styling

const Container = () => {
  const [balls, setBalls] = useState([]);

  useEffect(() => {
    const updateBallCount = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Define minimum and maximum number of balls based on viewport size
      const minBalls = 2;
      const maxBalls = Math.max(minBalls, Math.floor((width * height) / 10000)); // Adjust the factor as needed

      // Set balls with random initial positions and velocities
      const newBalls = [];
      for (let i = 0; i < maxBalls; i++) {
        newBalls.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 4, // Random velocity
          vy: (Math.random() - 0.5) * 4, // Random velocity
          radius: 10 + Math.random() * 15, // Random size
        });
      }
      setBalls(newBalls);
    };

    updateBallCount();

    // Update ball count on resize
    window.addEventListener('resize', updateBallCount);
    return () => window.removeEventListener('resize', updateBallCount);
  }, []);

  useEffect(() => {
    const animateBalls = () => {
      const canvas = document.getElementById('ballCanvas');
      const ctx = canvas.getContext('2d');

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x + ball.radius > width || ball.x - ball.radius < 0) {
          ball.vx = -ball.vx;
        }
        if (ball.y + ball.radius > height || ball.y - ball.radius < 0) {
          ball.vy = -ball.vy;
        }

        balls.forEach(otherBall => {
          if (ball === otherBall) return;

          const dx = ball.x - otherBall.x;
          const dy = ball.y - otherBall.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < ball.radius + otherBall.radius) {
            ball.vx = -ball.vx;
            ball.vy = -ball.vy;
            otherBall.vx = -otherBall.vx;
            otherBall.vy = -otherBall.vy;
          }
        });
      });

      requestAnimationFrame(animateBalls);
    };

    const canvas = document.getElementById('ballCanvas');
    canvas.width = window.innerWidth * 0.9; // 90% of viewport width
    canvas.height = window.innerHeight * 0.7; // 70% of viewport height

    animateBalls();
  }, [balls]);

  return (
    <div className="container">
      <canvas id="ballCanvas"></canvas>
    </div>
  );
};

export default Container;
