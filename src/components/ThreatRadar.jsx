import React, { useEffect, useRef } from 'react';

export default function ThreatRadar({ threatLevel = 'Moderate' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let angle = 0;

    // Blip targets
    const blips = [
      { x: 0.35, y: 0.25, label: 'Aerodrome LP', risk: 'Medium', color: '#ffb703' },
      { x: -0.4, y: -0.3, label: 'Moonwell WETH', risk: 'Low', color: '#00f5d4' },
      { x: 0.55, y: -0.45, label: 'Unverified Router', risk: 'Critical', color: '#ff0055' },
      { x: -0.25, y: 0.5, label: 'Uniswap CBETH', risk: 'Low', color: '#00f5d4' },
      { x: -0.6, y: 0.15, label: 'MemeSwap Protocol', risk: 'High', color: '#ff4d6d' }
    ];

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 15;

      ctx.clearRect(0, 0, width, height);

      // Radar Outer Ring & Grids
      ctx.lineWidth = 1;
      for (let r = 0.25; r <= 1; r += 0.25) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 242, 254, ${0.1 + r * 0.1})`;
        ctx.stroke();
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.stroke();

      // Draw Rotating Sweep Beam
      ctx.save();
      ctx.translate(centerX, centerY);
      
      const sweepGradient = ctx.createConicGradient(angle, 0, 0);
      sweepGradient.addColorStop(0, 'rgba(0, 242, 254, 0.4)');
      sweepGradient.addColorStop(0.1, 'rgba(0, 242, 254, 0.05)');
      sweepGradient.addColorStop(0.9, 'transparent');
      sweepGradient.addColorStop(1, 'rgba(0, 242, 254, 0.4)');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Sweep Line
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.85)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      // Draw Blips
      blips.forEach((blip) => {
        const bx = centerX + blip.x * radius;
        const by = centerY + blip.y * radius;

        // Blip Glow
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fillStyle = blip.color;
        ctx.shadowColor = blip.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Blip Label
        ctx.font = '10px "Space Mono", monospace';
        ctx.fillStyle = 'rgba(241, 245, 249, 0.8)';
        ctx.fillText(blip.label, bx + 8, by + 3);
      });

      angle += 0.02;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [threatLevel]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        style={{
          borderRadius: '50%',
          background: 'rgba(5, 10, 20, 0.6)',
          border: '1px solid var(--border-glow)'
        }}
      />
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="live-dot" style={{ background: '#00f5d4', width: 6, height: 6 }} /> Verified Protocol
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="live-dot" style={{ background: '#ff0055', width: 6, height: 6 }} /> Threat Detected
        </span>
      </div>
    </div>
  );
}
